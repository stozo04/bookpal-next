import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { extractCharacters } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    const { text } = await req.json();
    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return NextResponse.json({ ok: false, error: 'Missing text' }, { status: 400 });
    }
    const characters = await extractCharacters(text);
    return NextResponse.json({ ok: true, characters });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 500 });
  }
}


