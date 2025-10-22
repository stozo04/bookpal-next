import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

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

  const name = session.user?.name ?? "Reader";

  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="p-4 rounded-4 border bg-white shadow-sm">
          <h1 className="h3 mb-1">Welcome, {name}</h1>
          <p className="text-secondary mb-4">Your library lives here. Let’s get reading.</p>
          <div className="d-flex gap-2">
            <Link className="btn btn-outline-primary" href="/">Upload a Book (soon)</Link>
            <Link className="btn btn-primary" href="/reader/demo">Open Reader (demo)</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
