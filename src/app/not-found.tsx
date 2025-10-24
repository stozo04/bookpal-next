// src/app/not-found.tsx
"use client";

import Link from "next/link";
import { ExclamationTriangle, House } from "react-bootstrap-icons";

export default function NotFoundPage() {
  return (
    <section
        className="d-flex flex-column align-items-center justify-content-center text-center h-100 position-relative overflow-hidden bg-white"
        style={{
          background:
            "radial-gradient(1100px 600px at 10% -10%, rgba(13,110,253,.15), transparent 60%), radial-gradient(1100px 600px at 110% 10%, rgba(111,66,193,.12), transparent 60%)",
        }}
      >
        <div className="container py-5">
          <div className="mb-4">
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle border shadow-sm mb-3"
              style={{ width: 96, height: 96, background: "white" }}>
              <ExclamationTriangle size={48} className="text-primary" />
            </div>
            <h1 className="display-4 fw-bold mb-2 text-dark">
              404 — Page Not Found
            </h1>
            <p className="lead text-secondary mb-4">
              Oops! The page you’re looking for doesn’t exist or was moved.
            </p>
          </div>

          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Link
              href="/"
              className="btn btn-primary btn-lg px-4 py-3 shadow-sm d-inline-flex align-items-center gap-2"
            >
              <House size={20} /> Go Home
            </Link>
            
          </div>
        </div>
      </section>
  );
}
