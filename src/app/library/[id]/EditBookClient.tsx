"use client";

import React, { useRef, useState } from "react";

type BookInfo = {
  id: string;
  title: string;
  author: string;
  cover_storage_path?: string | null;
  cover_url?: string | null;
  cover_source?: string | null;
  cover_public_url?: string | null;
  // Optional future fields (may be undefined if not selected on server)
  genre?: string | null;
  isbn?: string | null;
  description?: string | null;
};

export default function EditBookClient({ book }: { book: BookInfo }) {
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [coverPath, setCoverPath] = useState<string | null | undefined>(book.cover_storage_path);
  const [genre, setGenre] = useState<string>(book.genre || "");
  
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [progressPct, setProgressPct] = useState<number | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [coverVersion, setCoverVersion] = useState<number>(0);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const publicBase = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const coverUrl = (coverPath ? `${publicBase}/storage/v1/object/public/covers/${coverPath}${coverVersion ? `?v=${coverVersion}` : ''}` : (book.cover_public_url || null));

  // Load extra data for progress and summary (best-effort)
  async function loadBookContext() {
    try {
      const [bookRes, progRes] = await Promise.all([
        fetch(`/api/books/get?id=${book.id}`),
        fetch(`/api/books/progress?id=${book.id}`)
      ]);
      const bookJson = await bookRes.json().catch(() => ({}));
      const progJson = await progRes.json().catch(() => ({}));
      const chapters = (bookJson?.book?.chapters || []) as Array<{ title?: string; content?: string; summary?: string }>;
      if (Array.isArray(chapters) && chapters.length) {
        const existing = chapters.find((c) => c.summary && String(c.summary).trim().length > 0)?.summary as string | undefined;
        if (existing && !summary) setSummary(existing);
      }
      const chapterCount = Array.isArray(chapters) ? chapters.length : 0;
      const chIdx = progJson?.progress?.chapter_idx;
      if (typeof chIdx === 'number' && chapterCount > 0) {
        setProgressPct(Math.min(100, Math.max(0, Math.round(((chIdx + 1) / chapterCount) * 100))))
      }
    } catch {}
  }

  // kick on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { loadBookContext(); }, []);

  async function saveMeta() {
    setWorking(true); setMessage("");
    try {
      const payload: any = { id: book.id, title, author };
      if (genre) payload.genre = genre;
      const res = await fetch('/api/books/update', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || 'Failed');
      setMessage('Saved');
    } catch (e: any) {
      setMessage(e?.message || 'Failed');
    } finally {
      setWorking(false);
    }
  }

  // findCover removed per request

  async function uploadCover() {
    if (!fileRef.current || !fileRef.current.files || fileRef.current.files.length === 0) { setMessage('Choose a file first'); return; }
    setWorking(true); setMessage("");
    try {
      const fd = new FormData();
      fd.append('id', book.id);
      fd.append('file', fileRef.current.files[0]);
      const res = await fetch('/api/books/cover/upload', { method: 'POST', body: fd });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || 'Failed');
      setCoverPath(j.path);
      setCoverVersion(Date.now());
      setMessage('Cover uploaded');
    } catch (e: any) {
      setMessage(e?.message || 'Failed');
    } finally { setWorking(false); }
  }

  const genreOptions = ['Fiction', 'Nonfiction', 'Romance', 'Mystery', 'Sci‑Fi', 'Fantasy', 'History', 'Biography'];

  return (
    <>
      <div className="row g-4">
        {/* LEFT: Visual panel */}
        <div className="col-12 col-lg-5">
          <div className="border rounded-4 p-3 p-md-4 bg-white shadow-sm h-100 d-flex flex-column">
            <div className="position-relative rounded-3 overflow-hidden border" style={{ width: '100%', aspectRatio: '3 / 4' }}>
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={coverUrl} src={coverUrl} alt="Cover" style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }} />
              ) : (
                <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-body-tertiary text-secondary small">No Image</div>
              )}
            </div>
            <div className="d-none">
              <input ref={fileRef} type="file" accept="image/*" onChange={() => { uploadCover(); }} />
            </div>
            <div className="mt-3 d-flex justify-content-center">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => fileRef.current?.click()} disabled={working}>Change cover</button>
            </div>
            {message && (
              <div className="small text-secondary mt-2" role="status">{message}</div>
            )}
          </div>
        </div>

        {/* RIGHT: Data panel */}
        <div className="col-12 col-lg-7">
          <div className="border rounded-4 p-3 p-md-4 bg-white shadow-sm h-100">
            <h2 className="h5 mb-3">Book Details</h2>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-control" placeholder="Book title" />
            </div>
            <div className="mb-3">
              <label className="form-label">Author</label>
              <input value={author} onChange={(e) => setAuthor(e.target.value)} className="form-control" placeholder="Author" />
            </div>
            <div className="mb-4">
              <label className="form-label">Genre / Category</label>
              <select className="form-select" value={genre} onChange={(e) => setGenre(e.target.value)}>
                <option value="">Select genre</option>
                {genreOptions.map((g) => (<option key={g} value={g}>{g}</option>))}
              </select>
            </div>

            {/* space intentionally left for future quick stats */}

            {/* Reading Progress */}
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <label className="form-label mb-0">Reading Progress</label>
                <div className="small text-secondary">{progressPct != null ? `${progressPct}%` : '—'}</div>
              </div>
              <div className="progress" role="progressbar" aria-label="Reading progress" aria-valuenow={progressPct || 0} aria-valuemin={0} aria-valuemax={100}>
                <div className="progress-bar" style={{ width: `${progressPct || 0}%` }} />
              </div>
            </div>

            {/* Summary generator */}
            <div className="mb-2">
              <label className="form-label">Summary</label>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <button className="btn btn-outline-warning" disabled={generatingSummary} onClick={async () => {
                  setGeneratingSummary(true);
                  try {
                    const r = await fetch(`/api/books/get?id=${book.id}`);
                    const j = await r.json();
                    const chapters = (j?.book?.chapters || []) as Array<{ content?: string }>;
                    const sample = chapters.slice(0, 2).map((c) => c.content || '').join('\n\n').slice(0, 12000);
                    if (!sample) { setSummary('No chapter content available yet.'); return; }
                    const res = await fetch('/api/ai/summarize', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: sample }) });
                    const sj = await res.json();
                    setSummary(sj.summary || sj.error || 'Unable to generate summary.');
                  } catch (e: any) {
                    setSummary(e?.message || 'Failed to generate summary.');
                  } finally { setGeneratingSummary(false); }
                }}>{generatingSummary ? 'Generating…' : 'Generate summary'}</button>
                {summary && <span className="small text-secondary">Preview below</span>}
              </div>
              {summary && (
                <div className="form-text mt-2" style={{ whiteSpace: 'pre-wrap' }}>{summary}</div>
              )}
            </div>

            {/* Additional Info removed per request */}

            <div className="mb-2 d-flex align-items-center justify-content-between">
              <h3 className="h6 mb-0">Advanced Tools</h3>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowAdvanced((s) => !s)} aria-expanded={showAdvanced} aria-controls="advanced-tools">
                {showAdvanced ? 'Hide' : 'Show'}
              </button>
            </div>
            {showAdvanced && (
              <div id="advanced-tools" className="mb-2 d-flex flex-wrap gap-2">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => {
                  // Rebuild cover: simple alias to upload/find flows removed; placeholder for future automation
                  setMessage('Rebuild cover is not available without Find cover. Upload a new image instead.');
                }} disabled={working}>Rebuild cover</button>
                <button className="btn btn-outline-secondary btn-sm" onClick={async () => {
                  setWorking(true); setMessage('');
                  try {
                    const res = await fetch('/api/books/characters/build', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ bookId: book.id }) });
                    const j = await res.json();
                    setMessage(j.ok ? `Rebuilt characters (${j.count})` : (j.error || 'Failed'));
                  } catch (e: any) {
                    setMessage(e?.message || 'Failed');
                  } finally { setWorking(false); }
                }}>Rebuild characters</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky footer actions */}
      <div className="position-sticky bottom-0 mt-4" style={{ zIndex: 1030 }}>
        <div className="rounded-4 border bg-white shadow-sm p-2 p-md-3 d-flex align-items-center justify-content-between">
          <div className="small text-secondary">{message}</div>
          <div className="d-flex gap-2">
            <a href="/library" className="btn btn-outline-secondary">Cancel</a>
            <button className="btn btn-primary" onClick={saveMeta} disabled={working}>Save changes</button>
          </div>
        </div>
      </div>
    </>
  );
}


