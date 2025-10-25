"use client";

import Link from "next/link";
import React from "react";
import type { DBBook } from "@/lib/types";

function coverColorsFromSeed(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  const hue = Math.abs(h) % 360;
  return `linear-gradient(180deg, hsl(${hue}deg 70% 60%), hsl(${(hue + 40) % 360}deg 60% 45%))`;
}

export default function BookCard({ book, size = "medium" }: { book: DBBook; size?: "small" | "medium" | "large" }) {
  const width = size === "small" ? 120 : size === "large" ? 220 : 160;
  const height = size === "large" ? 320 : 240;

  return (
    <div className="book-card" style={{ minWidth: width, width: width, flex: "0 0 auto" }}>
      <div
        className="book-poster rounded-3"
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
          <Link href={`/reader/${book.id}`} className="btn btn-sm btn-primary">
            Read
          </Link>
          <Link href={`/library/${book.id}`} className="btn btn-sm btn-outline-light">
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
