import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { structureBookFromText } from "@/lib/openai";
import { supabaseAnon } from "@/lib/supabaseServer";
import type { Book, DBBook } from "@/lib/types";

export const runtime = "nodejs";
const ONE_MB = 1_000_000;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse text or file
    const ct = req.headers.get("content-type") || "";
    let text = "";

    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file") as File | null;
      const textField = form.get("text") as string | null;

      if (file) {
        if (file.size > ONE_MB) {
          return NextResponse.json(
            { ok: false, error: "File too large (>1MB). Chunking soon." },
            { status: 400 }
          );
        }
        text = await file.text();
      } else if (typeof textField === "string" && textField.length > 0) {
        text = textField;
      } else {
        return NextResponse.json(
          { ok: false, error: "No file or text provided." },
          { status: 400 }
        );
      }
    } else {
      const body = await req.json().catch(() => ({}));
      text = body?.text || "";
      if (!text)
        return NextResponse.json(
          { ok: false, error: "Missing text." },
          { status: 400 }
        );
      if (text.length > ONE_MB) {
        return NextResponse.json(
          { ok: false, error: "Text too large (>1MB). Chunking soon." },
          { status: 400 }
        );
      }
    }

    // AI structure
    const book: Book = await structureBookFromText(text);

    // Persist
    const { data, error } = await supabaseAnon
      .from("books")
      .insert({
        user_id: userId,
        title: book.title,
        author: book.author,
        characters: book.characters,
        chapters: book.chapters, // jsonb column
      })
      .select()
      .single<DBBook>();

    if (error) throw error;

    return NextResponse.json({ ok: true, bookId: data.id, book: data });
  } catch (e: any) {
    console.error("structure error:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to structure/save" },
      { status: 500 }
    );
  }
}
