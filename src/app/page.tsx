// src/app/page.tsx
"use client";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();

  return (
    <div className="row align-items-lg-center g-4 g-lg-5">
      <div className="col-lg-6">
        <h1 className="display-5 fw-bold mb-3">Your AI-powered eReader</h1>
        <p className="lead text-secondary mb-4">
          Upload a book, get clean chapters, smart summaries, character profiles, and realistic art.
        </p>

        {session ? (
          <Link href="/dashboard" className="btn btn-primary btn-lg shadow-sm" aria-label="Go to dashboard">
            Go to Dashboard
          </Link>
        ) : (
            <button
              type="button"
              className="btn btn-primary btn-lg shadow-sm"
              aria-label="Sign in with Google"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Preparing sign-in…" : "Sign in with Google"}
          </button>
        )}
      </div>

      <div className="col-lg-6">
        <div className="p-4 rounded-4 border bg-white shadow-sm">
          <h5 className="mb-3">Quick System Check</h5>
          <ul className="mb-0 list-unstyled">
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

        {/* Optional visual to balance the hero */}
        <div className="mt-4 ratio ratio-16x9 rounded-4 overflow-hidden border bg-light">
          <div className="d-flex align-items-center justify-content-center text-secondary">
            <small className="text-muted">Preview image / screenshot placeholder</small>
          </div>
        </div>
      </div>
    </div>
  );
}
