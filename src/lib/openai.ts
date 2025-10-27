import OpenAI from "openai";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const HAS_KEY = !!process.env.OPENAI_API_KEY;

export async function defineWord(word: string): Promise<string> {
  if (!HAS_KEY) {
    return `Definition (offline mock): “${word}” — a placeholder meaning used when no API key is set.`;
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const prompt = `Give a concise, plain-English definition of the word: ${word}. Keep it to one or two sentences.`;
  const r = await client.responses.create({ model: MODEL, input: prompt });
  return r.output_text?.trim() || "No definition available.";
}

export async function summarizeChunk(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!HAS_KEY) {
    const first = trimmed.split(/[\.\!\?]/)[0]?.slice(0, 180) || trimmed.slice(0, 180);
    return first + (first.endsWith(".") ? "" : ".");
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const prompt = `Summarize the following text in 1-2 concise sentences for a chapter preview. Avoid adding information not present.\n\nTEXT:\n${trimmed}`;
  const r = await client.responses.create({ model: MODEL, input: prompt });
  return r.output_text?.trim() || trimmed.slice(0, 180);
}

export async function extractAuthorAndTitle(sample: string): Promise<{ author?: string; title?: string }> {
  const text = sample.slice(0, 4000);
  if (!HAS_KEY) {
    const mAuthor = /author\s*[:\-]\s*(.+)/i.exec(text);
    const mTitle = /title\s*[:\-]\s*(.+)/i.exec(text);
    return { author: mAuthor?.[1]?.trim(), title: mTitle?.[1]?.trim() };
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const prompt = `From the text snippet below, if clearly present, extract the book title and author. If unsure, leave blank. Respond strictly as: Title: <title or blank>\nAuthor: <author or blank>\n\nSNIPPET:\n${text}`;
  const r = await client.responses.create({ model: MODEL, input: prompt});
  const out = r.output_text || "";
  const author = /Author:\s*(.*)/i.exec(out)?.[1]?.trim() || undefined;
  const title = /Title:\s*(.*)/i.exec(out)?.[1]?.trim() || undefined;
  return { author, title };
}

export async function extractCharacters(text: string): Promise<string[]> {
  const snippet = text.slice(0, 8000);
  if (!HAS_KEY) {
    // Very naive fallback: pick capitalized tokens as mock names
    const names = Array.from(new Set((snippet.match(/\b[A-Z][a-z]{2,}\b/g) || []))).slice(0, 6);
    return names.length ? names : ["The Time Traveller", "Filby", "Psychologist", "Medical Man", "Narrator"];
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const prompt = `From the text below, list the 5–7 most important character names only (no descriptions, one per line). If unsure, skip.

TEXT:\n${snippet}`;
  const r = await client.responses.create({ model: MODEL, input: prompt });
  const out = r.output_text?.trim() || '';
  const lines = out.split(/\r?\n/).map(s => s.trim()).filter(Boolean).slice(0, 7);
  return lines;
}

export type CharacterProfile = {
  name: string;
  aliases?: string[];
  role?: string;
  description?: string;
  personality_traits?: string[];
  characteristic_traits?: string[];
  relationships?: { with: string; relation: string }[];
};

export async function extractCharactersRich(text: string): Promise<CharacterProfile[]> {
  const sample = text.slice(0, 60000);
  if (!HAS_KEY) {
    const names = await extractCharacters(sample);
    return names.map((n) => ({ name: n }));
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const prompt = `From the book text below, extract the 5–15 most important characters and return ONLY a JSON array.
Each item must have: name (string); aliases (string[], optional); role (string, optional);
description (string, optional, 1 sentence); personality_traits (string[], optional, 3–6);
characteristic_traits (string[], optional, 3–6); relationships (array of { with: string, relation: string }, optional).
No commentary before or after the JSON.

TEXT:\n${sample}`;
  const r = await client.responses.create({ model: MODEL, input: prompt });
  const out = r.output_text?.trim() || "[]";
  // Try direct JSON parse, else attempt to strip code fences
  const tryParse = (s: string) => {
    try { return JSON.parse(s); } catch { return null; }
  };
  let parsed = tryParse(out);
  if (!parsed) {
    const m = /```(?:json)?\s*([\s\S]*?)```/i.exec(out);
    if (m) parsed = tryParse(m[1]);
  }
  if (!parsed || !Array.isArray(parsed)) return [];
  return parsed as CharacterProfile[];
}

// import OpenAI from "openai";
// //import { z } from "zod";
// import type { Book } from "./types";

// const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
// const HAS_KEY = !!process.env.OPENAI_API_KEY;

// // const BookSchema = z.object({
// //   title: z.string(),
// //   author: z.string(),
// //   chapters: z.array(z.object({
// //     title: z.string(),
// //     content: z.string()
// //   })).min(1),
// //   characters: z.array(z.string()).max(5)
// // });

// export async function structureBookFromText(textContent: string): Promise<Book> {
//   // Dev mock if no key
//   if (!HAS_KEY) {
//     const paras = textContent.split(/\n\s*\n/).filter(p => p.trim()).slice(0, 10);
//     return {
//       title: "Mock Book Title",
//       author: "Unknown Author",
//       chapters: paras.map((p, i) => ({ title: `Mock Chapter ${i + 1}`, content: p })),
//       characters: ["Alice", "Bob", "Charlie", "Diana", "Eve"]
//     };
//   }

//   const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

//   const schema = {
//     type: "object",
//     properties: {
//       title: { type: "string", description: "Title of the book if present in text." },
//       author: { type: "string", description: "Author. If unknown, return 'Unknown Author'." },
//       chapters: {
//         type: "array",
//         description: "Logical chapters starting from the beginning of the text.",
//         items: {
//           type: "object",
//           properties: {
//             title: { type: "string" },
//             content: { type: "string" }
//           },
//           required: ["title", "content"],
//           additionalProperties: false
//         },
//         minItems: 1
//       },
//       characters: {
//         type: "array",
//         description: "Top 5 main characters by prominence (names only).",
//         items: { type: "string" },
//         maxItems: 5
//       }
//     },
//     required: ["title", "author", "chapters", "characters"],
//     additionalProperties: false
//   } as const;

//   const prompt =
// `Analyze the book text below.
// - Extract title and author (or "Unknown Author").
// - Split into logical chapters with titles (infer sensible titles if not obvious). The first chapter must begin at the start.
// - Only use content from the text; do not invent.
// - Extract TOP 5 character names by prominence.
// Return ONLY JSON matching the schema.

// TEXT:
// ${textContent}`;

//   const r = await client.responses.create({
//     model: MODEL,
//     input: prompt,
//     temperature: 0.2,
//     response_format: {
//       type: "json_schema",
//       json_schema: { name: "Book", schema, strict: true }
//     }
//   });

//   const json = r.output_text || "{}";
//   const parsed = BookSchema.safeParse(JSON.parse(json));
//   if (!parsed.success) {
//     throw new Error("AI returned invalid structure");
//   }
//   return parsed.data;
// }
