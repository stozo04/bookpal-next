"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { DBBook } from "@/lib/types";

// Demo data generator (runs client-side only via useEffect below)
function stableHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = (hash << 5) - hash + input.charCodeAt(i);
  return Math.abs(hash).toString(36);
}

function generateFakeBooks(count = 12): DBBook[] {
  const titles = [
    "The Meridian Key",
    "Shadows of Arden",
    "Paper Cities",
    "The Last Librarian",
    "Glass Harbor",
    "Echoes in the Atlas",
    "Midnight Ledger",
    "The Clockmaker's Daughter",
    "River & Ash",
    "The Quiet Cartographer",
    "Signal and Stone",
    "Silent Constellations",
  ];
  const authors = ["A. K. Reynolds", "M. L. Bennett", "S. Ortega", "Rivera Hale", "Jonah Price", "E. Thorne"];

  const sampleChapter = (i: number) => ({
    title: `Chapter ${i + 1}`,
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  });

  return Array.from({ length: count }).map((_, i) => {
    const title = titles[i % titles.length] + (i >= titles.length ? ` (${i + 1})` : "");
    const author = authors[i % authors.length];
    const id = `demo-${stableHash(title + author + String(i))}-${i.toString(36)}`;
    const characters = ["Protagonist", "Rival", "Mentor", "Companion"].slice(0, 2 + (i % 3));
    const chapters = Array.from({ length: 8 + (i % 5) }).map((_, idx) => sampleChapter(idx));
    // Spread created_at over past days for variety (client-side only; no SSR)
    const dayMs = 24 * 60 * 60 * 1000;
    const created_at = new Date(Date.now() - i * dayMs).toISOString();
    return { id, user_id: "demo", title, author, characters, chapters, created_at } as DBBook;
  });
}

type LibraryContextValue = {
  library: DBBook[];
  setLibrary: React.Dispatch<React.SetStateAction<DBBook[]>>;
  addBook: (b: DBBook) => void;
};

const LibraryContext = createContext<LibraryContextValue | undefined>(undefined);

export function LibraryProvider({ children, initialBooks }: { children: ReactNode; initialBooks?: DBBook[] }) {
  const [library, setLibrary] = useState<DBBook[]>(() => (initialBooks && initialBooks.length > 0 ? initialBooks : []));

  // Populate client-side demo books if none were provided by the server
  useEffect(() => {
    if (!initialBooks || initialBooks.length === 0) {
      setLibrary((curr) => (curr.length === 0 ? generateFakeBooks(16) : curr));
    }
  }, [initialBooks]);

  const addBook = (b: DBBook) => {
    setLibrary((prev) => [b, ...prev]);
  };

  return <LibraryContext.Provider value={{ library, setLibrary, addBook }}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}
