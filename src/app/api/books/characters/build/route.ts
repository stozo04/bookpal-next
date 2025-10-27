import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseService } from "@/lib/supabaseServer";
import { extractCharactersRich } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const { bookId } = await req.json();
    if (!bookId) return NextResponse.json({ ok: false, error: "Missing bookId" }, { status: 400 });

    const { data: book, error } = await supabaseService
      .from('books')
      .select('id, user_id, title, author, chapters')
      .eq('id', bookId)
      .single();
    if (error || !book || book.user_id !== userId) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

    const chapters = (book as any)?.chapters as Array<{ title?: string; content?: string }> | undefined;
    if (!Array.isArray(chapters) || chapters.length === 0) {
      return NextResponse.json({ ok: false, error: 'No chapters to analyze' }, { status: 400 });
    }

    const text = chapters.map((c) => `${c.title || ''}\n\n${(c.content || '').replace(/\t+/g, ' ')}`).join('\n\n');
    const characters = await extractCharactersRich(text);

    await supabaseService.from('books').update({ characters: characters as any }).eq('id', bookId);

    return NextResponse.json({ ok: true, count: characters.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 500 });
  }
}


