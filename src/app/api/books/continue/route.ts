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
    const limit = Math.max(1, Math.min(10, parseInt(url.searchParams.get("limit") || "5", 10)));

    const { data: rows, error: progErr } = await supabaseService
      .from("book_progress")
      .select("book_id, chapter_idx, page_idx, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (progErr) throw progErr;

    const orderedIds: string[] = [];
    const byId: Record<string, { book_id: string; chapter_idx: number | null; page_idx: number | null; updated_at: string } > = {} as any;
    (rows || []).forEach((r: any) => {
      if (!byId[r.book_id]) orderedIds.push(r.book_id);
      byId[r.book_id] = r;
    });

    if (orderedIds.length === 0) return NextResponse.json({ ok: true, items: [] });

    const { data: books, error: bookErr } = await supabaseService
      .from("books")
      .select("id, user_id, title, author, chapters, characters, mime_type, cover_storage_path, cover_url, cover_source, genre, created_at")
      .in("id", orderedIds);
    if (bookErr) throw bookErr;

    const booksById = new Map<string, any>((books || []).map((b: any) => [b.id, b]));

    const items = orderedIds
      .map((id) => {
        const book = booksById.get(id);
        if (!book || book.user_id !== userId) return null;
        const prog = byId[id];
        const chCount = Array.isArray(book.chapters) ? book.chapters.length : 0;
        if (!chCount) return null; // skip books without chapters
        const chapterIdx = typeof prog.chapter_idx === 'number' ? prog.chapter_idx : 0;
        const percent = Math.max(0, Math.min(100, Math.floor(((chapterIdx + 1) / chCount) * 100)));
        return { book, progress: { chapter_idx: chapterIdx, page_idx: prog.page_idx ?? 0, updated_at: prog.updated_at }, percent };
      })
      .filter(Boolean);

    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}


