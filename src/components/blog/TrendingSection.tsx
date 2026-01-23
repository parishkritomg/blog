'use client';

import { useEffect, useRef } from 'react';
import { TrendingPostItem } from '@/components/blog/TrendingPostItem';
import { Database } from '@/types/supabase';
import { TrendingUp } from 'lucide-react';

type Post = Database['public']['Tables']['posts']['Row'];

interface TrendingSectionProps {
  posts: Post[];
}

export function TrendingSection({ posts }: TrendingSectionProps) {
  // Duplicate posts for seamless marquee loop (4 sets to be safe)
  const marqueePosts = [...posts, ...posts, ...posts, ...posts]; 
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);
  const scrollAccumulator = useRef(0);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationFrameId: number;

    // Initialize accumulator with current scroll position
    scrollAccumulator.current = scrollContainer.scrollLeft;

    const scroll = () => {
      if (!scrollContainer) return;

      if (isPaused.current) {
        // When paused, sync accumulator with actual scroll position
        // This ensures when we resume, we start from where the user dragged it
        scrollAccumulator.current = scrollContainer.scrollLeft;
      } else {
        // Increment accumulator
        // Speed: 0.5px per frame (approx 30px/sec at 60fps)
        scrollAccumulator.current += 0.5;

        // Apply to scrollLeft
        scrollContainer.scrollLeft = scrollAccumulator.current;

        // Check for wrap-around
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollAccumulator.current = 0;
          scrollContainer.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <TrendingUp className="w-5 h-5 text-red-500" />
        <h2 className="text-xl font-bold tracking-tight text-gray-900">Trending</h2>
      </div>

      {/* Desktop Grid View */}
      <div className="hidden md:grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <TrendingPostItem key={`trending-desktop-${post.id}`} post={post} />
        ))}
      </div>

      {/* Mobile Marquee View (Manual + Auto Scroll) */}
      <div className="md:hidden -mx-6">
        <div 
          ref={scrollRef}
          className="flex gap-4 px-6 overflow-x-auto scrollbar-hide touch-pan-x"
          onPointerDown={() => { isPaused.current = true; }}
          onPointerUp={() => { isPaused.current = false; }}
          onPointerLeave={() => { isPaused.current = false; }}
          onTouchStart={() => { isPaused.current = true; }}
          onTouchEnd={() => { isPaused.current = false; }}
        >
          {marqueePosts.map((post, index) => (
            <div key={`trending-mobile-${post.id}-${index}`} className="w-[85vw] flex-shrink-0">
              <TrendingPostItem post={post} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
