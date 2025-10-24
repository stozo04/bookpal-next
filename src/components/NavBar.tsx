// src/components/NavBar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

export default function NavBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="navbar navbar-expand-lg sticky-top bg-white border-bottom" data-bs-theme="light">
      <div className="container">
        <Link className="navbar-brand fw-bold" href="/">
          Bookpal
        </Link>

        {/* Right-side actions */}
        <div className="d-flex align-items-center gap-2 gap-lg-3 order-lg-2">
          {session?.user ? (
            <>
              <span className="text-secondary small d-none d-sm-inline" title={session.user.email ?? ""}>
                {session.user.name}
              </span>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </button>
            </>
          ) : (
            <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                disabled={status === "loading"}
                aria-label="Sign in with Google"
            >
                {status === "loading" ? "Preparing…" : "Sign in"}
            </button>
          )}
        </div>

        {/* Toggler */}
        <button
          className="navbar-toggler order-lg-1"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#primaryNav"
          aria-controls="primaryNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
      </div>
    </nav>
  );
}
