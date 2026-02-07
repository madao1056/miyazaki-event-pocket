import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateClientHash } from "@/lib/hash";
import type { SortType } from "@/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const municipalityId = searchParams.get("municipality_id");
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");
  const sort = (searchParams.get("sort") || "newest") as SortType;
  const keyword = searchParams.get("keyword");

  let query = supabase
    .from("comments")
    .select("*, municipality:municipalities(*)");

  if (municipalityId) {
    query = query.eq("municipality_id", Number(municipalityId));
  }

  if (keyword) {
    query = query.ilike("content", `%${keyword}%`);
  }

  // 日付フィルター: created_atまたはevent_dateのどちらかが範囲内であればマッチ
  if (dateFrom && dateTo) {
    // 両方指定: created_atかevent_dateのどちらかが範囲内
    query = query.or(
      `and(created_at.gte.${dateFrom}T00:00:00,created_at.lte.${dateTo}T23:59:59),and(event_date.gte.${dateFrom},event_date.lte.${dateTo})`
    );
  } else if (dateFrom) {
    // 開始日のみ: created_atかevent_dateのどちらかが開始日以降
    query = query.or(
      `created_at.gte.${dateFrom}T00:00:00,event_date.gte.${dateFrom}`
    );
  } else if (dateTo) {
    // 終了日のみ: created_atかevent_dateのどちらかが終了日以前
    query = query.or(
      `created_at.lte.${dateTo}T23:59:59,event_date.lte.${dateTo}`
    );
  }

  switch (sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "oldest":
      query = query.order("created_at", { ascending: true });
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
  const { municipality_id, content, event_date, media_urls } = body;

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

  // 挿入データを構築（event_date, media_urlsは任意）
  const insertData: {
    municipality_id: number;
    content: string;
    client_hash: string;
    event_date?: string;
    media_urls?: string[];
  } = {
    municipality_id,
    content,
    client_hash: clientHash,
  };

  if (event_date) {
    insertData.event_date = event_date;
  }

  if (media_urls && Array.isArray(media_urls) && media_urls.length > 0) {
    insertData.media_urls = media_urls;
  }

  const { data, error } = await supabase
    .from("comments")
    .insert(insertData)
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
