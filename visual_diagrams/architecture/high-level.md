```mermaid
flowchart TD
    A[User uploads book (EPUB/PDF)] --> B[Storage: file saved]
    B --> C[Ingestion Job (bg)]
    C --> C1[Extract clean text + structure (chapters/sections)]
    C1 --> C2[Chunk text (800–1200 tokens, 15% overlap)]
    C2 --> C3[Compute embeddings\n(store in pgvector)]
    C3 --> C4[Entity pass: Characters/Places\n+ aliases, first/last seen]
    C4 --> C5[Relationship graph\n(edges w/ citations)]
    C5 --> C6[Glossary seed\n(terms + in-book examples)]
    C6 --> C7[Book synopses (short/long)]
    C7 --> D[Book is AI-ready]

    D --> E[Reader opens book]
    E --> F[Create/Resume Session\n(last locator, rolling summary)]
    F --> G[Reader UI Actions:\nSummarize Paragraph | Summarize Chapter | Define | Visualize Character | Visualize Scene | Catch Me Up]

    subgraph Retrieval & Guardrails
      G --> H[Query Builder\n(what, where, spoiler ceiling)]
      H --> I[Vector search (top-K)\n+ near-locator bias]
      I --> J[Compact context assembly\n(running summary + snippets)]
      J --> K[Model response]
      K --> L[Update session memory\n(running summary, facts index)]
    end

    subgraph Visuals (credits/caching)
      G --> V1[Character/Scene request]
      V1 --> V2[Extract descriptors\n(only from in-book text)]
      V2 --> V3[Generate image]
      V3 --> V4[Cache + attach anchors\n(character or passage)]
      V4 --> V5[Reuse on next request]
    end

    style D fill:#E8F7FF,stroke:#4aa3ff
    style Retrieval & Guardrails fill:#FFF8E7,stroke:#f1a33f
    style Visuals (credits/caching) fill:#F4F8F3,stroke:#7fbf7f
```