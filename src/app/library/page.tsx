import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LibraryClient from "./LibraryClient";
import { supabaseService } from "@/lib/supabaseServer";
import type { DBBook } from "@/lib/types";

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return (
      <div className="text-center py-5">
        <h2 className="mb-3">Please sign in</h2>
        <a className="btn btn-primary" href="/api/auth/signin">Sign in</a>
      </div>
    );
  }
  const userId = (session.user as any).id;

  const { data: books = [] } = await supabaseService
    .from("books")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false }) as { data: DBBook[] | null };

  return <LibraryClient initialBooks={books ?? []} />;
}
