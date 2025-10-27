import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseService } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { id, title, author, genre } = body || {};
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    const { data: book, error: err } = await supabaseService.from('books').select('user_id').eq('id', id).single();
    if (err || !book || book.user_id !== userId) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

    const update: any = {};
    if (typeof title === 'string') update.title = title;
    if (typeof author === 'string') update.author = author;
    if (typeof genre === 'string') update.genre = genre;

    if (Object.keys(update).length === 0) return NextResponse.json({ ok: false, error: 'No changes' }, { status: 400 });

    const { error } = await supabaseService.from('books').update(update).eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 500 });
  }
}


