# 🔁 Session Lifecycle Diagram

This Mermaid diagram illustrates how a **reader session** evolves across its lifecycle — from creation, through active reading, to stale and refresh states.  
It ties together user activity, memory updates, and spoiler-safe recap handling.

```mermaid
stateDiagram-v2
    [*] --> NewSession : User starts reading a book

    NewSession --> ActiveSession : Session created
and first chapter loaded
    ActiveSession --> UpdatingMemory : User performs actions
(Summarize, Define, Visualize)
    UpdatingMemory --> ActiveSession : Running summary updated
    ActiveSession --> Idle : User pauses or closes reader
    Idle --> ActiveSession : User resumes within 72h
    Idle --> Stale : Inactivity ≥ 72h

    Stale --> Refreshing : Trigger "Catch Me Up"
(based on last locator)
    Refreshing --> ActiveSession : Recap delivered
and resume confirmed

    ActiveSession --> Closed : User finishes book or manually ends session
    Closed --> Archived : Stored for reference only
    Archived --> [*]

    note right of NewSession
      **Purpose:** Initialize session with
book synopsis + first locator.
    end note

    note right of Refreshing
      **Catch Me Up** flow ensures no spoilers
and updates running summary.
    end note

    note right of Archived
      **Archived sessions** remain readonly;
no further updates or charges.
    end note
```

### 🧭 Notes
- **Session lifespan:** typically active for 72 hours before marked stale.
- **Running summary:** compact state retained across all transitions except archive.
- **Spoiler ceiling:** enforced during all transitions; never retrieves beyond the user's last progress.
- **Archived sessions:** can be revisited for stats or personal analytics but not continued.

---

✨ *“Every reading session tells a story — and now, your AI remembers it too.”*
