import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { PostItem } from '@/components/blog/PostItem';
import { Database } from '@/types/supabase';

type Post = Database['public']['Tables']['posts']['Row'];

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/profile');
  }

  // Fetch bookmarks
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select(`
      post_id,
      posts:posts (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Type assertion for the joined data
  // The 'posts' property comes from the join alias
  const bookmarkedPosts = bookmarks?.map((b: any) => b.posts).filter(Boolean) as Post[] || [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-12">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
      </header>

      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-6 border-b border-gray-100 pb-2">Your Information</h2>
        <ProfileEditor />
      </section>

      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-6 border-b border-gray-100 pb-2">Account Security</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-medium mb-4">Change Password</h3>
            <ChangePasswordForm />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-8 border-b border-gray-100 pb-2">Bookmarked Posts</h2>
        {bookmarkedPosts.length > 0 ? (
          <div className="space-y-12">
            {bookmarkedPosts.map((post) => (
              <PostItem key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You haven't bookmarked any posts yet.</p>
        )}
      </section>
    </div>
  );
}
