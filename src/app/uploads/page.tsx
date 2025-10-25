"use client";

import { useState } from "react";
import UploadDrop from "@/components/UploadDrop";
import type { Book } from "@/lib/types";
import Link from "next/link";
import { useLibrary } from "@/context/LibraryContext";

// Helper: deterministic color generator based on a string (small copy of LibraryClient helper)
function coverColorsFromSeed(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  const hue = Math.abs(h) % 360;
  return `linear-gradient(180deg, hsl(${hue}deg 70% 60%), hsl(${(hue + 40) % 360}deg 60% 45%))`;
}

export default function UploadsPage() {
  const [book, setBook] = useState<Book | null>(null);

  const { addBook } = useLibrary();

  return (
    <div className="container-fluid">
      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <UploadDrop
            onStructured={(b) => setBook(b)}
            onSaved={(saved) => {
              // add saved DB row into shared library so it appears immediately in /library
              addBook(saved);
              // also set local structured view so preview appears
              setBook(saved as unknown as Book);
            }}
          />
        </div>

        <div className="col-12 col-lg-7 d-flex flex-column gap-3">
          <div className="p-4 rounded-4 border bg-white shadow-sm">
            {book ? (
              <>
                <h3 className="h5 mb-1">Continue: {book.title}</h3>
                <p className="text-secondary mb-3">by {book.author}</p>
                <div className="d-flex gap-3 align-items-center">
                  <div
                    className="rounded-3"
                    style={{ width: 120, height: 170, background: coverColorsFromSeed(book.title) }}
                  />
                  <div>
                    <div className="mb-2 small text-muted">Top characters</div>
                    <div className="fw-semibold mb-2">{book.characters.slice(0, 3).join(", ")}</div>
                    <a className="btn btn-primary btn-sm" href="#reader">
                      Open Reader
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h5 className="mb-2">Uploads</h5>
                <p className="mb-0 text-secondary">Upload a book to see structured output and continue reading.</p>
                <div className="mt-3">
                  <Link href="/library" className="btn btn-outline-primary btn-sm">
                    Back to Library
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
