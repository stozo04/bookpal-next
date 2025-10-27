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
    const { id, imageUrl, source, source_id, source_url } = await req.json();
    if (!id || !imageUrl) return NextResponse.json({ ok: false, error: 'Missing params' }, { status: 400 });

    const { data: book, error: e1 } = await supabaseService.from('books').select('user_id').eq('id', id).single();
    if (e1 || !book || book.user_id !== userId) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

    const imgRes = await fetch(imageUrl);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const path = `${id}.jpg`;
    const { error: upErr } = await supabaseService.storage.from('covers').upload(path, buf, { upsert: true, contentType: 'image/jpeg' });
    if (upErr) throw upErr;

    const attribution: any = { source: source || 'openlibrary' };
    if (source_id) attribution.source_id = source_id;
    if (source_url || imageUrl) attribution.link = source_url || imageUrl;

    const { error: updErr } = await supabaseService.from('books').update({
      cover_storage_path: path,
      cover_url: imageUrl,
      cover_source: attribution.source,
      cover_attribution: attribution
    } as any).eq('id', id);
    if (updErr) throw updErr;
    return NextResponse.json({ ok: true, path });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 500 });
  }
}


