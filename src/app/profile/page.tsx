// src/app/profile/page.tsx (or wherever your ProfilePage lives)
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import type { DefaultSession } from "next-auth";
import { PersonCircle } from "react-bootstrap-icons";
import ThemeToggle from "@/components/ThemeToggle";

function getInitials(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase();
}

export default async function ProfilePage() {
  const session = (await getServerSession(authOptions as any)) as DefaultSession;

  if (!session) {
    redirect("/api/auth/signin");
  }

  const initials = getInitials(session.user?.name);

  return (
    <div className="container-fluid px-0">
      {/* CONTENT */}
      <section className="py-5 bg-body-tertiary">
        <div className="container">
          <div className="row g-4">
            {/* Account card */}
            <div className="col-12">
              <div className="p-4 p-md-5 rounded-4 border bg-white shadow-sm">
                <h5 className="mb-4">Account</h5>
                <div className="d-flex flex-wrap align-items-center gap-4">
                  {/* Avatar */}
                  <div
                    className="rounded-circle border d-flex align-items-center justify-content-center"
                    style={{ width: 72, height: 72 }}
                    aria-label="Profile avatar"
                  >
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="Profile"
                        width={72}
                        height={72}
                        className="object-fit-cover"
                      />
                    ) : (
                      <span className="fw-bold text-secondary">{initials}</span>
                    )}
                  </div>

                  {/* Name + email */}
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <PersonCircle className="text-secondary" />
                      <span className="fw-medium">{session.user?.name ?? "Unknown User"}</span>
                    </div>
                    <div className="text-secondary small">{session.user?.email}</div>
                  </div>

                  {/* Read-only status chip */}
                  <span className="badge text-bg-primary-subtle border">Signed in</span>
                </div>
              </div>
            </div>

            {/* Reading Preferences */}
            <div className="col-12 col-lg-6">
              <div className="h-100 p-4 p-md-5 rounded-4 border bg-white shadow-sm">
                <h5 className="mb-4">Reading Preferences</h5>

                {/* Font Style (disabled for now) */}
                <div className="mb-3">
                  <label className="form-label">Font Style</label>
                  <select className="form-select" disabled>
                    <option>Coming Soon</option>
                  </select>
                  <div className="form-text">
                    Choose your preferred reading font.
                  </div>
                </div>

                {/* Font Size (disabled for now) */}
                <div className="mb-3">
                  <label className="form-label">Font Size</label>
                  <div className="d-flex align-items-center gap-3">
                    <input type="range" className="form-range" min={12} max={24} disabled />
                    <span className="text-secondary small">Coming Soon</span>
                  </div>
                </div>

                {/* Line Height (disabled for now) */}
                <div className="mb-3">
                  <label className="form-label">Line Height</label>
                  <select className="form-select" disabled>
                    <option>Coming Soon</option>
                  </select>
                </div>

                {/* Save (disabled) */}
                <div className="d-flex justify-content-end">
                  <button className="btn btn-primary" disabled>
                    Save (Soon)
                  </button>
                </div>
              </div>
            </div>

            {/* Theme & Display */}
            <div className="col-12 col-lg-6">
              <div className="h-100 p-4 p-md-5 rounded-4 border bg-white shadow-sm">
                <h5 className="mb-4">Theme & Display</h5>

                {/* Dark Mode Toggle */}
                <ThemeToggle />

                {/* Page Width (disabled) */}
                <div className="mb-3">
                  <label className="form-label">Page Width</label>
                  <select className="form-select" disabled>
                    <option>Coming Soon</option>
                  </select>
                </div>

                {/* Accent Color (disabled) */}
                <div className="mb-3">
                  <label className="form-label">Accent Color</label>
                  <input type="color" className="form-control form-control-color" disabled />
                </div>

                <div className="d-flex justify-content-end">
                  <button className="btn btn-outline-secondary" disabled>
                    Update Theme (Soon)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
