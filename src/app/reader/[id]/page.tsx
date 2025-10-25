"use client";

import { useMemo, useState, useEffect, use as useUnwrap } from "react";
import Link from "next/link";

type Chapter = { title: string; content: string };
type DemoBook = { id: string; title: string; author: string; chapters: Chapter[] };

function makeDemoBook(id: string): DemoBook {
  const base = (seed: string) => {
    let h = 0; for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
    return Math.abs(h);
  };
  const seed = base(id);
  const title = ["The Meridian Key", "Paper Cities", "Shadows of Arden"][seed % 3];
  const author = ["A. K. Reynolds", "M. L. Bennett", "S. Ortega"][seed % 3];
  const chapters = Array.from({ length: 14 }).map((_, i) => ({
    title: `Chapter ${i + 1}`,
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. " +
      "Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. " +
      "Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. " +
      "Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue."
  }));
  return { id, title, author, chapters };
}

export default function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = useUnwrap(params);
  const book = useMemo(() => makeDemoBook(id), [id]);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [showSide, setShowSide] = useState(true);
  const [sideMode, setSideMode] = useState<"toc" | "ai">("toc");
  const chapter = book.chapters[chapterIdx];
  const canPrev = chapterIdx > 0;
  const canNext = chapterIdx < book.chapters.length - 1;
  useEffect(() => {
    try { localStorage.setItem('lastOpenedBookId', id); } catch {}
  }, [id]);
  // Hide app sidebar for focused reading
  useEffect(() => {
    document.body.classList.add('reader-fullscreen');
    return () => { document.body.classList.remove('reader-fullscreen'); };
  }, []);

  const paneColClass = showSide ? "col-12 col-lg-9 order-1" : "col-12 order-1";

  return (
    <div className="container-fluid position-relative">
      <div className="row g-3">
        <div className={paneColClass}>
          <div className="p-3 p-md-4 rounded-4 border bg-white shadow-sm reader-pane">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h2 className="h5 mb-1">{book.title}</h2>
                <div className="text-secondary small">by {book.author}</div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => { setSideMode('toc'); setShowSide((s) => !s); }}>{showSide && sideMode==='toc' ? 'Hide' : 'Chapters'}</button>
                <button className="btn btn-outline-secondary btn-sm" disabled={!canPrev} onClick={() => setChapterIdx((i) => Math.max(0, i - 1))}>Prev</button>
                <button className="btn btn-outline-secondary btn-sm" disabled={!canNext} onClick={() => setChapterIdx((i) => Math.min(book.chapters.length - 1, i + 1))}>Next</button>
                <Link href="/library" className="btn btn-primary btn-sm">Back to Library</Link>
              </div>
            </div>
            <h3 className="h6 mb-3">{chapter.title}</h3>
            <ReaderContent text={chapter.content} />
          </div>
        </div>
        {showSide && (
          <div className="col-12 col-lg-3 order-2">
            <aside className="p-3 rounded-4 border bg-white shadow-sm reader-toc">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <strong className="small text-uppercase text-secondary">{sideMode === 'toc' ? 'Chapters' : 'AI Assistant'}</strong>
                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowSide(false)}>Hide</button>
                </div>
              </div>
              {sideMode === 'toc' ? (
                <div className="list-group small">
                  {book.chapters.map((c, i) => (
                    <button
                      key={i}
                      className={`list-group-item list-group-item-action ${i === chapterIdx ? 'active' : ''}`}
                      onClick={() => setChapterIdx(i)}
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  <button className="btn btn-primary">Summarize Chapter</button>
                  <button className="btn btn-outline-primary">Character List</button>
                  <button className="btn btn-outline-primary">Visualize</button>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>

      {/* Floating AI orb */}
      <button
        type="button"
        className="reader-ai-orb"
        aria-label="Open AI assistant"
        onClick={() => { setSideMode('ai'); setShowSide(true); }}
      >
        ✨
      </button>
    </div>
  );
}

function ReaderContent({ text }: { text: string }) {
  const [font, setFont] = useState(18);
  const [width, setWidth] = useState<'narrow' | 'comfort' | 'wide'>("comfort");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [menuKind, setMenuKind] = useState<'word' | 'text'>('text');
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    const onClick = () => { if (menuOpen) setMenuOpen(false); };
    const onScroll = () => { if (menuOpen) setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('click', onClick);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [menuOpen]);

  const handleContextMenu: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const selection = window.getSelection?.();
    const textSel = selection ? selection.toString().trim() : '';
    if (!textSel) return; // allow default menu
    e.preventDefault();
    setSelectedText(textSel);
    const isWord = textSel.length <= 40 && !/\s/.test(textSel);
    setMenuKind(isWord ? 'word' : 'text');
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  };

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <label className="small text-secondary">Font</label>
        <input type="range" min={16} max={22} value={font} onChange={(e) => setFont(parseInt(e.target.value))} />
        <div className="ms-auto btn-group btn-group-sm" role="group" aria-label="Width">
          <button className={`btn btn-outline-primary ${width === 'narrow' ? 'active' : ''}`} onClick={() => setWidth('narrow')}>Narrow</button>
          <button className={`btn btn-outline-primary ${width === 'comfort' ? 'active' : ''}`} onClick={() => setWidth('comfort')}>Comfort</button>
          <button className={`btn btn-outline-primary ${width === 'wide' ? 'active' : ''}`} onClick={() => setWidth('wide')}>Wide</button>
        </div>
      </div>
      <div className={`reader-content ${width}`} style={{ fontSize: font }} onContextMenu={handleContextMenu}>
        <p>{text}</p>
        <p>{text}</p>
        <p>{text}</p>
      </div>

      {menuOpen && (
        <div className="reader-menu shadow" style={{ left: menuPos.x, top: menuPos.y }} role="menu">
          {menuKind === 'word' ? (
            <button className="dropdown-item" role="menuitem" onClick={() => { setMenuOpen(false); alert(`Define: ${selectedText}`); }}>Definition</button>
          ) : (
            <>
              <button className="dropdown-item" role="menuitem" onClick={() => { setMenuOpen(false); alert('Summarize selection'); }}>Summarize</button>
              <button className="dropdown-item" role="menuitem" onClick={() => { setMenuOpen(false); alert('Visualize selection'); }}>Visualize</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}


