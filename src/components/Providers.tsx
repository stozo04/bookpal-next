// src/components/Providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import type { Session } from "next-auth";
import { LibraryProvider } from "@/context/LibraryContext";

export default function Providers({
    children,
    session,
}: {
    children: ReactNode;
    session?: Session | null;
}) {
    return (
        <SessionProvider session={session}>
            <LibraryProvider>{children}</LibraryProvider>
        </SessionProvider>
    );
}
