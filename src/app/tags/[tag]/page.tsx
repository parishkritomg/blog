import { createClient } from '@/lib/supabase/server';
import { PostItem } from '@/components/blog/PostItem';
import { Database } from '@/types/supabase';
import { Tag } from 'lucide-react';

type Post = Database['public']['Tables']['posts']['Row'];

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .contains('tags', [decodedTag])
    .order('created_at', { ascending: false });
  
  const posts = data as Post[] | null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <header className="flex items-center gap-3 pb-6 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
          <Tag className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {decodedTag}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Posts tagged with &quot;{decodedTag}&quot;
          </p>
        </div>
      </header>

      {error ? (
        <div className="text-red-500">Failed to load posts. Error: {error.message}</div>
      ) : !posts || posts.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          <p className="text-lg">No posts found with this tag.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
