'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Eye } from 'lucide-react';
import { formatViewCount } from '@/lib/utils';

interface ViewCounterProps {
  postId: string;
  initialViews?: number;
  trackView?: boolean;
  className?: string;
  showIcon?: boolean;
}

export function ViewCounter({ 
  postId, 
  initialViews = 0, 
  trackView = true,
  className = '',
  showIcon = true
}: ViewCounterProps) {
  const [views, setViews] = useState(initialViews);
  const supabase = createClient() as any;

  useEffect(() => {
    // Optimistic update from props if they change (unlikely for server component pass-down but good practice)
    setViews(initialViews);
  }, [initialViews]);

  useEffect(() => {
    if (trackView) {
      const viewedKey = `viewed_post_${postId}`;
      const hasViewed = sessionStorage.getItem(viewedKey);

      if (!hasViewed) {
        // Call RPC to increment view count
        const incrementView = async () => {
          await supabase.rpc('increment_view_count', { post_id: postId });
          sessionStorage.setItem(viewedKey, 'true');
        };
        incrementView();
      }
    }

    // Subscribe to realtime changes for this post
    const channel = supabase
      .channel(`post_views_${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${postId}`,
        },
        (payload: any) => {
          const newViews = payload.new.view_count;
          if (typeof newViews === 'number') {
            setViews(newViews);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, trackView, supabase]);

  return (
    <span className={`inline-flex items-center gap-1.5 text-gray-500 ${className}`} title={`${views.toLocaleString()} views`}>
      {showIcon && <Eye className="w-4 h-4" />}
      <span className="tabular-nums">{formatViewCount(views)}</span>
    </span>
  );
}
