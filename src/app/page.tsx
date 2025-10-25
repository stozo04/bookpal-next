// src/app/page.tsx
"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LightningCharge,
  People,
  ShieldLock,
  Stars,
  BoxArrowInRight,
  ArrowRightCircle,
  Diagram3,
  PersonSquare,
  Search,
  Image as ImageIcon,
  FileEarmarkText,
} from "react-bootstrap-icons";
import PublicThemeToggle from "@/components/PublicThemeToggle";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.replace("/library");
    }
  }, [status, session, router]);

  const CTA = (
    <>
      {session ? (
        <Link
          href="/library"
          className="btn btn-primary btn-lg px-4 py-3 shadow-sm d-inline-flex align-items-center gap-2"
          aria-label="Go to dashboard"
        >
          <BoxArrowInRight size={20} /> Go to Library
        </Link>
      ) : (
        <button
          type="button"
            className="btn btn-primary btn-lg px-4 py-3 shadow-sm d-inline-flex align-items-center gap-2"
            aria-label="Sign in with Google"
            onClick={() => signIn("google", { callbackUrl: "/library" })}
            disabled={status === "loading"}
          >
            <BoxArrowInRight size={20} />
          {status === "loading" ? "Preparing sign-in…" : "Sign in with Google"}
        </button>
      )}
    </>
  );

  const marquee = (
    <section className="feature-marquee py-3 border-top border-bottom">
      <div className="container">
        <div className="marquee" aria-hidden>
          <div className="marquee-track">
            {[ 
              { icon: <Stars size={16} />, label: "Chapter summaries" },
              { icon: <Diagram3 size={16} />, label: "Character graphs" },
              { icon: <Search size={16} />, label: "Smart search" },
              { icon: <ImageIcon size={16} />, label: "Scene visuals" },
              { icon: <FileEarmarkText size={16} />, label: "Notes & quotes" },
              { icon: <LightningCharge size={16} />, label: "Snappy UI" },
              { icon: <ShieldLock size={16} />, label: "Private by default" },
            ]
              .concat([
                { icon: <Stars size={16} />, label: "Chapter summaries" },
                { icon: <Diagram3 size={16} />, label: "Character graphs" },
                { icon: <Search size={16} />, label: "Smart search" },
                { icon: <ImageIcon size={16} />, label: "Scene visuals" },
                { icon: <FileEarmarkText size={16} />, label: "Notes & quotes" },
                { icon: <LightningCharge size={16} />, label: "Snappy UI" },
                { icon: <ShieldLock size={16} />, label: "Private by default" },
              ])
              .map((f, i) => (
                <span key={i} className="feature-pill">
                  {f.icon} <span className="ms-1">{f.label}</span>
                </span>
              ))}
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="container-fluid px-0">
      {/* HERO */}
      <section className="hero-gradient position-relative overflow-hidden py-5 py-lg-6">
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="d-flex justify-content-end mb-3">
            <PublicThemeToggle />
          </div>
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <h1 className="display-4 fw-bold lh-tight mb-3 hero-heading">
                Read smarter.
                <br />
                <span className="text-gradient">Remember more.</span>
              </h1>
              <p className="lead text-secondary mb-4">
                Turn every book into living notes, chapter summaries, and character maps—all in one
                beautiful place.
              </p>
              <div className="d-flex flex-wrap align-items-center gap-3">
                {CTA}
                <a href="#how-it-works" className="btn btn-outline-secondary btn-lg px-4 py-3">
                  See how it works
                </a>
              </div>
              {/* <div className="d-flex flex-wrap gap-3 mt-4 small text-secondary">
                <span className="badge text-bg-light border">No clutter</span>
                <span className="badge text-bg-light border">AI-assisted</span>
                <span className="badge text-bg-light border">Private by default</span>
              </div> */}
            </div>
            <div className="col-lg-5">
              <div className="p-3 p-lg-4 rounded-4 border bg-white shadow-sm hero-card">
                <div className="ratio ratio-16x9 rounded-4 mb-0" style={{
                  background:
                    "linear-gradient(180deg, rgba(37,99,235,.22), rgba(111,66,193,.22))",
                }} />
                <div className="small text-secondary mt-3">Clean reading UI</div>
              </div>
            </div>
          </div>

          {/* Trust strip */}
          <div className="row row-cols-2 row-cols-md-4 g-3 g-md-4 mt-5 text-center text-secondary">
            <div className="col">
              <div className="p-3 rounded-3 border bg-white">
                <h5 className="mb-1">2×</h5>
                <small>Faster note-taking</small>
              </div>
            </div>
            <div className="col">
              <div className="p-3 rounded-3 border bg-white">
                <h5 className="mb-1">+38%</h5>
                <small>Better recall</small>
              </div>
            </div>
            <div className="col">
              <div className="p-3 rounded-3 border bg-white">
                <h5 className="mb-1">0 Copy/Paste</h5>
                <small>Clean imports</small>
              </div>
            </div>
            <div className="col">
              <div className="p-3 rounded-3 border bg-white">
                <h5 className="mb-1">Private</h5>
                <small>Own your library</small>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-blur" />
      </section>

      {marquee}

      {/* FEATURES */}
      <section id="essentials" className="py-5 bg-body-tertiary section-essentials">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="fw-bold mt-2">Everything you need to read smarter</h2>
            <p className="text-secondary">Focus on the book; we handle the rest.</p>
          </div>

          <div className="row g-4">
            <Feature icon={<Stars size={22} />} title="Stay in flow" text="Chapters become clean, skimmable notes without breaking your reading rhythm." />
            <Feature icon={<FileEarmarkText size={22} />} title="Keep what matters" text="Highlights and summaries live together—easy to review later." />
            <Feature icon={<Search size={22} />} title="Find context fast" text="Characters, places, and references linked exactly where you need them." />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (lean) */}
      <section id="how-it-works" className="py-5 section-how">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="fw-bold mt-2">Three steps. Done.</h2>
            <p className="text-secondary">Upload. Auto-organize. Read & ask.</p>
          </div>
          <div className="row g-4">
            <Step number="1" title="Upload" text="Bring a PDF, EPUB, or link." />
            <Step number="2" title="Auto-organize" text="Chapters, notes, and profiles appear." />
            <Step number="3" title="Read & ask" text="Stay in flow with instant context." />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS / TRUST (temporarily hidden)
      <section className="py-5 bg-body-tertiary section-trust">
        <div className="container">
          <div className="row g-4 align-items-stretch">
            <TrustCard
              icon={<People size={20} />}
              title="Readers first"
              text="“It feels like a research buddy who organizes my brain while I actually enjoy the book.”"
              meta="Early access reader"
            />
          </div>
        </div>
      </section>
      */}

      {/* PRICING PREVIEW (temporarily hidden)
      <section className="py-5 section-pricing">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="fw-bold mt-2">Simple, friendly pricing</h2>
            <p className="text-secondary">Start free. Upgrade when you’re ready.</p>
          </div>
          <div className="row g-4 align-items-stretch">
            <div className="col-md-6">
              <div className="h-100 p-4 rounded-4 border bg-white shadow-sm">
                <h5 className="mb-1">Free</h5>
                <div className="display-6 fw-bold mb-3">$0</div>
                <ul className="small text-secondary mb-3">
                  <li>Core reader</li>
                  <li>Notes & highlights</li>
                  <li>Limited summaries</li>
                </ul>
                <a className="btn btn-outline-primary" href="#">Get started</a>
              </div>
            </div>
            <div className="col-md-6">
              <div className="h-100 p-4 rounded-4 border bg-white shadow-sm">
                <h5 className="mb-1">Pro</h5>
                <div className="display-6 fw-bold mb-3">$9<span className="fs-6 fw-semibold">/mo</span></div>
                <ul className="small text-secondary mb-3">
                  <li>Unlimited summaries</li>
                  <li>Character graphs</li>
                  <li>Priority processing</li>
                </ul>
                <a className="btn btn-primary" href="#">Go Pro</a>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* CTA BAND (temporarily hidden)
      <section className="py-5 cta-band">
        <div className="container">
          <div className="p-4 p-md-5 rounded-4 border bg-white shadow-sm d-flex flex-column flex-lg-row align-items-center justify-content-between gap-3">
            <div>
              <h3 className="mb-1">Start reading smarter today</h3>
              <p className="mb-0 text-secondary">Join readers who turn books into lasting insights.</p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {CTA}
              <a href="#how-it-works" className="btn btn-outline-secondary btn-lg px-4 py-3">How it works</a>
            </div>
          </div>
        </div>
      </section>
      */}


      {/* FAQ (temporarily hidden)
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-4">
            <h3 className="fw-bold">FAQ</h3>
            <p className="text-secondary">Quick answers to common questions.</p>
          </div>
          <div className="row g-4">
            <FAQ q="What file types work best?" a="PDF and EPUB are ideal. You can also paste public links for many sources." />
            <FAQ q="Can I export notes?" a="Yes. Export summaries, quotes, and highlights to your favorite tools." />
            <FAQ q="Is my data private?" a="Yes. Your books and notes are private by default, with transparent controls." />
          </div>
        </div>
      </section>
      */}


    </div>
  );
}

