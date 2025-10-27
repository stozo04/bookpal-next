"use client";

import { useMemo, useState, useEffect, use as useUnwrap, useRef } from "react";
import { defineWord } from "@/lib/openai";
import Link from "next/link";
import { GearFill, Stars } from "react-bootstrap-icons";

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
  const [dbBook, setDbBook] = useState<DemoBook | null>(null as any);
  const book = useMemo(() => dbBook || makeDemoBook(id), [dbBook, id]);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [showSide, setShowSide] = useState(true);
  const [sideMode, setSideMode] = useState<"toc" | "ai" | "settings">("toc");
  const [fontSize, setFontSize] = useState(18);
  const [width, setWidth] = useState<'narrow' | 'comfort' | 'wide'>("comfort");
  const chapter = book.chapters[chapterIdx];
  const [pageIdx, setPageIdx] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const canPrev = chapterIdx > 0 || pageIdx > 0;
  const canNext = chapterIdx < book.chapters.length - 1 || pageIdx < pageCount - 1;
  useEffect(() => {
    try { localStorage.setItem('lastOpenedBookId', id); } catch {}
  }, [id]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/books/get?id=${id}`);
        const json = await res.json();
        if (json?.ok && json.book?.chapters?.length) {
          setDbBook(json.book);
        }
      } catch {}
    })();
  }, [id]);

  // Reset pagination when chapter changes
  useEffect(() => { setPageIdx(0); }, [chapterIdx]);

  function handleNext() {
    if (pageIdx < pageCount - 1) {
      setPageIdx((p) => p + 1);
    } else if (chapterIdx < book.chapters.length - 1) {
      setChapterIdx((i) => i + 1);
      setPageIdx(0);
    }
  }

  function handlePrev() {
    if (pageIdx > 0) {
      setPageIdx((p) => p - 1);
    } else if (chapterIdx > 0) {
      setChapterIdx((i) => Math.max(0, i - 1));
      setPageIdx(0);
    }
  }
  // Hide app sidebar for focused reading
  useEffect(() => {
    document.body.classList.add('reader-fullscreen');
    return () => { document.body.classList.remove('reader-fullscreen'); };
  }, []);
  // Load/save reader prefs (placeholder for Profile integration)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('reader_prefs');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.fontSize === 'number') setFontSize(parsed.fontSize);
        if (parsed.width === 'narrow' || parsed.width === 'comfort' || parsed.width === 'wide') setWidth(parsed.width);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('reader_prefs', JSON.stringify({ fontSize, width })); } catch {}
  }, [fontSize, width]);

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
                <div className="text-secondary small">Chapter {chapterIdx + 1} · Page {pageIdx + 1}/{pageCount}</div>
              </div>
              <div className="button-container">
                <div className="button-row">
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => { setSideMode('toc'); setShowSide((s) => !s); }}>{showSide && sideMode==='toc' ? 'Hide' : 'Chapters'}</button>
                  <button className="btn btn-outline-secondary btn-sm" disabled={!canPrev} onClick={handlePrev}>Prev</button>
                  <button className="btn btn-outline-secondary btn-sm" disabled={!canNext} onClick={handleNext}>Next</button>
                  <Link href="/library" className="btn btn-primary btn-sm">Back to Library</Link>
                </div>
                <div className="button-row">
                  <button className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1" onClick={() => { setSideMode('settings'); setShowSide(true); }} title="Reading settings">
                    <GearFill size={14} />
                  </button>
                </div>
                <div className="button-row">
                  <button className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1" onClick={() => { setSideMode('ai'); setShowSide(true); }} title="AI Assistant" aria-label="AI Assistant">
                    <Stars size={14} />
                  </button>
                </div>
              </div>
            </div>
            <h3 className="h6 mb-3">{chapter.title}</h3>
            <ReaderContent text={chapter.content} font={fontSize} width={width} sideKey={`${sideMode}-${showSide}`} pageIdx={pageIdx} onPageCount={setPageCount} />
            {('summary' in chapter) && (chapter as any).summary && (
              <div className="mt-4 p-3 rounded-3 bg-body-tertiary border">
                <div className="small text-secondary mb-1">AI Summary</div>
                <div>{(chapter as any).summary}</div>
              </div>
            )}
          </div>
        </div>
        {showSide && (
          <div className="col-12 col-lg-3 order-2">
            <aside className="p-3 rounded-4 border bg-white shadow-sm reader-toc">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <strong className="small text-uppercase text-secondary">{sideMode === 'toc' ? 'Chapters' : sideMode === 'ai' ? 'AI Assistant' : 'Reading Settings'}</strong>
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
              ) : sideMode === 'ai' ? (
                <div className="d-flex flex-column gap-3">
                  <div>
                    <div className="small text-secondary mb-2">Quick actions</div>
                    <div className="d-flex flex-column gap-2">
                      <button className="btn btn-primary w-100" onClick={() => alert('Summarize Chapter')}>Summarize Chapter</button>
                      <button className="btn btn-outline-primary w-100" onClick={() => alert('Character List')}>Character List</button>
                      <button className="btn btn-outline-primary w-100" onClick={() => alert('Visualize')}>Visualize</button>
                    </div>
                  </div>
                  <div>
                    <label className="small text-secondary d-block mb-1">Ask a question</label>
                    <textarea className="form-control" rows={3} placeholder="Ask about this chapter…" />
                    <div className="d-flex justify-content-end mt-2">
                      <button className="btn btn-primary btn-sm" onClick={() => alert('Ask AI')}>Ask</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  <div>
                    <label className="small text-secondary d-block mb-1">Font size</label>
                    <input type="range" min={16} max={22} value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-100" />
                  </div>
                  <div>
                    <label className="small text-secondary d-block mb-1">Width</label>
                    <div className="btn-group btn-group-sm w-100" role="group" aria-label="Width">
                      <button className={`btn btn-outline-primary ${width === 'narrow' ? 'active' : ''}`} onClick={() => setWidth('narrow')}>Narrow</button>
                      <button className={`btn btn-outline-primary ${width === 'comfort' ? 'active' : ''}`} onClick={() => setWidth('comfort')}>Comfort</button>
                      <button className={`btn btn-outline-primary ${width === 'wide' ? 'active' : ''}`} onClick={() => setWidth('wide')}>Wide</button>
                    </div>
                  </div>
                  <small className="text-secondary">These preferences will sync to your profile soon.</small>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>

      {/* AI Assistant now opens in side panel via sideMode === 'ai' */}
    </div>
  );
}

function ReaderContent({ text, font, width, sideKey, pageIdx, onPageCount }: { text: string; font: number; width: 'narrow' | 'comfort' | 'wide'; sideKey: string; pageIdx: number; onPageCount: (n: number) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [menuKind, setMenuKind] = useState<'word' | 'text'>('text');
  const [selectedText, setSelectedText] = useState('');
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [popContent, setPopContent] = useState<string>("");
  const [popPos, setPopPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [popOpen, setPopOpen] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pages, setPages] = useState<string[]>([text]);

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

  // Manage bootstrap popover lifecycle
  useEffect(() => {
    if (!popOpen || !anchorRef.current) return;
    const Popover = (window as any).bootstrap?.Popover;
    if (!Popover) { setShowFallback(true); return; }
    const el = anchorRef.current;
    const instance = new Popover(el, {
      container: 'body',
      html: true,
      placement: 'top',
      title: `Definition: ${selectedText}`,
      content: `<div class="small">${popContent.replace(/</g, '&lt;')}</div>`,
      trigger: 'manual',
    });
    instance.show();
    const close = () => { try { instance.hide(); } catch {} setPopOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    const onClick = () => close();
    window.addEventListener('keydown', onKey);
    window.addEventListener('click', onClick, { once: true });
    window.addEventListener('scroll', onClick, { once: true, capture: true });
    return () => {
      try { instance.dispose(); } catch {}
      window.removeEventListener('keydown', onKey);
    };
  }, [popOpen, popContent, selectedText]);

  // Auto-dismiss when the side panel toggles or mode changes
  useEffect(() => {
    if (popOpen) setPopOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sideKey]);

  // Recompute pages when text/width/font changes
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Measure approx chars per page based on container width and font size
    // Very rough heuristic: characters per line ~= containerWidth / (fontSize * 0.6)
    const containerWidth = el.clientWidth || 600;
    const charsPerLine = Math.max(30, Math.floor(containerWidth / (font * 0.6)));
    const linesPerPage = width === 'narrow' ? 24 : width === 'comfort' ? 28 : 32;
    const charsPerPage = Math.max(500, Math.floor(charsPerLine * linesPerPage));
    const arr: string[] = [];
    let i = 0;
    const clean = text.replace(/\n{3,}/g, "\n\n");
    while (i < clean.length) {
      arr.push(clean.slice(i, i + charsPerPage));
      i += charsPerPage;
    }
    setPages(arr.length ? arr : [clean]);
    onPageCount(arr.length || 1);
  }, [text, font, width, sideKey, onPageCount]);

  const pageText = pages[Math.min(pageIdx, Math.max(0, pages.length - 1))] || '';

  return (
    <div>
      <div ref={containerRef} className={`reader-content ${width}`} style={{ fontSize: font }} onContextMenu={handleContextMenu}>
        {pageText.split(/\n\n/).map((p, i) => (<p key={i}>{p}</p>))}
      </div>

      {menuOpen && (
        <div className="reader-menu shadow" style={{ left: menuPos.x, top: menuPos.y }} role="menu">
          {menuKind === 'word' ? (
            <button className="dropdown-item" role="menuitem" onClick={async () => {
              setMenuOpen(false);
              // call through API route to ensure server-side key usage and visible network entry
              const res = await fetch(`/api/ai/define?word=${encodeURIComponent(selectedText)}`);
              const data = await res.json();
              const def = data.definition || data.error || 'No definition available.';
              const sel = window.getSelection?.();
              let x = menuPos.x, y = menuPos.y;
              try {
                if (sel && sel.rangeCount > 0) {
                  const rect = sel.getRangeAt(0).getBoundingClientRect();
                  x = rect.left + rect.width / 2;
                  // default above; clamp inside viewport and flip if needed
                  const vh = window.innerHeight || document.documentElement.clientHeight || 800;
                  const vw = window.innerWidth || document.documentElement.clientWidth || 1200;
                  const maxWidth = 320; const half = maxWidth / 2; const margin = 12;
                  x = Math.max(half + margin, Math.min(vw - half - margin, x));
                  const preferTop = rect.top > 90;
                  y = preferTop ? rect.top - 8 : rect.bottom + 8;
                  if (!preferTop && y + 140 > vh) { y = rect.top - 8; }
                }
              } catch {}
              setPopContent(def);
              setPopPos({ x, y });
              setShowFallback(true);
              setPopOpen(true);
            }}>Definition</button>
          ) : (
            <>
              <button className="dropdown-item" role="menuitem" onClick={() => { setMenuOpen(false); alert('Summarize selection'); }}>Summarize</button>
              <button className="dropdown-item" role="menuitem" onClick={() => { setMenuOpen(false); alert('Visualize selection'); }}>Visualize</button>
            </>
          )}
        </div>
      )}

      {/* Popover anchor */}
      <button ref={anchorRef} className="reader-popover-anchor" style={{ left: popPos.x, top: popPos.y }} aria-hidden="true" />
      {popOpen && showFallback && (
        <div className="reader-def-popover" style={{ left: popPos.x, top: popPos.y }}>
          <div className="reader-def-popover-title">Definition: {selectedText}</div>
          <div className="reader-def-popover-body">{popContent}</div>
        </div>
      )}
    </div>
  );
}


