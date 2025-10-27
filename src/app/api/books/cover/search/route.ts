import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    const url = new URL(req.url);
    const title = url.searchParams.get('title') || '';
    const author = url.searchParams.get('author') || '';
    if (!title && !author) return NextResponse.json({ ok: false, error: 'Missing query' }, { status: 400 });

    // Open Library search
    const q = encodeURIComponent([title, author].filter(Boolean).join(' '));
    const res = await fetch(`https://openlibrary.org/search.json?q=${q}&limit=5`, { next: { revalidate: 3600 } } as any);
    const data = await res.json();
    const items = (data?.docs || []).slice(0, 5).map((d: any) => {
      const coverId = d.cover_i;
      const img = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : null;
      return { title: d.title, author: (d.author_name || [])[0], source: 'openlibrary', source_id: coverId, image: img };
    }).filter((x: any) => !!x.image);
    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 500 });
  }
}


