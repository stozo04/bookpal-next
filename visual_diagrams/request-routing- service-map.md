flowchart LR
  subgraph Client["Reader UI (Next.js)"]
    A1[Summarize Paragraph]
    A2[Summarize Chapter]
    A3[Define]
    A4[Visualize Character]
    A5[Visualize Scene]
    A6[Catch Me Up]
  end

  subgraph API["App API Layer (Route Handlers / Edge Functions)"]
    B0[Auth (Google)]
    B1[Session Loader\n(get last_locator, running_summary)]
    B2[Spoiler Guard\n(ceiling = last locator/chapter)]
    B3[Retriever\n(pgvector + near-locator bias)]
    B4[Context Assembler\n(running summary + top-K snippets)]
    B5[Model Orchestrator\n(GPT-5, tools)]
    B6[Session Memory Updater\n(running_summary delta, actions log)]
    B7[Credits & Quotas\n(image credits, daily limits)]
  end

  subgraph Data["Data & Services"]
    D1[(Supabase DB)]
    D2[(pgvector: BOOK_CHUNKS)]
    D3[(Sessions: READER_SESSIONS,\nSESSION_MEMORIES, ACTIONS)]
    D4[(Character/Place Index,\nRelationships, Glossary)]
    D5[(Credits Wallet & Ledger)]
    D6[(Storage: Book file,\nGenerated Visuals)]
    D7[(Cache: Redis - session tail,\nlast retrieval results)]
  end

  subgraph Models["AI Models"]
    M1[Embedding Model\n(ingestion only)]
    M2[GPT-5 Text\n(Q&A, summaries, catch-up)]
    M3[Image Gen\n(portraits & scenes)]
  end

  %% Client -> API common prelude
  A1 -->|POST /summarizePara| B0
  A2 -->|POST /summarizeChapter| B0
  A3 -->|POST /define| B0
  A4 -->|POST /visualizeCharacter| B0
  A5 -->|POST /visualizeScene| B0
  A6 -->|POST /catchMeUp| B0

  %% Auth & session load
  B0 --> B1
  B1 --> D3
  D3 --> B1

  %% Guardrails + retrieval
  B1 --> B2
  B2 --> B3
  B3 --> D2
  D2 --> B3
  B3 --> B4
  B4 --> D7
  D7 --> B4

  %% Text actions
  B4 --> B5
  B5 --> M2
  M2 --> B5
  B5 --> B6
  B6 --> D3
  B5 -->|streamed text| Client

  %% Define path (dictionary fallback)
  B5 -->|needs definition| D4
  D4 --> B5
  B5 --> Client

  %% Visuals path
  B4 -->|descriptor extract (book-only)| D4
  A4 -.->|character_id| D4
  A5 -.->|section/anchor| D4
  B5 -->|image request| B7
  B7 --> D5
  D5 --> B7
  B7 -->|ok/deny| B5
  B5 --> M3
  M3 --> B5
  B5 --> D6
  D6 --> Client

  %% Catch Me Up special
  A6 --> B3
  B3 -->|curate up to ceiling| B4
  B4 --> B5
  B5 -->|recap + recall checks| Client

  %% Ingestion (out of band)
  subgraph Ingestion["Ingestion (on Upload)"]
    I1[Extract & Normalize Text]
    I2[Chunk (800–1200 tkn,\n~15% overlap)]
    I3[Embed Chunks]
    I4[Build Indices:\nCharacters/Glossary/Relations]
    I5[Book Synopses\n(short/long)]
  end
  I1 --> I2 --> I3 --> D2
  I4 --> D4
  I5 --> D3
  I3 --> M1
  I1 --> D6

  %% Caching & perf
  B3 <-->|hot sets| D7
  B1 <-->|recent session window| D7
