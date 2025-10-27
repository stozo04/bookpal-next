import { supabaseService } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export default async function BookLogsPage({ params }: { params: { id: string } }) {
  const { data: logs = [] } = await supabaseService
    .from('book_jobs')
    .select('created_at, level, message')
    .eq('book_id', params.id)
    .order('created_at', { ascending: true });

  return (
    <div className="container py-4">
      <h3 className="mb-3">Structuring Logs</h3>
      <div className="list-group">
        {(!logs || logs.length === 0) && <div className="text-secondary">No logs yet.</div>}
        {logs?.map((l: any, i: number) => (
          <div key={i} className={`list-group-item d-flex justify-content-between align-items-start ${l.level === 'error' ? 'text-danger' : ''}`}>
            <div className="me-3">
              <div className="small text-secondary">
                {new Date(l.created_at).toLocaleString()} 
                <span className="ms-2 badge text-bg-secondary">{timeAgo(l.created_at)}</span>
              </div>
              <div>{l.message}</div>
            </div>
            <span className={`badge ${l.level === 'error' ? 'text-bg-danger' : 'text-bg-secondary'}`}>{l.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function timeAgo(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const s = Math.max(0, Math.floor((now - t) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); return `${d}d ago`;
}


