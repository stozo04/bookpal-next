"use client";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="row align-items-center g-4">
      <div className="col-lg-6">
        <h1 className="display-5 fw-bold mb-3">Your AI-powered eReader</h1>
        <p className="lead text-secondary mb-4">
          Upload a book, get clean chapters, smart summaries, character profiles, and realistic art.
        </p>
        {session ? (
          <Link href="/dashboard" className="btn btn-primary btn-lg shadow-sm">
            Go to Dashboard
          </Link>
        ) : (
          <button className="btn btn-primary btn-lg shadow-sm" onClick={() => signIn("google")}>
            Sign in with Google
          </button>
        )}
      </div>
      <div className="col-lg-6">
        <div className="p-4 rounded-4 border bg-white shadow-sm">
          <h5 className="mb-3">Quick System Check</h5>
          <ul className="mb-0">
            <li>Next.js running ✔</li>
            <li>Bootstrap + Tailwind loaded ✔</li>
            <li>
              API Ping: <code>/api/openai/ping</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
