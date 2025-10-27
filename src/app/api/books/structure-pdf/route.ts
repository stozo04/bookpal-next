import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseService } from "@/lib/supabaseServer";
// @ts-ignore - 'pdf-parse' has no types
import pdfParse from "pdf-parse";
import { extractAuthorAndTitle, summarizeChunk } from "@/lib/openai";

export const runtime = "nodejs";

async function logStep(bookId: string, message: string, level: 'info' | 'error' = 'info') {
  try { await supabaseService.from('book_jobs').insert({ book_id: bookId, level, message } as any); } catch {}
}

async function summarizeWithRetry(text: string, maxRetries = 3): Promise<string> {
  let attempt = 0; let delay = 800;
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  while (attempt <= maxRetries) {
    try { return await summarizeChunk(text); }
    catch { if (attempt === maxRetries) throw new Error('summarize failed'); await sleep(delay + Math.floor(Math.random()*250)); delay = Math.min(delay*2, 6000); attempt++; }
  }
  return text.slice(0, 180);
}

// Stub endpoint to kick off background PDF structuring later
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const { bookId } = await req.json();
    if (!bookId) return NextResponse.json({ ok: false, error: "Missing bookId" }, { status: 400 });

    // Get storage path
    const { data: book, error: bookErr } = await supabaseService
      .from("books")
      .select("id, storage_path, mime_type, title, author")
      .eq("id", bookId)
      .single();
    if (bookErr) throw bookErr;
    if (!book?.storage_path) return NextResponse.json({ ok: false, error: "No storage path" }, { status: 400 });

    await logStep(bookId, 'Queued structuring');

    // Download PDF from storage (public bucket assumed or signed)
    const { data: fileRes, error: dlErr } = await supabaseService.storage.from("books").download(book.storage_path);
    if (dlErr) throw dlErr;
    await logStep(bookId, 'Downloaded PDF');

    // Parse PDF to text
    const arrBuf = await fileRes.arrayBuffer();
    const parsed = await pdfParse(Buffer.from(arrBuf));
    const text = parsed.text || "";
    if (!text) return NextResponse.json({ ok: false, error: "Empty PDF text" }, { status: 400 });
    await logStep(bookId, `Parsed text (${text.length} chars)`);

    // Naive chunking: split by double newlines, group into ~1500 word chunks
    const paras: string[] = text.split(/\n\s*\n/).map((p: string) => p.trim()).filter(Boolean);
    const chunks: string[] = [];
    let buf: string[] = [];
    let wc = 0;
    for (const p of paras) {
      const w = p.split(/\s+/).length;
      if (wc + w > 1500 && buf.length) {
        chunks.push(buf.join("\n\n"));
        buf = [];
        wc = 0;
      }
      buf.push(p); wc += w;
    }
    if (buf.length) chunks.push(buf.join("\n\n"));
    await logStep(bookId, `Chunked into ${chunks.length} sections`);

    // Summarize each chunk into a chapter (OpenAI-backed with fallback)
    const batchSize = 3; const chapters: { title: string; content: string; summary?: string }[] = [];
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const t0 = Date.now();
      const summarized = await Promise.all(batch.map((ch) => summarizeWithRetry(ch)));
      const dt = Date.now() - t0;
      summarized.forEach((summary, j) => chapters.push({ title: `Chapter ${i + j + 1}`, content: batch[j], summary }));
      await logStep(bookId, `Summarized ${Math.min(i + batchSize, chunks.length)}/${chunks.length} (batch ${i/batchSize + 1} in ${dt}ms)`);
    }

    // Try to extract author/title from the first ~2 chunks
    let author = book.author || undefined;
    let titleGuess = book.title || undefined;
    try {
      const headSample = chunks.slice(0, 2).join("\n\n");
      const meta = await extractAuthorAndTitle(headSample);
      if (meta.author) author = meta.author;
      if (meta.title) titleGuess = meta.title;
      await logStep(bookId, `Metadata: title="${titleGuess || book.title || ''}" author="${author || book.author || ''}"`);
    } catch {}

    // Update book record
    await supabaseService
      .from("books")
      .update({ chapters, status: null, author: author || book.author, title: titleGuess || book.title } as any)
      .eq("id", bookId);
    await logStep(bookId, `Updated book record (chapters=${chapters.length})`);

    return NextResponse.json({ ok: true, chaptersCount: chapters.length, author: author || null, title: titleGuess || null });
  } catch (e: any) {
    try { const url = new URL(req.url); const bookId = url.searchParams.get('bookId') || ''; if (bookId) await logStep(bookId, `Error: ${e?.message || e}`, 'error'); } catch {}
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}


