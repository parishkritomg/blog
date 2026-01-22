import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { CommentSection } from '@/components/blog/CommentSection';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { BookmarkButton } from '@/components/blog/BookmarkButton';
import { ViewCounter } from '@/components/blog/ViewCounter';
import { Poll } from '@/components/blog/Poll';
// @ts-ignore
import { FloatingCommentButton } from '@/components/blog/FloatingCommentButton';

import { Database } from '@/types/supabase';

type Post = Database['public']['Tables']['posts']['Row'];
type Poll = Database['public']['Tables']['polls']['Row'];

// Force dynamic rendering if we want to ensure fresh data, 
// or use revalidate for ISR (e.g., revalidate = 60).
// Since we have comments, we might want dynamic or short revalidate.
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();
  
  return post;
}

async function getComments(postId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .eq('approved', true)
    .order('created_at', { ascending: true });
  
  const comments = data as any[];

  return (comments || []).map(comment => {
    const isAdmin = comment.email === 'parishkrit2061@gmail.com';
    return {
      id: comment.id,
      name: isAdmin ? 'Parishkrit Bastakoti' : comment.name,
      comment: comment.comment,
      created_at: comment.created_at,
      parent_id: comment.parent_id,
      user_id: comment.user_id,
      avatar_url: comment.avatar_url,
      isAdmin: isAdmin
    };
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  // Prefer the production domain if available to ensure Twitter card validation works
  const productionUrl = 'https://blog.parishkrit.com.np';
  const baseUrl = siteUrl.includes('localhost') ? siteUrl : productionUrl;
  
  const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(post.title)}&excerpt=${encodeURIComponent(post.excerpt || '')}&image=${encodeURIComponent(post.featured_image || '')}`;

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.created_at,
      authors: ['Parishkrit Bastakoti'],
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImageUrl],
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const comments = await getComments(post.id);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isBookmarked = false;
  if (user) {
    const { data: bookmark } = await supabase
      .from('bookmarks')
      .select('created_at')
      .eq('user_id', user.id)
      .eq('post_id', post.id)
      .single();
    isBookmarked = !!bookmark;
  }

  // Fetch Poll
  const { data: pollData } = await supabase
    .from('polls')
    .select('*')
    .eq('post_id', post.id)
    .maybeSingle();

  const poll = pollData as Poll | null;

  let pollVotes: Record<string, number> = {};
  let userVote = null;
  let voterAvatars: string[] = [];

  if (poll) {
    const { data: allVotes } = await supabase
      .from('poll_votes')
      .select('option_id')
      .eq('poll_id', poll.id);
      
    if (allVotes) {
      pollVotes = allVotes.reduce((acc: Record<string, number>, vote: any) => {
        acc[vote.option_id] = (acc[vote.option_id] || 0) + 1;
        return acc;
      }, {});
    }

    // Fetch voter avatars using RPC
    // @ts-ignore
    const { data: avatars } = await supabase.rpc('get_poll_voter_avatars', { p_poll_id: poll.id });
    if (avatars) {
      voterAvatars = (avatars as any[]).map((a: any) => a.avatar_url);
    }

    if (user) {
      const { data: myVoteData } = await supabase
        .from('poll_votes')
        .select('option_id')
        .eq('poll_id', poll.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      const myVote = myVoteData as { option_id: string } | null;

      if (myVote) {
        userVote = myVote.option_id;
      }
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.created_at,
    author: {
      '@type': 'Person',
      name: 'Parishkrit Bastakoti',
    },
  };

  const pollPlacement = poll?.placement || 'bottom';

  const renderPoll = () => (
    poll && (
      <div className="mb-16">
        <Poll
          pollId={poll.id}
          question={poll.question}
          options={poll.options as any}
          initialVotes={pollVotes}
          userVote={userVote}
          user={user}
          voterAvatars={voterAvatars}
        />
      </div>
    )
  );

  let contentBefore = post.content;
  let contentAfter = '';

  if (pollPlacement === 'middle') {
    const parts = post.content.split('</p>');
    // Remove empty last element if exists
    if (parts[parts.length - 1].trim() === '') parts.pop();
    
    if (parts.length >= 2) {
      const mid = Math.ceil(parts.length / 2);
      contentBefore = parts.slice(0, mid).join('</p>') + '</p>';
      contentAfter = parts.slice(mid).join('</p>') + '</p>';
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <article>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-balance">
            {post.title}
          </h1>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-6 gap-4">
            <div className="flex items-center text-gray-500 text-sm">
              <span>{format(new Date(post.created_at), 'MMMM d, yyyy')}</span>
              <span className="mx-2">·</span>
              <span>Parishkrit Bastakoti</span>
              <span className="mx-2">·</span>
              <ViewCounter postId={post.id} initialViews={post.view_count || 0} />
            </div>
            <div className="flex items-center gap-4">
              <BookmarkButton 
                postId={post.id} 
                initialIsBookmarked={isBookmarked} 
                isLoggedIn={!!user}
              />
              <ShareButtons title={post.title} />
            </div>
          </div>
        </header>

        {pollPlacement === 'top' && renderPoll()}

        <div 
          className="prose prose-lg prose-gray max-w-none mb-16"
          dangerouslySetInnerHTML={{ __html: contentBefore }} 
        />
        
        {pollPlacement === 'middle' && renderPoll()}

        {contentAfter && (
           <div 
            className="prose prose-lg prose-gray max-w-none mb-16"
            dangerouslySetInnerHTML={{ __html: contentAfter }} 
          />
        )}
        
        {pollPlacement === 'bottom' && renderPoll()}

        <div id="comments">
          <CommentSection postId={post.id} initialComments={comments} />
        </div>
      </article>
      
      <FloatingCommentButton />
    </div>
  );
}
