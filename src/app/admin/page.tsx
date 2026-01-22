import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminPostsTable } from '@/components/admin/AdminPostsTable';
import { Database } from '@/types/supabase';

type Post = Database['public']['Tables']['posts']['Row'];

export const revalidate = 0;

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  
  const posts = data as Post[] | null;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <AdminStats />
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <Link 
          href="/admin/posts/new" 
          className="bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          New Post
        </Link>
      </div>

      <AdminPostsTable initialPosts={posts || []} />
    </div>
  );
}
