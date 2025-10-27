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
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });

    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!["txt", "pdf"].includes(ext)) {
      return NextResponse.json({ ok: false, error: "Only .txt and .pdf supported" }, { status: 400 });
    }

    // Upload to Supabase Storage (bucket: books)
    const path = `${userId}/${Date.now()}_${file.name}`;
    const { data: upRes, error: upErr } = await supabaseService.storage.from("books").upload(path, file, {
      contentType: file.type || (ext === "pdf" ? "application/pdf" : "text/plain"),
      upsert: false,
    });
    if (upErr) throw upErr;

    // Create DB row (minimal metadata; structuring can happen later)
    const title = file.name.replace(/\.[^.]+$/, "");
    const { data: row, error: dbErr } = await supabaseService
      .from("books")
      .insert({
        user_id: userId,
        title,
        author: "Unknown",
        characters: [],
        chapters: [],
        storage_path: upRes?.path || path,
        mime_type: file.type || (ext === "pdf" ? "application/pdf" : "text/plain"),
        status: ext === 'pdf' ? 'pending' : null,
      } as any)
      .select()
      .single();
    if (dbErr) throw dbErr;

    return NextResponse.json({ ok: true, book: row });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Upload failed" }, { status: 500 });
  }
}


