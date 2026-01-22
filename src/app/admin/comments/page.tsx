import { createClient } from '@/lib/supabase/server';
import { CommentList } from '@/components/admin/CommentList';

export const revalidate = 0;

export default async function CommentsPage() {
  const supabase = await createClient();
  
  // Note: We need to make sure the join is correct. 
  // 'posts(title)' relies on foreign key relationship being detected by PostgREST.
  const { data, error } = await supabase
    .from('comments')
    .select('*, posts(title)')
    .order('created_at', { ascending: false });
  
  // We need to cast this because of the join
  const comments = data as any[] | null;

  if (error) {
    console.error('Error fetching comments:', error);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-8">Comments</h1>
      <CommentList initialComments={comments || []} />
    </div>
  );
}
