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

    const form = await req.formData();
    const id = String(form.get("id") || "").trim();
    const file = form.get("file") as File | null;
    if (!id || !file) return NextResponse.json({ ok: false, error: "Missing id or file" }, { status: 400 });

    // verify ownership
    const { data: book, error: e1 } = await supabaseService.from('books').select('user_id').eq('id', id).single();
    if (e1 || !book || book.user_id !== userId) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

    // persist image to covers bucket
    const origName = (file as any)?.name || `upload_${Date.now()}`;
    const ext = (origName.split('.').pop() || '').toLowerCase();
    const safeExt = ['png','jpg','jpeg','webp','gif'].includes(ext) ? ext : 'jpg';
    const path = `${id}.${safeExt}`;
    const contentType = file.type || (safeExt === 'png' ? 'image/png' : safeExt === 'webp' ? 'image/webp' : safeExt === 'gif' ? 'image/gif' : 'image/jpeg');

    const buf = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await supabaseService.storage.from('covers').upload(path, buf, { upsert: true, contentType });
    if (upErr) throw upErr;

    const { error: updErr } = await supabaseService
      .from('books')
      .update({ cover_storage_path: path, cover_source: 'upload', cover_url: null, cover_attribution: { source: 'upload' } as any })
      .eq('id', id);
    if (updErr) throw updErr;

    return NextResponse.json({ ok: true, path });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 500 });
  }
}

 
