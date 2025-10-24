// src/app/layout.tsx
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/Providers";
import NavBar from "@/components/NavBar";
import ClientBootstrap from "@/components/ClientBootstrap";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Bookpal – AI eReader",
  description: "Beautiful, modern eReader with AI superpowers",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="h-100">
      <body className="min-vh-100 text-body">
        <ClientBootstrap />
        <Providers session={session}>
          <div className="app-shell d-flex">
            <NavBar />
            <main className="container py-4">{children}</main>
          </div>
          <footer className="py-4 border-top site-footer">
            <div className="container small d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div className="text-secondary">
                © {new Date().getFullYear()} BookPal — Modern eReading
              </div>
              <nav className="d-flex gap-3">
                <a className="link-secondary text-decoration-none" href="#">
                  Privacy
                </a>
                <a className="link-secondary text-decoration-none" href="#">
                  Terms
                </a>
              </nav>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
