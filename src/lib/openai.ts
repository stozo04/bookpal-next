import OpenAI from "openai";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const HAS_KEY = !!process.env.OPENAI_API_KEY;

export async function defineWord(word: string): Promise<string> {
  if (!HAS_KEY) {
    return `Definition (offline mock): “${word}” — a placeholder meaning used when no API key is set.`;
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const prompt = `Give a concise, plain-English definition of the word: ${word}. Keep it to one or two sentences.`;
  const r = await client.responses.create({ model: MODEL, input: prompt,  reasoning: { effort: "minimal" }});
  return r.output_text?.trim() || "No definition available.";
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
