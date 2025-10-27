// src/app/layout.tsx
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/Providers";
import type { Session } from "next-auth";
import NavBar from "@/components/NavBar";
import ClientBootstrap from "@/components/ClientBootstrap";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Bookpal – AI eReader",
  description: "Beautiful, modern eReader with AI superpowers",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = (await getServerSession(authOptions as any)) as Session | null;

  return (
    <html lang="en" className="h-100" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Source+Sans+3:wght@400;600&family=IBM+Plex+Sans:wght@400;600&family=Public+Sans:wght@400;600&family=PT+Sans:wght@400;700&family=Atkinson+Hyperlegible:wght@400;700&family=Lexend:wght@400;600&family=Noto+Sans:wght@400;700&family=Literata:opsz,wght@7..72,400;7..72,600&family=Crimson+Pro:wght@400;600&family=Spectral:wght@400;600&family=Lora:wght@400;600&family=Merriweather:wght@400;700&family=EB+Garamond:wght@400;600&family=Noto+Serif:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-vh-100 text-body">
        {/* Bootstrap color mode SSR init: set data-bs-theme before hydration to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { var d = document.documentElement; var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; d.setAttribute('data-bs-theme', dark ? 'dark' : 'light'); } catch (e) {} })();`,
          }}
        />
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
