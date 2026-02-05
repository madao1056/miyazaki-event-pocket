import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateClientHash } from "@/lib/hash";
import type { PeriodFilter, SortType } from "@/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const municipalityId = searchParams.get("municipality_id");
  const period = (searchParams.get("period") || "all") as PeriodFilter;
  const sort = (searchParams.get("sort") || "newest") as SortType;

  let query = supabase
    .from("comments")
    .select("*, municipality:municipalities(*)");

  if (municipalityId) {
    query = query.eq("municipality_id", Number(municipalityId));
  }

  if (period !== "all") {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0);
    }

    query = query.gte("created_at", startDate.toISOString());
  }

  switch (sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "likes":
      query = query.order("like_count", { ascending: false });
      break;
    case "random":
      break;
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let comments = data || [];

  if (sort === "random") {
    comments = comments.sort(() => Math.random() - 0.5);
  }

  return NextResponse.json(comments, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { municipality_id, content } = body;

  if (!municipality_id || !content) {
    return NextResponse.json(
      { error: "municipality_id and content are required" },
      { status: 400 }
    );
  }

  if (content.length > 500) {
    return NextResponse.json(
      { error: "Content must be 500 characters or less" },
      { status: 400 }
    );
  }

  const clientHash = await generateClientHash();

  const { data, error } = await supabase
    .from("comments")
    .insert({
      municipality_id,
      content,
      client_hash: clientHash,
    })
    .select("*, municipality:municipalities(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, content } = body;

  if (!id || !content) {
    return NextResponse.json(
      { error: "id and content are required" },
      { status: 400 }
    );
  }

  if (content.length > 500) {
    return NextResponse.json(
      { error: "Content must be 500 characters or less" },
      { status: 400 }
    );
  }

  const clientHash = await generateClientHash();

  // 投稿を取得して権限チェック
  const { data: comment } = await supabase
    .from("comments")
    .select("*")
    .eq("id", id)
    .single();

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  // client_hashが一致するか確認
  if (comment.client_hash !== clientHash) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // 1時間以内か確認
  const createdAt = new Date(comment.created_at);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  if (createdAt < oneHourAgo) {
    return NextResponse.json(
      { error: "Edit time expired (1 hour limit)" },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("comments")
    .update({ content })
    .eq("id", id)
    .select("*, municipality:municipalities(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
