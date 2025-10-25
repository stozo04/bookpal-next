"use client";

import Link from "next/link";
import React from "react";
import { Book, InfoCircle } from "react-bootstrap-icons";
import type { DBBook } from "@/lib/types";

function coverColorsFromSeed(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  const hue = Math.abs(h) % 360;
  return `linear-gradient(180deg, hsl(${hue}deg 70% 60%), hsl(${(hue + 40) % 360}deg 60% 45%))`;
}

type CardSize = "small" | "medium" | "large";
type CardLayout = "carousel" | "grid";

export default function BookCard({ book, size = "medium", layout = "carousel" }: { book: DBBook; size?: CardSize; layout?: CardLayout }) {
  const width = size === "small" ? 120 : size === "large" ? 220 : 160;
  const height = size === "large" ? 320 : 240;
  const containerStyle = layout === "grid" ? undefined : { minWidth: width, width: width, flex: "0 0 auto" } as React.CSSProperties;

  return (
    <div className="book-card" style={containerStyle}>
      <div
        className="book-poster rounded-4 border"
        style={{
          height,
          background: coverColorsFromSeed(book.title + book.author),
        }}
        title={`${book.title} by ${book.author}`}
      >
        <div className="book-poster-meta">
          <div className="book-title text-truncate">{book.title}</div>
          <div className="book-author text-truncate small">{book.author}</div>
        </div>
      </div>

      <div className="book-overlay d-flex flex-column justify-content-end align-items-center">
        <div className="d-flex gap-2 mb-2">
          {layout === "grid" ? (
            <>
              <Link
                href={`/reader/${book.id}`}
                className="btn btn-icon btn-primary"
                aria-label="Read"
                onClick={() => {
                  try { if (typeof window !== 'undefined') localStorage.setItem('lastOpenedBookId', book.id); } catch {}
                }}
              >
                <Book size={16} />
              </Link>
              <Link
                href={`/library/${book.id}`}
                className="btn btn-icon btn-outline-light"
                aria-label="Details"
                onClick={() => {
                  try { if (typeof window !== 'undefined') localStorage.setItem('lastOpenedBookId', book.id); } catch {}
                }}
              >
                <InfoCircle size={16} />
              </Link>
            </>
          ) : (
            <>
              <Link
                href={`/reader/${book.id}`}
                className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                onClick={() => {
                  try { if (typeof window !== 'undefined') localStorage.setItem('lastOpenedBookId', book.id); } catch {}
                }}
              >
                <Book size={14} /> Read
              </Link>
              <Link
                href={`/library/${book.id}`}
                className="btn btn-sm btn-outline-light d-inline-flex align-items-center gap-1"
                onClick={() => {
                  try { if (typeof window !== 'undefined') localStorage.setItem('lastOpenedBookId', book.id); } catch {}
                }}
              >
                <InfoCircle size={14} /> Details
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
