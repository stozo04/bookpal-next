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

  return (
    <div className="container-fluid px-0">
      {/* HERO */}
      <section
        className="py-5 py-lg-6 position-relative overflow-hidden"
        style={{
          background:
            "radial-gradient(1100px 600px at 10% -10%, rgba(13,110,253,.15), transparent 60%), radial-gradient(1100px 600px at 110% 10%, rgba(111,66,193,.12), transparent 60%)",
        }}
      >
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-12">
              <h1 className="display-4 fw-bold lh-tight mb-3">
                Read smarter. <span className="text-primary">Remember more.</span>
              </h1>
              <p className="lead text-secondary mb-4">
                BookPal intelligently transforms your books into clean chapters, living notes,
                character graphs, and context-aware summaries—so you keep the vibe of reading while
                gaining the power of an AI research assistant.
              </p>

              <div className="d-flex flex-wrap align-items-center gap-3">
                {CTA}
                <a href="#how-it-works" className="btn btn-outline-secondary btn-lg px-4 py-3">
                  See how it works
                </a>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">

              {/* System Check
              <div className="mt-3">
                <div className="p-3 rounded-4 border bg-white shadow-sm">
                  <h6 className="mb-2">Quick System Check</h6>
                  <ul className="mb-0 list-unstyled small">
                    <li className="mb-1">Next.js running ✔</li>
                    <li className="mb-1">Bootstrap loaded ✔</li>
                    <li>
                      API Ping:{" "}
                      <a href="/api/openai/ping">
                        <code>/api/openai/ping</code>
                      </a>
                    </li>
                  </ul>
                </div>
              </div> */}
            </div>
          </div>

          {/* Social proof */}
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
      </section>

      {/* FEATURES */}
      <section className="py-5 bg-body-tertiary">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="fw-bold mt-2">Features that feel like magic</h2>
            <p className="text-secondary">Bringing intelligence to your books.</p>
          </div>

          <div className="row g-4">
            <Feature
              icon={<Stars size={22} />}
              title="Summarize Chapters"
              text="Concise, context-aware chapter summaries so you can review fast without losing nuance."
            />
            <Feature
              icon={<PersonSquare size={22} />}
              title="Character Profiles (with Images)"
              text="Auto-build character profiles and generate visuals from in-book descriptions."
            />
            <Feature
              icon={<Diagram3 size={22} />}
              title="Character Relationship Diagrams"
              text="For complex casts, see who’s connected to whom—at-a-glance relationship graphs."
            />
            <Feature
              icon={<Search size={22} />}
              title="Word Lookup"
              text="Look up words inline—definitions, usage, and quick context without breaking flow."
            />
            <Feature
              icon={<ImageIcon size={22} />}
              title="Visualize Scene"
              text="Bring moments to life with images that match the tone and details of the scene."
            />
            <Feature
              icon={<FileEarmarkText size={22} />}
              title="Summarize Complex Paragraphs"
              text="Turn dense passages into crisp, faithful explanations you can actually remember."
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-5">
        <div className="container">
          <div className="text-center mb-4">

            <h2 className="fw-bold mt-2">From upload to insight—fast</h2>
          </div>

          <div className="row g-4">
            <Step
              number="1"
              title="Upload or paste a link"
              text="Bring a PDF or EPUB—or just a public link. We clean, parse, and prep it for deep reading."
            />
            <Step
              number="2"
              title="Auto-chapter & profiles"
              text="We split chapters, build character/location profiles, and map references as you read."
            />
            <Step
              number="3"
              title="Read & ask"
              text="Stay in flow. Summaries, recalls, and answers stay grounded to your book and notes."
            />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS / TRUST */}
      <section className="py-5 bg-body-tertiary">
        <div className="container">
          <div className="row g-4 align-items-stretch">
            <TrustCard
              icon={<People size={20} />}
              title="Loved by learners"
              text="“It feels like a research buddy who organizes my brain while I actually enjoy the book.”"
              meta="Early access reader"
            />
            <TrustCard
              icon={<LightningCharge size={20} />}
              title="Built for speed"
              text="No dragging files between apps. Reading, notes, and recall live together."
              meta="Fewer clicks, more focus"
            />
            <TrustCard
              icon={<ShieldLock size={20} />}
              title="Transparent privacy"
              text="Your content stays yours. Clear controls and export-friendly formats."
              meta="You’re in control"
            />
          </div>
        </div>
      </section>


      {/* FAQ */}
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
      <div className="h-100 p-4 rounded-4 border bg-white shadow-sm">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div className="btn btn-sm btn-primary-subtle border rounded-circle p-2">
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
      <div className="h-100 p-4 rounded-4 border bg-white">
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
      <div className="h-100 p-4 rounded-4 border bg-white">
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
