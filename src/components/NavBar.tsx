"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function NavBar() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  const { data: session } = useSession();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" href="/">Bookpal</Link>

        {/* Right-side actions ALWAYS visible */}
        <div className="d-flex align-items-center gap-3 order-lg-2">
          {session?.user ? (
            <>
              <span className="text-secondary small d-none d-sm-inline">
                {session.user.name}
              </span>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => signIn("google")}
            >
              Sign in
            </button>
          )}
        </div>

        {/* Toggler for nav links on mobile */}
        <button
          className="navbar-toggler order-lg-1"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
          aria-controls="nav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Collapsible left-side links */}
        <div className="collapse navbar-collapse order-lg-0" id="nav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" href="/dashboard">Dashboard</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
