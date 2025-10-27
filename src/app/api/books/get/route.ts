import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseService } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const bookId = url.searchParams.get("id");
    if (!bookId) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const { data, error } = await supabaseService
      .from("books")
      .select("id, title, author, chapters, characters, user_id, mime_type, cover_storage_path, cover_url, cover_source, cover_attribution, genre")
      .eq("id", bookId)
      .single();
    if (error) throw error;
    if (!data || data.user_id !== userId) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, book: data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}


