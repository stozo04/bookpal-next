"use client";
import { useRef, useState } from "react";
import type { Book } from "@/lib/types";

export default function UploadDrop({
  onStructured,
  onSaved,                    // ▶ new
}: { onStructured: (book: Book) => void; onSaved?: (saved: any) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || !files[0]) return;
    const file = files[0];
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/books/structure", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error || "Failed");

      // json.book is DB row (saved), also contains chapters/characters
      onStructured(json.book);
      onSaved?.(json.book);     // ▶ push to library
    } catch (e: any) {
      setErr(e.message || "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="p-4 rounded-4 border bg-white shadow-sm">
      <h5 className="mb-3">Upload a Book</h5>
      <p className="text-secondary mb-3">
        Supported now: <code>.txt</code> (≤ 1 MB). EPUB coming next.
      </p>

      <div
        className="border rounded-4 p-4 mb-3 text-center bg-light"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <p className="mb-2">Drag & drop your file here</p>
        <p className="text-secondary small mb-0">or</p>
        <button
          className="btn btn-outline-primary mt-2"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {busy ? "Processing..." : "Choose file"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,text/plain"
          className="d-none"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {err && <div className="alert alert-danger py-2">{err}</div>}

      <div className="text-muted small">
        Tip: If no OpenAI key is set, we return mock structured output so you can continue building UI.
      </div>
    </div>
  );
}
