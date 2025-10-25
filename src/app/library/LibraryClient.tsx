"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { DBBook } from "@/lib/types";
import { useLibrary } from "@/context/LibraryContext";
import BookCard from "@/components/BookCard";

type Props = { initialBooks?: DBBook[] };

// library is provided via context

export default function LibraryClient({ initialBooks = [] }: Props) {
  const { library, setLibrary } = useLibrary();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"rows" | "grid">("grid");
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [lastOpenedId, setLastOpenedId] = useState<string | null>(null);

  // if the parent/server passed initialBooks, initialize context with them
  useEffect(() => {
    if (initialBooks && initialBooks.length > 0) setLibrary(initialBooks);
    // we only want to run this when initialBooks changes
  }, [initialBooks, setLibrary]);

  // read last opened book id client-side
  useEffect(() => {
    try { if (typeof window !== 'undefined') setLastOpenedId(localStorage.getItem('lastOpenedBookId')); } catch {}
  }, []);


  // filtering + sorting
  // derive tags based on author initials as a stand-in for genres (demo)
  useEffect(() => {
    const unique = new Set<string>();
    library.forEach((b) => unique.add(b.author.split(" ").slice(-1)[0]?.[0]?.toUpperCase() || "A"));
    setTags(Array.from(unique).sort());
  }, [library]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = !q ? library : library.filter((b) => [b.title, b.author].some((t) => t?.toLowerCase().includes(q)));
    if (selectedTag) {
      items = items.filter((b) => (b.author.split(" ").slice(-1)[0]?.[0]?.toUpperCase() || "A") === selectedTag);
    }
    items = [...items].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return items;
  }, [library, query]);

  const recentlyAdded = useMemo(() => filtered.slice(0, 12), [filtered]);
  const allAZ = useMemo(() => [...filtered].sort((a, b) => a.title.localeCompare(b.title)).slice(0, 18), [filtered]);

  return (
    <div className="container-fluid">
      <div className="row g-4">
        <div className="col-12">
          <div className="library-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
            <div className="d-flex flex-column">
              <h2 className="mb-0">Your Library</h2>
              <div className="text-secondary small">{filtered.length} book{filtered.length === 1 ? '' : 's'}</div>
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="position-relative search-wrap">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="form-control form-control-sm ps-5"
                  placeholder="Search title or author"
                  aria-label="Search books"
                  style={{ minWidth: 220 }}
                />
                <span className="search-icon" aria-hidden>🔍</span>
              </div>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <button className={`badge filter-chip ${selectedTag === '' ? 'text-bg-primary' : 'text-bg-secondary'}`} onClick={() => setSelectedTag('')}>All</button>
                {tags.map((t) => (
                  <button key={t} className={`badge filter-chip ${selectedTag === t ? 'text-bg-primary' : 'text-bg-secondary'}`} onClick={() => setSelectedTag(t)} aria-pressed={selectedTag === t}>{t}</button>
                ))}
              </div>
              <div className="btn-group btn-group-sm" role="group" aria-label="View switch">
                <button
                  type="button"
                  className={`btn btn-outline-primary ${view === 'rows' ? 'active' : ''}`}
                  aria-pressed={view === 'rows'}
                  onClick={() => setView('rows')}
                >
                  Rows
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-primary ${view === 'grid' ? 'active' : ''}`}
                  aria-pressed={view === 'grid'}
                  onClick={() => setView('grid')}
                >
                  Grid
                </button>
              </div>
              <Link href="/uploads" className="btn btn-outline-primary btn-sm">Add Book</Link>
            </div>
          </div>
        </div>

        {/* Continue reading shows when we have a last-opened book */}
        {lastOpenedId && filtered.some((b) => b.id === lastOpenedId) && (
          <div className="col-12">
            <SectionRow title="Continue Reading" items={filtered.filter((b) => b.id === lastOpenedId)} />
          </div>
        )}

        {view === 'rows' ? (
          <>
            <div className="col-12">
              <SectionRow title="Recently Added" items={recentlyAdded} />
            </div>
            <div className="col-12 mt-3">
              <SectionRow title="All Books (A–Z)" items={allAZ} />
            </div>
          </>
        ) : (
          <div className="col-12">
            <div className="p-3 rounded-4 bg-transparent">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="mb-0">All Books</h6>
                <small className="text-secondary">Grid view</small>
              </div>
              <GridSkeleton ready={filtered.length > 0} count={12} />
              <div className="row g-4 grid-books">
                {filtered.map((b) => (
                  <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={b.id}>
                    <BookCard book={b} size="large" layout="grid" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Small library list fallback for accessibility */}
        <div className="col-12 d-lg-none">
          <div className="p-4 rounded-4 border bg-white shadow-sm">
            <h5 className="mb-3">Your Library</h5>
            {library.length === 0 ? (
              <p className="text-secondary mb-0">No books yet.</p>
            ) : (
              <div className="row g-3">
                {library.map((b) => (
                  <div className="col-12" key={b.id}>
                    <div className="border rounded-4 p-3 d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold">{b.title}</div>
                        <div className="text-secondary small">by {b.author}</div>
                      </div>
                      <Link className="btn btn-outline-primary btn-sm" href={`/reader/${b.id}`}>
                        Open Reader
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionRow({ title, items }: { title: string; items: DBBook[] }) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  if (!items || items.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    const el = carouselRef.current;
    if (!el) return;
    const width = el.clientWidth;
    el.scrollBy({ left: dir * width * 0.6, behavior: "smooth" });
  };

  return (
    <div className="p-3 rounded-4 bg-transparent">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 className="mb-0">{title}</h6>
        <div className="d-flex gap-2 align-items-center">
          <button className="btn btn-sm btn-outline-secondary carousel-control" aria-label="Previous" onClick={() => scrollBy(-1)}>
            ‹
          </button>
          <button className="btn btn-sm btn-outline-secondary carousel-control" aria-label="Next" onClick={() => scrollBy(1)}>
            ›
          </button>
        </div>
      </div>
      <RowSkeleton ready={items.length > 0} />
      <div
        ref={carouselRef}
        className="d-flex gap-3 overflow-auto section-row"
        style={{ paddingBottom: 6 }}
        tabIndex={0}
        aria-label={`${title} carousel`}
      >
        {items.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>
    </div>
  );
}

function RowSkeleton({ ready }: { ready: boolean }) {
  const [delayDone, setDelayDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDelayDone(true), 350);
    return () => clearTimeout(t);
  }, []);
  if (ready && delayDone) return null;
  return (
    <div className="d-flex gap-3 overflow-hidden mb-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-tile rounded-4" style={{ width: 160, height: 240 }} />
      ))}
    </div>
  );
}

function GridSkeleton({ ready, count = 12 }: { ready: boolean; count?: number }) {
  const [delayDone, setDelayDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDelayDone(true), 350);
    return () => clearTimeout(t);
  }, []);
  if (ready && delayDone) return null;
  return (
    <div className="row g-4 mb-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2">
          <div className="skeleton-tile rounded-4" style={{ width: "100%", height: 280 }} />
        </div>
      ))}
    </div>
  );
}
