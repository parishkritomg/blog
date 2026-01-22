'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface BookmarkButtonProps {
  postId: string;
  initialIsBookmarked: boolean;
  isLoggedIn: boolean;
}

export function BookmarkButton({ postId, initialIsBookmarked, isLoggedIn }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient() as any;

  const toggleBookmark = async () => {
    if (!isLoggedIn) {
      // Use window.location.pathname to redirect back to current page
      router.push(`/login?next=${window.location.pathname}`);
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    const previousState = isBookmarked;
    setIsBookmarked(!previousState); // Optimistic update

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (previousState) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
        
        if (error) throw error;
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({ user_id: user.id, post_id: postId });
        
        if (error) throw error;
      }
      
      router.refresh(); 
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      setIsBookmarked(previousState); // Revert on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      disabled={isLoading}
      className="group flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
      title={isBookmarked ? "Remove bookmark" : "Bookmark this post"}
    >
      <Bookmark
        className={`w-5 h-5 transition-all ${
          isBookmarked ? 'fill-black text-black' : 'text-gray-400 group-hover:text-black'
        }`}
      />
      <span>{isBookmarked ? 'Saved' : 'Save'}</span>
    </button>
  );
}
