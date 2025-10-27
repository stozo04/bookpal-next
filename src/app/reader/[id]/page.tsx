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
  const [fontFamily, setFontFamily] = useState<string>("");
  const chapter = book.chapters[chapterIdx];
  const [pageIdx, setPageIdx] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [chapterPageCounts, setChapterPageCounts] = useState<number[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<string>("");
  const [saving, setSaving] = useState(false);
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

  // Track page count per chapter so TOC can show page numbers for current chapter
  useEffect(() => {
    setChapterPageCounts((prev) => {
      const next = prev.slice();
      next[chapterIdx] = pageCount;
      return next;
    });
  }, [pageCount, chapterIdx]);

  // Lazy pre-compute page counts for all chapters when we know container width / font / width
  useEffect(() => {
    if (!containerWidth) return;
    const charsPerLine = Math.max(30, Math.floor(containerWidth / (fontSize * 0.6)));
    const linesPerPage = width === 'narrow' ? 24 : width === 'comfort' ? 28 : 32;
    const charsPerPage = Math.max(500, Math.floor(charsPerLine * linesPerPage));
    const counts = book.chapters.map((ch) => {
      const clean = (ch as any).content?.toString?.() || '';
      const normalized = clean.replace(/\n{3,}/g, '\n\n');
      return Math.max(1, Math.ceil(normalized.length / charsPerPage));
    });
    setChapterPageCounts(counts);
  }, [containerWidth, fontSize, width, book.chapters, fontFamily]);

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

  // Autosave progress (debounced)
  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        await fetch('/api/books/progress', {
          method: 'POST', headers: { 'content-type': 'application/json' }, signal: ctrl.signal,
          body: JSON.stringify({ bookId: book.id, chapterIdx, pageIdx, fontSize, width, fontFamily })
        });
      } catch {}
    }, 600);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [book.id, chapterIdx, pageIdx, fontSize, width, fontFamily]);

  // Restore progress on load
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/books/progress?id=${book.id}`);
        const json = await res.json();
        if (json?.ok && json.progress) {
          if (typeof json.progress.chapter_idx === 'number') setChapterIdx(json.progress.chapter_idx);
          if (typeof json.progress.page_idx === 'number') setPageIdx(json.progress.page_idx);
          if (typeof json.progress.font_size === 'number') setFontSize(json.progress.font_size);
          if (json.progress.width === 'narrow' || json.progress.width === 'comfort' || json.progress.width === 'wide') setWidth(json.progress.width);
          if (typeof json.progress.font_family === 'string') setFontFamily(json.progress.font_family);
        }
      } catch {}
    })();
  }, [book.id]);
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
                  <Link
                    href="/library"
                    className={`btn btn-primary btn-sm ${saving ? 'disabled' : ''}`}
                    onClick={async (e) => {
                      try {
                        setSaving(true);
                        await fetch('/api/books/progress', {
                          method: 'POST', headers: { 'content-type': 'application/json' },
                          body: JSON.stringify({ bookId: book.id, chapterIdx, pageIdx, fontSize, width, fontFamily })
                        });
                      } catch {} finally { setSaving(false); }
                    }}
                  >
                    {saving ? 'Saving…' : 'Back to Library'}
                  </Link>
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
            <ReaderContent text={chapter.content} font={fontSize} fontFamily={fontFamily} width={width} sideKey={`${sideMode}-${showSide}`} pageIdx={pageIdx} onPageCount={setPageCount} onMeasureWidth={setContainerWidth} />
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
                    <div key={i} className="mb-1">
                      <button
                        className={`list-group-item list-group-item-action ${i === chapterIdx ? 'active' : ''}`}
                        onClick={() => { setChapterIdx(i); setPageIdx(0); }}
                      >
                        {c.title}
                      </button>
                      {i === chapterIdx && (
                        <div className="list-group small mt-2">
                          {Array.from({ length: chapterPageCounts[i] || pageCount }).map((_, j) => (
                            <button
                              key={j}
                              className={`list-group-item list-group-item-action ${j === pageIdx ? 'active' : ''}`}
                              onClick={() => setPageIdx(j)}
                            >
                              Page {j + 1}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : sideMode === 'ai' ? (
                <div className="d-flex flex-column gap-3">
                  <div>
                    <div className="small text-secondary mb-2">Quick actions</div>
                    <div className="d-flex flex-column gap-2">
                      <button
                        className="btn btn-primary w-100"
                        disabled={aiLoading}
                        onClick={async () => {
                          try {
                            setAiLoading(true);
                            setAiOutput("");
                            const res = await fetch('/api/ai/summarize', {
                              method: 'POST', headers: { 'content-type': 'application/json' },
                              body: JSON.stringify({ text: chapter.content })
                            });
                            const data = await res.json();
                            setAiOutput(data.summary || data.error || 'Unable to summarize chapter.');
                          } catch (e: any) {
                            setAiOutput('Failed to summarize chapter.');
                          } finally {
                            setAiLoading(false);
                          }
                        }}
                      >
                        {aiLoading ? 'Summarizing…' : 'Summarize Chapter'}
                      </button>
                      <button className="btn btn-outline-primary w-100" onClick={() => alert('Character List')}>Character List</button>
                      <button className="btn btn-outline-primary w-100" onClick={() => alert('Visualize')}>Visualize</button>
                    </div>
                  </div>
                  {aiOutput && (
                    <div className="border rounded-3 p-2 bg-body-tertiary" style={{ maxHeight: 260, overflow: 'auto' }}>
                      <div className="small text-secondary mb-1">AI Summary (this chapter)</div>
                      <div className="small" style={{ whiteSpace: 'pre-wrap' }}>{aiOutput}</div>
                    </div>
                  )}
                  <div>
                    <label className="small text-secondary d-block mb-1">Ask a question</label>
                    <textarea className="form-control" rows={3} placeholder="Ask about this chapter…" />
                    <div className="d-flex justify-content-end mt-2">
                      <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => setAiOutput("")}>Clear</button>
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
                    <label className="small text-secondary d-block mb-1">Font family</label>
                    <div className="text-secondary small mb-2">Pick a typeface. Serif suits long reading; sans-serif is great for UI and notes.</div>
                    {[
                      {
                        group: 'Serif (for long reading)',
                        fonts: [
                          { name: 'Literata', css: 'Literata', description: "Google Play Books’ typeface – calm, bookish, beautifully tuned for paragraphs." },
                          { name: 'Crimson Pro', css: 'Crimson Pro', description: "Classic 'Garamond-ish' vibe, elegant at body sizes." },
                          { name: 'Spectral', css: 'Spectral', description: "Contemporary book serif with strong italics; great on screens." },
                          { name: 'Lora', css: 'Lora', description: "Warm, sturdy, handles small sizes well." },
                          { name: 'Merriweather', css: 'Merriweather', description: "A bit larger x-height; very readable on low-contrast screens." },
                          { name: 'EB Garamond', css: 'EB Garamond', description: "Historical flavor; gorgeous at 18–22px." },
                          { name: 'Charis SIL', css: 'Charis SIL', description: "Book workhorse, wide language support." },
                          { name: 'Noto Serif', css: 'Noto Serif', description: "Massive language coverage; sensible defaults." },
                        ]
                      },
                      {
                        group: 'Sans-Serif (for UI & notes)',
                        fonts: [
                          { name: 'Inter', css: 'Inter', description: "The web’s friendly UI champ; excellent hinting and symbols." },
                          { name: 'Source Sans 3', css: 'Source Sans 3', description: "Humanist, neutral, pairs with Source Serif." },
                          { name: 'IBM Plex Sans', css: 'IBM Plex Sans', description: "Crisp, techy, still very legible." },
                          { name: 'Public Sans', css: 'Public Sans', description: "U.S. Web Design System’s sans; dependable and quiet." },
                          { name: 'PT Sans', css: 'PT Sans', description: "Compact, readable; pairs with PT Serif." },
                          { name: 'Atkinson Hyperlegible', css: 'Atkinson Hyperlegible', description: "Designed for clarity; great accessibility option." },
                          { name: 'Lexend', css: 'Lexend', description: "Research-driven to reduce visual crowding; many widths/grades." },
                          { name: 'Noto Sans', css: 'Noto Sans', description: "Pan-script coverage; safe default." },
                        ]
                      }
                    ].map((grp, gi) => (
                      <div key={gi} className="mb-2">
                        <div className="small fw-semibold mb-1">{grp.group}</div>
                        <div className="list-group">
                          {grp.fonts.map((f, fi) => (
                            <label key={fi} className="list-group-item d-flex align-items-start gap-2">
                              <input
                                type="radio"
                                name="reader-font"
                                className="form-check-input mt-1"
                                checked={fontFamily === f.css}
                                onChange={() => setFontFamily(f.css)}
                              />
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center justify-content-between">
                                  <span>{f.name}</span>
                                  <span className="text-secondary small" style={{ fontFamily: f.css }}>{f.name}</span>
                                </div>
                                <div className="text-secondary small">{f.description}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
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

function ReaderContent({ text, font, fontFamily, width, sideKey, pageIdx, onPageCount, onMeasureWidth }: { text: string; font: number; fontFamily: string; width: 'narrow' | 'comfort' | 'wide'; sideKey: string; pageIdx: number; onPageCount: (n: number) => void; onMeasureWidth: (w: number) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [menuKind, setMenuKind] = useState<'word' | 'text'>('text');
  const [selectedText, setSelectedText] = useState('');
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [popContent, setPopContent] = useState<string>("");
  const [popPos, setPopPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [popOpen, setPopOpen] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [popLoading, setPopLoading] = useState(false);
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
    const containerWidth = el.clientWidth || 600;
    onMeasureWidth(containerWidth);
    // We'll compute line height from the measuring container to avoid unitless values
    const maxLines = width === 'narrow' ? 24 : width === 'comfort' ? 28 : 32;

    // Build an offscreen measuring container
    const meas = document.createElement('div');
    meas.style.position = 'fixed';
    meas.style.left = '-99999px';
    meas.style.top = '-99999px';
    meas.style.visibility = 'hidden';
    meas.style.pointerEvents = 'none';
    meas.className = `reader-content ${width}`;
    meas.style.width = `${containerWidth}px`;
    meas.style.fontSize = `${font}px`;
    if (fontFamily) meas.style.fontFamily = fontFamily;
    document.body.appendChild(meas);

    // Split into paragraphs but preserve content by keeping final newline-joins identical on output
    const normalized = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
    const paragraphs = normalized.split(/\n\n/);
    const builtPages: string[] = [];
    let pageParas: string[] = [];
    meas.innerHTML = '';

    // Compute line height in pixels from meas (handles unitless values)
    const lhStr = window.getComputedStyle(meas).lineHeight;
    let lineHeightPx = parseFloat(lhStr);
    if (lhStr.endsWith('px') && !Number.isNaN(lineHeightPx) && lineHeightPx > 0) {
      // ok
    } else if (!Number.isNaN(lineHeightPx) && lineHeightPx > 0 && lineHeightPx < 10) {
      lineHeightPx = lineHeightPx * font; // unitless multiplier
    } else {
      lineHeightPx = Math.max(1, font * 1.5);
    }

    const flushPage = () => {
      if (pageParas.length) builtPages.push(pageParas.join('\n\n'));
      pageParas = [];
      meas.innerHTML = '';
    };

    const measureLines = (paras: string[]) => {
      meas.innerHTML = paras.map((t) => `<p>${t.replace(/</g, '&lt;')}</p>`).join('');
      return Math.ceil(meas.scrollHeight / lineHeightPx);
    };

    const splitParagraphToPages = (paraText: string) => {
      const words = paraText.split(/\s+/);
      let start = 0;
      while (start < words.length) {
        // If nothing fits on current page, flush to start a fresh page
        if (measureLines(pageParas.concat([''])) > maxLines) {
          flushPage();
        }
        let lo = 1, hi = words.length - start, best = 0;
        while (lo <= hi) {
          const mid = Math.floor((lo + hi) / 2);
          const candidate = words.slice(start, start + mid).join(' ');
          const lines = measureLines(pageParas.concat([candidate]));
          if (lines <= maxLines) { best = mid; lo = mid + 1; } else { hi = mid - 1; }
        }
        if (best === 0) {
          // Not even one word fits → new page
          flushPage();
          continue;
        }
        const segment = words.slice(start, start + best).join(' ');
        pageParas.push(segment);
        start += best;
        if (start < words.length) {
          // More words remain → finalize this page and continue
          flushPage();
        }
      }
    };

    for (const p of paragraphs) {
      // If paragraph fits fully, append; otherwise split by words using binary search
      const fits = measureLines(pageParas.concat([p])) <= maxLines;
      if (fits) {
        pageParas.push(p);
      } else {
        splitParagraphToPages(p);
      }
    }
    flushPage();

    document.body.removeChild(meas);

    // Guard: if reconstruction appears to drop content, fall back to a simple character-based paging
    const joined = builtPages.join('\n\n');
    if (joined.length < text.length * 0.9) {
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
      return;
    }

    // If everything fits into one page but is clearly long, split by characters as a last resort
    if (builtPages.length <= 1) {
      const charsPerLine = Math.max(30, Math.floor(containerWidth / (font * 0.6)));
      const linesPerPage = width === 'narrow' ? 24 : width === 'comfort' ? 28 : 32;
      const charsPerPage = Math.max(500, Math.floor(charsPerLine * linesPerPage));
      if (normalized.length > Math.floor(charsPerPage * 1.1)) {
        const arr: string[] = [];
        let i = 0;
        while (i < normalized.length) {
          arr.push(normalized.slice(i, i + charsPerPage));
          i += charsPerPage;
        }
        setPages(arr.length ? arr : [normalized]);
        onPageCount(arr.length || 1);
        return;
      }
    }

    setPages(builtPages.length ? builtPages : [normalized]);
    onPageCount(builtPages.length || 1);
  // Only re-run when these scalar inputs change. Avoid passing functions/objects that change identity
  }, [text, font, fontFamily, width, sideKey]);

  const pageText = pages[Math.min(pageIdx, Math.max(0, pages.length - 1))] || '';

  return (
    <div>
      <div ref={containerRef} className={`reader-content ${width}`} style={{ fontSize: font, fontFamily: fontFamily || undefined }} onContextMenu={handleContextMenu}>
        {pageText.split(/\n\n/).map((p, i) => (<p key={i}>{p}</p>))}
      </div>

      {menuOpen && (
        <div className="reader-menu shadow" style={{ left: menuPos.x, top: menuPos.y }} role="menu">
          {menuKind === 'word' ? (
            <button className="dropdown-item" role="menuitem" onClick={async () => {
              setMenuOpen(false);
              // position near selection
              const sel = window.getSelection?.();
              let x = menuPos.x, y = menuPos.y;
              try {
                if (sel && sel.rangeCount > 0) {
                  const rect = sel.getRangeAt(0).getBoundingClientRect();
                  x = rect.left + rect.width / 2;
                  const vh = window.innerHeight || document.documentElement.clientHeight || 800;
                  const vw = window.innerWidth || document.documentElement.clientWidth || 1200;
                  const maxWidth = 320; const half = maxWidth / 2; const margin = 12;
                  x = Math.max(half + margin, Math.min(vw - half - margin, x));
                  const preferTop = rect.top > 90;
                  y = preferTop ? rect.top - 8 : rect.bottom + 8;
                  if (!preferTop && y + 140 > vh) { y = rect.top - 8; }
                }
              } catch {}
              // show loading popover immediately (fallback renderer will show spinner)
              setPopLoading(true);
              setPopContent('');
              setPopPos({ x, y });
              setShowFallback(true);
              setPopOpen(true);
              try {
                const res = await fetch(`/api/ai/define?word=${encodeURIComponent(selectedText)}`);
                const data = await res.json();
                const def = data.definition || data.error || 'No definition available.';
                setPopContent(def);
              } catch (e) {
                setPopContent('Failed to fetch definition.');
              } finally {
                setPopLoading(false);
              }
            }}>Definition</button>
          ) : (
            <>
              <button className="dropdown-item" role="menuitem" onClick={async () => {
                const selText = selectedText;
                setMenuOpen(false);
                const sel = window.getSelection?.();
                let x = menuPos.x, y = menuPos.y;
                try {
                  if (sel && sel.rangeCount > 0) {
                    const rect = sel.getRangeAt(0).getBoundingClientRect();
                    x = rect.left + rect.width / 2;
                    const vh = window.innerHeight || document.documentElement.clientHeight || 800;
                    const vw = window.innerWidth || document.documentElement.clientWidth || 1200;
                    const maxWidth = 360; const half = maxWidth / 2; const margin = 12;
                    x = Math.max(half + margin, Math.min(vw - half - margin, x));
                    const preferTop = rect.top > 100;
                    y = preferTop ? rect.top - 8 : rect.bottom + 8;
                    if (!preferTop && y + 180 > vh) { y = rect.top - 8; }
                  }
                } catch {}
                setPopLoading(true);
                setPopContent('');
                setPopPos({ x, y });
                setShowFallback(true);
                setPopOpen(true);
                try {
                  const res = await fetch('/api/ai/summarize', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: selText }) });
                  const data = await res.json();
                  const content = data.summary || data.error || 'Unable to summarize selection.';
                  setPopContent(content);
                } catch (e) {
                  setPopContent('Failed to summarize selection.');
                } finally {
                  setPopLoading(false);
                }
              }}>Summarize</button>
              <button className="dropdown-item" role="menuitem" onClick={() => { setMenuOpen(false); alert('Visualize selection'); }}>Visualize</button>
            </>
          )}
        </div>
      )}

      {/* Popover anchor */}
      <button ref={anchorRef} className="reader-popover-anchor" style={{ left: popPos.x, top: popPos.y }} aria-hidden="true" />
      {popOpen && showFallback && (
        <div className="reader-def-popover" style={{ left: popPos.x, top: popPos.y }}>
          <div className="d-flex align-items-center justify-content-between">
            <div className="reader-def-popover-title">{menuKind === 'word' ? `Definition: ${selectedText}` : 'Summary'}</div>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setPopOpen(false)}>Close</button>
          </div>
          <div className="reader-def-popover-body">
            {popLoading ? (
              <div className="d-flex align-items-center gap-2">
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>{menuKind === 'word' ? 'Looking up…' : 'Summarizing…'}</span>
              </div>
            ) : (
              popContent
            )}
          </div>
        </div>
      )}
    </div>
  );
}


