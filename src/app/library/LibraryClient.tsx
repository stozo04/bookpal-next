"use client";

import { useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import type { DBBook } from "@/lib/types";
import { useLibrary } from "@/context/LibraryContext";
import BookCard from "@/components/BookCard";

type Props = { initialBooks?: DBBook[] };

// library is provided via context

export default function LibraryClient({ initialBooks = [] }: Props) {
  const { library, setLibrary } = useLibrary();

  // if the parent/server passed initialBooks, initialize context with them
  useEffect(() => {
    if (initialBooks && initialBooks.length > 0) setLibrary(initialBooks);
    // we only want to run this when initialBooks changes
  }, [initialBooks, setLibrary]);

  // derived sections for Netflix-style rows
  const popular = useMemo(() => library.slice(0, 10), [library]);
  const recentlyAdded = useMemo(() => [...library].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 10), [library]);

  return (
    <div className="container-fluid">
      <div className="row g-4">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h2 className="mb-0">Your Library</h2>
              <div className="text-secondary small">A tidy view of your books</div>
            </div>
            <div>
              <Link href="/uploads" className="btn btn-outline-secondary me-2">Upload</Link>
              <Link href="/library" className="btn btn-primary">Browse all</Link>
            </div>
          </div>
        </div>

        <div className="col-12">
          <SectionRow title="Popular on BookPal" items={popular} />
        </div>

        <div className="col-12 mt-3">
          <SectionRow title="Recently Added" items={recentlyAdded} />
        </div>

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
                      <a className="btn btn-outline-primary btn-sm" href={`/reader/${b.id}`}>
                        Open Reader
                      </a>
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
