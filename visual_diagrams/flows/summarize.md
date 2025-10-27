sequenceDiagram
    participant U as Reader (UI)
    participant S as Session Memory<br/>(locator, running summary)
    participant R as Retriever<br/>(pgvector + biasing)
    participant M as Model (GPT-5)
    participant G as Guardrails<br/>(spoiler ceiling)
    
    U->>S: Open book / Continue reading
    S-->>U: last_locator + running_summary (compact)

    U->>G: Click “Summarize paragraph” @ locator
    G-->>U: Spoiler ceiling = last completed chapter

    U->>R: Retrieve top-K chunks near locator (within ceiling)
    R-->>U: K snippets (+ anchors & scores)

    U->>M: System rules + running_summary + selected snippets + user intent
    M-->>U: 2–4 bullet TL;DR (no spoilers)

    M->>S: Send summary delta + citations (anchors used)
    S-->>U: Session memory updated (faster next time)
