sequenceDiagram
    autonumber
    participant U as Reader (UI)
    participant S as Session Memory<br/>(last_locator, running_summary, actions)
    participant G as Guardrails<br/>(spoiler ceiling)
    participant R as Retriever<br/>(pgvector + near-locator bias)
    participant M as Model (GPT-5)

    U->>S: Continue Reading → "Catch Me Up"
    S-->>U: last_locator + running_summary (compact)

    U->>G: Request recap
    G-->>U: Set spoiler ceiling = last completed chapter (or last locator)

    note over U,S,G: Build recap plan (scope ≤ ceiling; prefer user-touched passages)

    U->>R: Retrieve key snippets up to ceiling\n(anchors: last finished chapter(s), notes, highlights)
    R-->>U: Curated snippets + citations

    U->>M: System rules + running_summary + curated snippets\n+ recap style (brief/standard/deep)
    M-->>U: Recap output:\n• “Previously on…” bullets\n• Key characters & motivations\n• 2–3 recall checks\n• Resume pointer (chapter/page)

    M->>S: Update running_summary with recap delta\n(links to anchors used)
    S-->>U: Session memory refreshed; resume state set

    U-->>U: UI shows: Recap (expand), Quick quiz (optional),\n"Resume at Chapter X" CTA
