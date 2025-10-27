import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseService } from "@/lib/supabaseServer";
import EditBookClient from "./EditBookClient";

export const dynamic = 'force-dynamic';

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions as any);
  if (!session) return null;
  const { data: book } = await supabaseService
    .from('books')
    .select('id, title, author, cover_storage_path, cover_url, cover_source, genre')
    .eq('id', id)
    .single();
  if (!book) return <div className="container py-4"><div className="alert alert-warning">Book not found.</div></div>;

  let cover_public_url: string | null = null;
  try {
    if (book.cover_storage_path) {
      const pub = supabaseService.storage.from('covers').getPublicUrl(book.cover_storage_path as any);
      // @ts-ignore
      cover_public_url = pub?.data?.publicUrl || null;
    }
  } catch {}

  return (
    <div className="container py-4">
      <h1 className="h4 mb-3">Edit book</h1>
      {/* move interactivity to Client Component */}
      <EditBookClient book={{ ...book, cover_public_url }} />
    </div>
  );
}


