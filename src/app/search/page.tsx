import { createClient } from '@/lib/supabase/server';
import { PostItem } from '@/components/blog/PostItem';
import { Database } from '@/types/supabase';
import { redirect } from 'next/navigation';

type Post = Database['public']['Tables']['posts']['Row'];

interface SearchPageProps {
  searchParams: Promise<{ q: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;

  if (!q) {
    redirect('/');
  }

  const supabase = await createClient();
  const query = decodeURIComponent(q);

  // Using simple ilike for title and excerpt
  // Note: Comma is a reserved character in .or() syntax, so this is a basic implementation
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  const posts = data as Post[] | null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-12 border-b border-gray-100 pb-6">
        <h1 className="text-xl text-gray-500">
          Search results for <span className="text-black font-semibold">&ldquo;{query}&rdquo;</span>
        </h1>
      </header>

      {posts && posts.length > 0 ? (
        <div>
          {posts.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-gray-500">
          <p>No posts found matching your search.</p>
          <p className="mt-2 text-sm">Try searching for different keywords.</p>
        </div>
      )}
    </div>
  );
}
