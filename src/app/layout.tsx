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
        <ClientBootstrap /> {/* loads Bootstrap JS only in the browser */}
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
