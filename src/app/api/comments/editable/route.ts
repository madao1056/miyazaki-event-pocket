import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateClientHash } from "@/lib/hash";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const commentIds = searchParams.get("ids");

  if (!commentIds) {
    return NextResponse.json({ editable_ids: [] });
  }

  const clientHash = await generateClientHash();
  const ids = commentIds.split(",");
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("comments")
    .select("id")
    .eq("client_hash", clientHash)
    .in("id", ids)
    .gte("created_at", oneHourAgo);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const editableIds = (data || []).map((c) => c.id);
  return NextResponse.json({ editable_ids: editableIds });
}
