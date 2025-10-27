# 📘 Visual Diagrams Index

Welcome to the **E‑Reader AI Modernization** visualization library!  
These Mermaid diagrams and plans capture the system’s architecture, flows, and execution roadmap.

---

## 🏗️ Architecture Diagrams (`/architecture`)

| File | Description |
|------|--------------|
| **high-level.md** | End‑to‑end overview of how books flow from upload → ingestion → reader actions. |
| **data-architecture.md** | Entity‑relationship map of Supabase tables (books, sessions, visuals, characters, etc.). |
| **request-routing-service-map.md** | Detailed routing of user actions → API → models → memory updates. |
| **state-diagram.md** | Session state transitions (new, active, stale, refresh). |

---

## 🔄 Flow Diagrams (`/flows`)

| File | Description |
|------|--------------|
| **summarize.md** | Sequence diagram for the “Summarize Paragraph” feature. |
| **catch-me-up.md** | Sequence diagram showing how the “Catch Me Up” recap works spoiler‑safe. |
| **session-lifecycle.md** | (Planned) Overall reading session evolution—resuming, refreshing, closing. |

---

## 🧭 Management & Planning (`/management`)

| File | Description |
|------|--------------|
| **EReader_AI_RACI_Execution_Plan.md** | Full RACI plan outlining phases, owners, and success criteria. |
| **roadmap.md** | (Planned) Strategic milestones beyond MVP—image/video generation, multi‑book context, etc. |

---

## 🧰 Usage Tips

- All diagrams use **Mermaid syntax**, viewable directly in VSCode, GitHub, or Obsidian.  
- Use the command palette in VSCode → “Markdown: Open Preview to the Side” to render diagrams live.  
- Keep `.md` versions for diffs; export `.svg` only for presentations.  
- Update this README whenever new diagrams are added.

---

✨ *Maintained by the E‑Reader AI team — “Books meet intelligence.”*
