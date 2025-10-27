import { NextRequest } from "next/server";
import { defineWord } from "@/lib/openai";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const word = (searchParams.get("word") || "").trim();
  if (!word) {
    return new Response(JSON.stringify({ error: "Missing word" }), { status: 400, headers: { "content-type": "application/json" } });
  }
  try {
    const def = await defineWord(word);
    return new Response(JSON.stringify({ definition: def }), { status: 200, headers: { "content-type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Failed to define" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}


