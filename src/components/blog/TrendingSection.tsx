'use client';

import { TrendingPostItem } from '@/components/blog/TrendingPostItem';
import { Database } from '@/types/supabase';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

type Post = Database['public']['Tables']['posts']['Row'];

interface TrendingSectionProps {
  posts: Post[];
}

export function TrendingSection({ posts }: TrendingSectionProps) {
  // Duplicate posts for seamless marquee loop
  const marqueePosts = [...posts, ...posts, ...posts, ...posts]; 

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

      {/* Mobile Marquee View */}
      <div className="md:hidden overflow-hidden -mx-6">
        <motion.div
          className="flex gap-4 px-6 w-max"
          animate={{ x: "-50%" }}
          transition={{ 
            duration: 40, 
            ease: "linear", 
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          {marqueePosts.map((post, index) => (
            <div key={`trending-mobile-${post.id}-${index}`} className="w-[85vw] flex-shrink-0">
              <TrendingPostItem post={post} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
