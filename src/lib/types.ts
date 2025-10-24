// src/lib/types.ts
export type Chapter = { title: string; content: string };

export type Book = {
  title: string;
  author: string;
  chapters: Chapter[];
  characters: string[];
};

export type DBBook = {
  id: string;
  user_id: string;
  title: string;
  author: string;
  characters: string[];
  chapters: Chapter[];
  created_at: string;
};
