'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationFrameId: number;

    const scroll = () => {
      if (!isPaused && scrollContainer) {
        // Slow speed: 0.5px per frame (approx 30px per second at 60fps)
        scrollContainer.scrollLeft += 0.5;

        // Check for wrap-around
        // We wrap when we've scrolled past half the total content width
        // This assumes the content consists of two identical halves (which 4 sets provides: 2 sets + 2 sets)
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

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
          className="flex gap-4 px-6 overflow-x-auto scrollbar-hide"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
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
