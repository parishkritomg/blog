import { createClient } from '@/lib/supabase/server';
import { PostItem } from '@/components/blog/PostItem';
import { Database } from '@/types/supabase';
import { Sparkles, Clock } from 'lucide-react';

type Post = Database['public']['Tables']['posts']['Row'];

export const revalidate = 0; // Ensure fresh data on every request, or use ISR

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  
  const posts = data as Post[] | null;

  if (error) {
    console.error('Error fetching posts:', JSON.stringify(error, null, 2));
    
    // Handle missing table error (PGRST205) specifically
    if (error.code === 'PGRST205') {
      return (
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Database Setup Required</h2>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              The database tables have not been created yet. Please run the SQL schema in your Supabase Dashboard.
            </p>
            <div className="bg-gray-50 p-4 rounded text-left text-xs font-mono overflow-auto max-w-lg mx-auto max-h-40">
              Copy the content of <code>supabase/schema.sql</code> and run it in the SQL Editor.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-red-500">Failed to load posts. Error: {error.message}</div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="py-20 text-center">
          <p className="text-gray-500 text-lg">No posts published yet.</p>
          <p className="text-sm text-gray-400 mt-2">Check back soon.</p>
        </div>
      </div>
    );
  }

  const topReadPosts = [...posts]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
      {/* Latest Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Clock className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Latest</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostItem key={`latest-${post.id}`} post={post} />
          ))}
        </div>
      </section>

      {/* Top Read Section */}
      {topReadPosts.length > 0 && (posts.some(p => (p.view_count || 0) > 0)) && (
        <section className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Top Read</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topReadPosts.map((post) => (
              <PostItem key={`top-${post.id}`} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
