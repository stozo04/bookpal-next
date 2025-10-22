import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardClient from "./DashboardClient";
import { supabaseAdmin } from "@/lib/supabaseServer";
import type { DBBook } from "@/lib/types";

export default async function DashboardPage() {
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

  const { data: books = [] } = await supabaseAdmin
    .from("books")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false }) as { data: DBBook[] | null };

  return <DashboardClient initialBooks={books} />;
}