/** ---------- Small UI helpers (no extra packages) ---------- **/

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="col-md-6 col-lg-4">
      <div className="h-100 p-4 rounded-4 border bg-white shadow-sm feature-card">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div className="btn btn-sm btn-primary-subtle border rounded-circle p-2 feature-icon">
            {icon}
          </div>
          <h5 className="mb-0">{title}</h5>
        </div>
        <p className="text-secondary mb-0">{text}</p>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="col-lg-4">
      <div className="h-100 p-4 rounded-4 border bg-white how-card">
        <div className="d-flex align-items-center gap-3 mb-2">
          <div className="fw-bold fs-5 badge text-bg-primary rounded-pill px-3 py-2">
            {number}
          </div>
          <h5 className="mb-0">{title}</h5>
        </div>
        <p className="text-secondary mb-0">{text}</p>
      </div>
    </div>
  );
}

function TrustCard({
  icon,
  title,
  text,
  meta,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  meta: string;
}) {
  return (
    <div className="col-md-4">
      <div className="h-100 p-4 rounded-4 border bg-white trust-card">
        <div className="d-flex align-items-center gap-2 mb-2">
          {icon} <h6 className="mb-0">{title}</h6>
        </div>
        <p className="mb-2">{text}</p>
        <small className="text-secondary">{meta}</small>
      </div>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="col-md-4">
      <div className="h-100 p-4 rounded-4 border bg-white">
        <h6 className="mb-2 d-flex align-items-center gap-2">
          <ArrowRightCircle size={18} /> {q}
        </h6>
        <p className="text-secondary mb-0">{a}</p>
      </div>
    </div>
  );
}

// (HeroCarousel removed for a calmer, static visual)
