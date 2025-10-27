"use client";

import { useRef, useState } from "react";

type BookInfo = {
  id: string;
  title: string;
  author: string;
  cover_storage_path?: string | null;
  cover_url?: string | null;
  cover_source?: string | null;
  cover_public_url?: string | null;
};

export default function EditBookClient({ book }: { book: BookInfo }) {
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [coverPath, setCoverPath] = useState<string | null | undefined>(book.cover_storage_path);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const publicBase = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const coverUrl = book.cover_public_url || (coverPath ? `${publicBase}/storage/v1/object/public/covers/${coverPath}` : null);

  async function saveMeta() {
    setWorking(true); setMessage("");
    try {
      const res = await fetch('/api/books/update', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: book.id, title, author }) });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || 'Failed');
      setMessage('Saved');
    } catch (e: any) {
      setMessage(e?.message || 'Failed');
    } finally {
      setWorking(false);
    }
  }

  async function findCover() {
    setWorking(true); setMessage("");
    try {
      const res = await fetch(`/api/books/cover/search?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`);
      const data = await res.json();
      const items = data.items || [];
      const pick = items[0];
      if (!pick) { setMessage('No cover found'); return; }
      const setRes = await fetch('/api/books/cover/set', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: book.id, imageUrl: pick.image, source: pick.source, source_id: pick.source_id, source_url: pick.image }) });
      const sj = await setRes.json();
      if (!sj.ok) throw new Error(sj.error || 'Failed to set cover');
      setCoverPath(sj.path);
      setMessage('Cover updated');
    } catch (e: any) {
      setMessage(e?.message || 'Failed');
    } finally {
      setWorking(false);
    }
  }

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
      setMessage('Cover uploaded');
    } catch (e: any) {
      setMessage(e?.message || 'Failed');
    } finally { setWorking(false); }
  }

  return (
    <div className="row g-4">
      <div className="col-12 col-md-4">
        <div className="border rounded-3 p-3 d-flex flex-column gap-3">
          <div className="bg-body-tertiary rounded-3 overflow-hidden" style={{ width: '100%', aspectRatio: '3 / 4', position: 'relative' }}>
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="Cover" style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }} />
            ) : (
              <div className="text-secondary small">No Image</div>
            )}
          </div>
          <div className="d-flex gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="form-control form-control-sm" />
            <button className="btn btn-outline-secondary btn-sm" onClick={uploadCover} disabled={working}>Upload</button>
          </div>
          <button className="btn btn-outline-primary btn-sm" onClick={findCover} disabled={working}>Find cover</button>
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
      </div>
      <div className="col-12 col-md-8">
        <div className="border rounded-3 p-3">
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-control" />
          </div>
          <div className="mb-3">
            <label className="form-label">Author</label>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} className="form-control" />
          </div>
          <div className="d-flex gap-2 align-items-center">
            <button className="btn btn-primary" onClick={saveMeta} disabled={working}>Save changes</button>
            <a href="/library" className="btn btn-outline-secondary">Back</a>
            {message && <span className="small text-secondary">{message}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}


