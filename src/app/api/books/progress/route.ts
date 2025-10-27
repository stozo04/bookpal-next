import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseService } from "@/lib/supabaseServer";

export const runtime = "nodejs";

// GET /api/books/progress?id=<bookId>
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const url = new URL(req.url);
    const bookId = url.searchParams.get("id");
    if (!bookId) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const { data, error } = await supabaseService
      .from("book_progress")
      .select("book_id, chapter_idx, page_idx, font_size, width, font_family")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .single();
    if (error && error.code !== "PGRST116") throw error; // not found is fine
    return NextResponse.json({ ok: true, progress: data || null });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}

// POST /api/books/progress { bookId, chapterIdx, pageIdx, fontSize, width, fontFamily }
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { bookId, chapterIdx, pageIdx, fontSize, width, fontFamily } = body || {};
    if (!bookId) return NextResponse.json({ ok: false, error: "Missing bookId" }, { status: 400 });

    const payload: any = {
      user_id: userId,
      book_id: bookId,
      chapter_idx: typeof chapterIdx === 'number' ? chapterIdx : 0,
      page_idx: typeof pageIdx === 'number' ? pageIdx : 0,
      font_size: typeof fontSize === 'number' ? fontSize : null,
      width: width || null,
      font_family: fontFamily || null,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabaseService
      .from("book_progress")
      .upsert(payload, { onConflict: 'user_id,book_id' } as any);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}


