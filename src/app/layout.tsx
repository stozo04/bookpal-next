// src/app/layout.tsx
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/Providers";
import NavBar from "@/components/NavBar";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Bookpal – AI eReader",
  description: "Beautiful, modern eReader with AI superpowers",
  viewport: "width=device-width, initial-scale=1",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions); // 👈 hydrate initial session

  return (
    <html lang="en" className="h-100">
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
        <Providers session={session}>
          <NavBar />
          <main className="container py-4">{children}</main>
          <footer className="border-top mt-5 py-4 text-center text-muted">
            <small>© {new Date().getFullYear()} Bookpal</small>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
