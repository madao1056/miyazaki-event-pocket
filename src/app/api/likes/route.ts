import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateClientHash } from "@/lib/hash";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { comment_id } = body;

  if (!comment_id) {
    return NextResponse.json(
      { error: "comment_id is required" },
      { status: 400 }
    );
  }

  const clientHash = await generateClientHash();

  const { data: existingLike } = await supabase
    .from("likes")
    .select("id")
    .eq("comment_id", comment_id)
    .eq("client_hash", clientHash)
    .single();

  if (existingLike) {
    // 既にいいね済み → 削除（トグル）
    const { error: deleteError } = await supabase
      .from("likes")
      .delete()
      .eq("id", existingLike.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, action: "unliked" }, { status: 200 });
  }

  // いいねしていない → 追加
  const { error: likeError } = await supabase
    .from("likes")
    .insert({
      comment_id,
      client_hash: clientHash,
    });

  if (likeError) {
    return NextResponse.json({ error: likeError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, action: "liked" }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const commentIds = searchParams.get("comment_ids");

  if (!commentIds) {
    return NextResponse.json({ error: "comment_ids is required" }, { status: 400 });
  }

  const clientHash = await generateClientHash();
  const ids = commentIds.split(",");

  const { data, error } = await supabase
    .from("likes")
    .select("comment_id")
    .eq("client_hash", clientHash)
    .in("comment_id", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const likedIds = (data || []).map((like) => like.comment_id);
  return NextResponse.json({ liked_ids: likedIds });
}
