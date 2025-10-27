# E-Reader AI Modernization — RACI Execution Plan

## Legend
- **R** = Responsible (does the work)
- **A** = Accountable (final sign-off)
- **C** = Consulted (gives input)
- **I** = Informed (kept in the loop)

---

## Phase 0 — Foundations (Day 0–1)
| Task | R | A | C | I | Definition of Done |
|---|---|---|---|---|---|
| Decide MVP scope & quotas (summaries/defs free; 5 image credits/mo) | PM | PM | Eng, Design | Support | Written one-pager w/ limits & pricing |
| Pick models (GPT-5 text; img gen provider) | Eng | Eng | PM | Finance | Model IDs chosen; cost/1K ops noted |
| Spoiler policy | PM | PM | Legal | Support | “Ceiling = last completed chapter” documented |
| Latency targets | Eng | PM | — | — | SP: ≤600 ms; SC: ≤2 s; Define: ≤400 ms; Catch-Up: ≤2 s; Visual: ≤10–15 s |

---

## Phase 1 — Ingestion on Upload (Day 1–4)
| Task | R | A | C | I | Definition of Done |
|---|---|---|---|---|---|
| Storage upload + background job trigger | Eng | Eng | — | PM | Upload creates job; status events visible |
| Text extraction & normalization (EPUB/PDF + OCR fallback) | Eng | Eng | — | PM | Clean chapter/section text for 3 test books |
| Chunking (800–1200 tkn, 15% overlap) | Eng | Eng | — | — | Chunk stats & hash per book stored |
| Embeddings (pgvector) + IVFFLAT index | Eng | Eng | DBA | PM | Top-K query <150 ms p95 on 50k chunks |
| Character & glossary index | Eng | Eng | NLP | PM | Characters detected w/ first/last seen; 20 top terms w/ examples |
| Book synopses (short/long) | Eng | PM | NLP | — | Stored and viewable in admin |

---

## Phase 2 — Session Memory & Spoilers (Day 4–6)
| Task | R | A | C | I | Definition of Done |
|---|---|---|---|---|---|
| Session model (start/active/stale) | Eng | Eng | PM | Support | Resume logic works across 72h gap |
| Running summary (hierarchical) | Eng | Eng | NLP | PM | Summary stays ≤2k tokens; updates after actions |
| Spoiler ceiling enforcement | Eng | Eng | QA | PM | No retrieval beyond ceiling in tests |
| Redis cache (session tail + last retrieval) | Eng | Eng | DevOps | — | Resume <200 ms; repeat actions faster |

---

## Phase 3 — Reader UI Actions (Day 6–10)
| Action | R | A | C | I | Definition of Done |
|---|---|---|---|---|---|
| Summarize Paragraph | Eng | PM | Design | Support | TL;DR (2–4 bullets), ≤600 ms p95, citations |
| Summarize Chapter | Eng | PM | Design | Support | TL;DR + key beats; ≤2 s; only chapter scope |
| Define (in-book sense → dictionary fallback) | Eng | PM | Content | — | Shows in-book example; ≤400 ms |
| Catch Me Up | Eng | PM | Design | Support | “Previously on…” + 2–3 recall checks; ≤2 s |
| Visualize Character (credits, cache) | Eng | PM | Design | Finance | First render ≤15 s; cached reuse instant |
| Visualize Scene (anchored to passage) | Eng | PM | Design | Finance | Anchors saved; reuse instant |

---

## Phase 4 — Credits, Settings, Admin (Day 10–12)
| Task | R | A | C | I | Definition of Done |
|---|---|---|---|---|---|
| Credits wallet & ledger | Eng | Eng | Finance | Support | Spend/grant/refund flows logged |
| Quotas & paywall UX | Eng | PM | Design | Support | Clear messaging; purchase test completes |
| Telemetry & KPIs | Eng | PM | Data | — | Dashboards for latency, cost, DAU action usage |

---

## Phase 5 — Quality & Guardrails (Day 12–14)
| Task | R | A | C | I | Definition of Done |
|---|---|---|---|---|---|
| OCR quality score + warning banner | Eng | PM | QA | — | Bad PDFs prompt user with guidance |
| NSFW/explicit scene policy | PM | PM | Legal | Support | Visualize scene respects safe-mode toggle |
| Relationship graph correctness | Eng | PM | QA | — | Edges show only after reveal; cite sources |

---

## Acceptance Tests
- Upload 3 books (novel, textbook, OCR-heavy). All reach **AI-ready**.
- Resume after 3 days → **Catch Me Up** honors spoiler ceiling.
- Highlight a dense paragraph → summary ≤600 ms, cites anchors.
- Define ambiguous term → shows in-book example first.
- Visualize “Chad” once → later taps reuse cached portrait; credits decrement exactly once.

---

## KPIs (first 2 weeks)
- p95 latency: SP ≤600 ms; SC ≤2 s; Define ≤400 ms; Catch-Up ≤2 s.
- Visualization success ≥98%, re-use rate ≥60%.
- Cost/user ≤ your $10 target; visualize credits drive upsell.

---

## Risk Traps & Mitigations
- **Slow PDFs/OCR** → async ingest + user banner; allow reading while ingesting next chapters.
- **Context creep** → hard cap snippets; hierarchical summaries.
- **Spoilers** → unit tests on ceiling; manual spot checks.
- **Cost spikes** → dedupe embeddings by text_hash; cache visuals; quotas.

---

## Build Order (ultra-short)
1. Ingestion + retrieval (pgvector)
2. Session memory + spoiler ceiling
3. Summarize/Define (fast wins)
4. Catch Me Up
5. Visualize (credits + cache)
6. Admin/Telemetry/Quotas
