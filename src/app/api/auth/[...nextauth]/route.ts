// src/app/api/auth/[...nextauth]/route.ts (or your NextAuth config file)
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { supabaseService } from "@/lib/supabaseServer";
export const runtime = "nodejs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Fail fast if missing (prevents silent fallback to anon)
if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // optionally request more Google profile fields via `authorization.params`
    }),
  ],

  // (Optional) enrich tokens/sessions if you need them later
  callbacks: {
    async jwt({ token, account, profile }) {
      // copy anything you want to keep
      if (profile) {
        token.name = profile.name ?? token.name;
        token.picture = (profile as any).picture ?? token.picture;
      }
      if (account?.provider) token.provider = account.provider;
      return token;
    },
    async session({ session, token }) {
      // surface to client if needed
      session.user.provider = token.provider as string | undefined;
      return session;
    },
  },

  events: {
    async signIn({ user, profile }) {
      try {
        console.log("user: ", user);
        const payload = {
          email: user.email!,
          name: user.name ?? (profile as any)?.name ?? "",
        };
        const { error } = await supabaseService
          .from("users")
          .upsert(payload, { onConflict: "email" });
        if (error) {
          console.error("[NextAuth signIn] upsert error:", error);
        } else {
          console.log("[NextAuth signIn] upsert ok:", payload.email);
        }
      } catch (e) {
        console.error("[NextAuth signIn] threw:", e);
      }
    },
  },
});

export { handler as GET, handler as POST };
