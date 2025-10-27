# ✅ E‑Reader AI MVP Implementation Checklist

This file tracks every key milestone from setup → MVP launch.  
Use it directly inside Cursor — you can check off boxes `[x]` as you complete tasks.

---

## 🪩 0. Setup & Prep
- [ ] Install **Markdown Preview Mermaid Support** (or **Markdown Preview Enhanced**) in Cursor.
- [ ] Create branch `feat/ai-reader-mvp-foundations`.
- [ ] Verify `/dev` route renders (`npm run dev` → visit `/dev`).
- [ ] Add `.editorconfig`, ensure Prettier/Eslint passes.

---

## 🧭 1. Developer Control Center (`/dev` page)
- [ ] Add buttons to ping `/api/openai/ping`, `/api/debug-env`, `/api/books/structure`.
- [ ] Add text box for “Test Retrieval” → calls `/api/library/search`.
- [ ] Confirm all routes return mocked JSON.
- [ ] ✅ Definition of done: /dev shows API statuses + test retrieval.

---

## 🗂️ 2. Folder & Docs Cleanup
- [ ] Move diagrams into subfolders: `architecture/`, `flows/`, `management/`.
- [ ] Ensure all `.md` files render Mermaid correctly in Cursor preview.
- [ ] Add `visual_diagrams/README.md` (done ✅ if you already have it).
- [ ] Remove `FK ->` arrows and `// comments` inside Mermaid ER diagrams.

---

## ⚙️ 3. Env & Config
- [ ] Add `.env.example` with `OPENAI_API_KEY`, `SUPABASE_*`, `REDIS_URL`.
- [ ] Add `docs/SETUP.md` describing how to start locally.
- [ ] Add `/api/health` endpoint returning `{ ok: true, now: <iso> }`.
- [ ] ✅ Definition of done: app boots with no missing env errors.

---

## 🧱 4. Supabase Schema Skeleton
- [ ] Create SQL migration files under `/supabase/migrations/`:
  - [ ] `000_init_vectors.sql` → `book_chunks` + pgvector index.
  - [ ] `001_sessions.sql` → `reader_sessions`, `session_memories`.
  - [ ] `002_indices.sql` → minimal indexes.
- [ ] Add placeholders for `characters`, `visuals`, and `credits_wallet` tables.
- [ ] ✅ Definition of done: schema compiles; not necessarily migrated yet.

---

## 🔌 5. API Endpoint Stubs
Create minimal mock routes that return static JSON:
- [ ] `/api/library/search`
- [ ] `/api/session/load`
- [ ] `/api/session/update`
- [ ] `/api/summarize/paragraph`
- [ ] `/api/summarize/chapter`
- [ ] `/api/define`
- [ ] `/api/catchup`
- [ ] `/api/visualize/character`
- [ ] `/api/visualize/scene`
- [ ] ✅ Definition of done: all routes respond within <300 ms mocked.

---

## 📚 6. Seed Test Book (Fixtures)
- [ ] Create `fixtures/books/test_novel/` with:
  - [ ] `text.txt`
  - [ ] `sections.json`
  - [ ] `chunks.json` (mock retrieval dataset).
- [ ] Make `/api/library/search` use this mock file.
- [ ] ✅ Definition of done: “Test Retrieval” shows 12 mock snippets.

---

## 📖 7. Reader Page Prototype (`/reader/[id]/page.tsx`)
- [ ] Add action bar with buttons: **Summarize**, **Define**, **Catch Me Up**.
- [ ] Wire buttons to corresponding mock API routes.
- [ ] Render results in right‑side panel or modal.
- [ ] ✅ Definition of done: reader page displays mock summaries/defs/recaps.

---

## 🧠 8. Real Retrieval (pgvector)
- [ ] Add embedding util under `src/lib/embedding.ts`.
- [ ] Implement ingestion job (read text → chunk → embed → insert into `book_chunks`).
- [ ] Replace mock `/api/library/search` with pgvector query (top‑K retrieval).
- [ ] ✅ Definition of done: /dev “Test Retrieval” returns DB results.

---

## 💾 9. Real Session Memory
- [ ] Implement `/api/session/load` → reads/creates DB row.
- [ ] Implement `/api/session/update` → updates `running_summary`.
- [ ] Ensure `last_locator` updates when reading progresses.
- [ ] ✅ Definition of done: reloading page resumes from same point.

---

## 🎨 10. Visuals + Credits System
- [ ] Create in‑memory credits ledger or Supabase table.
- [ ] Hook `/api/visualize/*` to check credits and return cached images.
- [ ] Add gallery on reader page showing last 4 visuals.
- [ ] ✅ Definition of done: clicking visualize decrements credit once, reuses cached image.

---

## 🧩 11. Quality & Docs
- [ ] Verify all Mermaid diagrams render in Cursor preview.
- [ ] Run through `visual_diagrams/` — open each to confirm no parse errors.
- [ ] Add `README` updates for new endpoints + architecture diagrams.
- [ ] Push branch → open Draft PR: “AI Reader MVP Foundations.”

---

## 🎯 Milestone — Day‑1 Target
- [ ] `/dev` working (pings + test retrieval)
- [ ] `/reader/[id]` functional (mock data)
- [ ] SQL schema files committed
- [ ] Diagrams preview clean
- [ ] Draft PR open

---

✨ *“Step by step, page by page, intelligence meets imagination.”*
