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
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your blog posts and view statistics.</p>
        </div>
        <Link 
          href="/admin/posts/new" 
          className="inline-flex items-center justify-center bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all shadow-sm active:scale-95"
        >
          New Post
        </Link>
      </div>

      <AdminStats />
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Recent Posts</h2>
        <AdminPostsTable initialPosts={posts || []} />
      </div>
    </div>
  );
}
