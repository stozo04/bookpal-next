"use client";

import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { DBBook } from "@/lib/types";

// small fake data generator (kept lightweight)
function makeId(seed = "") {
  return `${Date.now().toString(36)}-${Math.abs(
    seed.split("").reduce((s, c) => s + c.charCodeAt(0), 0)
  ).toString(36)}`;
}

function generateFakeBooks(count = 10): DBBook[] {
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
  ];
  const authors = ["A. K. Reynolds", "M. L. Bennett", "S. Ortega", "Rivera Hale", "Jonah Price", "E. Thorne"];

  const sampleChapter = (i: number) => ({
    title: `Chapter ${i + 1}`,
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  });

  return Array.from({ length: count }).map((_, i) => {
    const title = titles[i % titles.length] + (i >= titles.length ? ` (${i + 1})` : "");
    const author = authors[i % authors.length];
    const id = makeId(title + author + i);
    const characters = ["Protagonist", "Rival", "Mentor", "Companion"].slice(0, 2 + (i % 3));
    const chapters = Array.from({ length: 8 + (i % 5) }).map((_, idx) => sampleChapter(idx));
    return {
      id,
      user_id: "fake",
      title,
      author,
      characters,
      chapters,
      created_at: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString(),
    } as DBBook;
  });
}

type LibraryContextValue = {
  library: DBBook[];
  setLibrary: React.Dispatch<React.SetStateAction<DBBook[]>>;
  addBook: (b: DBBook) => void;
};

const LibraryContext = createContext<LibraryContextValue | undefined>(undefined);

export function LibraryProvider({ children, initialBooks }: { children: ReactNode; initialBooks?: DBBook[] }) {
  const [library, setLibrary] = useState<DBBook[]>(() => (initialBooks && initialBooks.length > 0 ? initialBooks : generateFakeBooks(12)));

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
