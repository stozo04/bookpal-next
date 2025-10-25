// src/components/Providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import type { Session } from "next-auth";
import { LibraryProvider } from "@/context/LibraryContext";
import { ThemeProvider } from "@/context/ThemeContext";

export default function Providers({
    children,
    session,
}: {
    children: ReactNode;
    session?: Session | null;
}) {
    return (
        <SessionProvider session={session}>
            <ThemeProvider>
                <LibraryProvider>{children}</LibraryProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}
