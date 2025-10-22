"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  // You can add more client providers here later (React Query, etc.)
  return <SessionProvider>{children}</SessionProvider>;
}
