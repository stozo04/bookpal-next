erDiagram
    USERS ||--o{ BOOKS : "owns"
    USERS ||--o{ READER_SESSIONS : "has"
    USERS ||--o{ PURCHASES : "makes"
    USERS ||--o{ CREDITS_WALLET : "has 1"
    CREDITS_WALLET ||--o{ CREDITS_LEDGER : "logs usage/top-ups"

    BOOKS ||--o{ BOOK_SECTIONS : "has"
    BOOKS ||--o{ BOOK_CHUNKS : "has (pgvector)"
    BOOKS ||--o{ BOOK_INGESTION_JOBS : "built by"
    BOOKS ||--o{ CHARACTER_INDEX : "yields"
    BOOKS ||--o{ GLOSSARY_TERMS : "yields"
    BOOKS ||--o{ PLACE_INDEX : "optional"
    BOOKS ||--o{ VISUALS : "has (by anchor)"

    BOOK_SECTIONS ||--o{ BOOK_CHUNKS : "groups"
    BOOK_CHUNKS ||--o{ CHUNK_CITATIONS : "anchors to text"

    CHARACTER_INDEX ||--o{ CHARACTER_ALIASES : "aka"
    CHARACTER_INDEX ||--o{ RELATIONSHIPS : "edges"
    CHARACTER_INDEX ||--o{ CHARACTER_VISUALS : "portraits"
    VISUALS ||--o{ SCENE_VISUALS : "scenes"

    READER_SESSIONS ||--o{ SESSION_MEMORIES : "stores"
    READER_SESSIONS ||--o{ SESSION_ACTIONS : "events"
    READER_SESSIONS ||--o{ SESSION_CACHE : "fast state (redis-ok)"

    PURCHASES }o--|| BOOKS : "optional shared embeddings"
    PURCHASES ||--o{ LICENSE_FLAGS : "publisher rules"

    USERS {
      uuid id PK
      text email
      timestamptz created_at
    }

    BOOKS {
      uuid id PK
      uuid owner_user_id FK -> USERS.id
      text title
      text author
      text format  // epub|pdf
      text storage_path
      text text_hash  // dedupe key
      text status  // uploaded|ingesting|ready|failed
      timestamptz created_at
      timestamptz updated_at
      uuid canonical_book_id  // for shared embeddings
    }

    BOOK_INGESTION_JOBS {
      uuid id PK
      uuid book_id FK -> BOOKS.id
      text status  // queued|running|success|error
      jsonb logs
      timestamptz started_at
      timestamptz finished_at
    }

    BOOK_SECTIONS {
      uuid id PK
      uuid book_id FK -> BOOKS.id
      int ordinal
      text title
      jsonb anchor  // chapter/page offsets
    }

    BOOK_CHUNKS {
      uuid id PK
      uuid book_id FK -> BOOKS.id
      uuid section_id FK -> BOOK_SECTIONS.id
      text content
      int token_count
      vector embedding  // pgvector
      jsonb source_locator  // {chapter, para, start_char}
      text checksum  // sha256(content)
      timestamptz created_at
    }

    CHUNK_CITATIONS {
      uuid id PK
      uuid chunk_id FK -> BOOK_CHUNKS.id
      jsonb anchor  // exact span in book
    }

    CHARACTER_INDEX {
      uuid id PK
      uuid book_id FK -> BOOKS.id
      text name
      jsonb descriptors  // appearance, traits, quotes
      jsonb first_last_seen  // {first_section, last_section}
    }

    CHARACTER_ALIASES {
      uuid id PK
      uuid character_id FK -> CHARACTER_INDEX.id
      text alias
    }

    RELATIONSHIPS {
      uuid id PK
      uuid book_id FK -> BOOKS.id
      uuid source_character_id FK -> CHARACTER_INDEX.id
      uuid target_character_id FK -> CHARACTER_INDEX.id
      text type  // friend|sibling|lover|rival|etc
      jsonb evidence  // [ {section_id, anchor} ]
      int spoiler_level  // visibility threshold
    }

    GLOSSARY_TERMS {
      uuid id PK
      uuid book_id FK -> BOOKS.id
      text term
      text definition  // preferred: in-book sense
      jsonb examples  // citations in text
    }

    VISUALS {
      uuid id PK
      uuid book_id FK -> BOOKS.id
      text kind  // character|scene
      jsonb anchors  // character_id or {section_id, anchor}
      text storage_path  // Supabase Storage
      text style  // realistic|painterly|etc
      text status  // generated|pending|failed
      uuid created_by_user_id FK -> USERS.id
      timestamptz created_at
    }

    CHARACTER_VISUALS {
      uuid id PK
      uuid character_id FK -> CHARACTER_INDEX.id
      uuid visual_id FK -> VISUALS.id
      bool is_default
    }

    SCENE_VISUALS {
      uuid id PK
      uuid visual_id FK -> VISUALS.id
      uuid section_id FK -> BOOK_SECTIONS.id
      jsonb anchor
    }

    READER_SESSIONS {
      uuid id PK
      uuid user_id FK -> USERS.id
      uuid book_id FK -> BOOKS.id
      jsonb last_locator  // {section, para, offset}
      jsonb running_summary  // compact hierarchical
      timestamptz started_at
      timestamptz last_active_at
      text status  // active|stale|closed
    }

    SESSION_MEMORIES {
      uuid id PK
      uuid session_id FK -> READER_SESSIONS.id
      text type  // running_summary|facts_index|open_questions
      jsonb content
      int importance  // 1-3
      timestamptz created_at
    }

    SESSION_ACTIONS {
      uuid id PK
      uuid session_id FK -> READER_SESSIONS.id
      text action  // summarize_para|define|visualize_character|catch_me_up
      jsonb params  // locator, character_id, etc
      timestamptz created_at
    }

    SESSION_CACHE {
      uuid id PK
      uuid session_id FK -> READER_SESSIONS.id
      jsonb recent_messages  // small tail for coherence
      jsonb last_retrieval_results  // chunk ids + scores
      timestamptz updated_at
    }

    CREDITS_WALLET {
      uuid id PK
      uuid user_id FK -> USERS.id
      int image_credits_balance
      int monthly_included_credits
      timestamptz renewed_at
    }

    CREDITS_LEDGER {
      uuid id PK
      uuid wallet_id FK -> CREDITS_WALLET.id
      text kind  // grant|spend|refund|purchase
      int amount
      text memo
      timestamptz created_at
    }

    PURCHASES {
      uuid id PK
      uuid user_id FK -> USERS.id
      uuid book_id FK -> BOOKS.id
      jsonb metadata  // receipt/license info
      timestamptz created_at
    }

    LICENSE_FLAGS {
      uuid id PK
      uuid purchase_id FK -> PURCHASES.id
      bool allow_chapter_summaries
      bool allow_long_quotes
      bool allow_visuals
      text notes
    }

    PLACE_INDEX {
      uuid id PK
      uuid book_id FK -> BOOKS.id
      text name
      jsonb descriptors
      jsonb first_last_seen
    }
