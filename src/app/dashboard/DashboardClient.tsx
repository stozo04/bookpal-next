"use client";

import { useState } from "react";
import UploadDrop from "@/components/UploadDrop";
import type { Book, DBBook } from "@/lib/types";

type Props = { initialBooks?: DBBook[] };

export default function DashboardClient({ initialBooks = [] }: Props) {
  const [book, setBook] = useState<Book | null>(null);
  const [library, setLibrary] = useState<DBBook[]>(initialBooks ?? []);

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-5">
        <UploadDrop
          onStructured={(b) => setBook(b)}
          onSaved={(saved) => setLibrary((prev) => [saved, ...prev])}
        />
      </div>

      <div className="col-12 col-lg-7 d-flex flex-column gap-3">
        {/* Preview of the most recently structured book */}
        <div className="p-4 rounded-4 border bg-white shadow-sm">
          {book ? (
            <>
              <h3 className="h5 mb-1">{book.title}</h3>
              <p className="text-secondary mb-3">by {book.author}</p>
              <h6 className="mb-2">Top Characters</h6>
              <ul className="mb-4">
                {book.characters.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
              <h6 className="mb-2">Chapters ({book.chapters.length})</h6>
              <div className="border rounded-4 p-3" style={{ maxHeight: 280, overflowY: "auto" }}>
                {book.chapters.map((ch, i) => (
                  <details key={i} className="mb-2">
                    <summary className="fw-semibold">{i + 1}. {ch.title}</summary>
                    <pre className="mt-2 small text-wrap" style={{ whiteSpace: "pre-wrap" }}>
                      {ch.content.slice(0, 1000)}{ch.content.length > 1000 ? "…" : ""}
                    </pre>
                  </details>
                ))}
              </div>
            </>
          ) : (
            <p className="mb-0 text-secondary">Upload a book to see structured output.</p>
          )}
        </div>

        {/* Library list */}
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
  );
}
