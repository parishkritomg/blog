import Link from 'next/link';
import { Database } from '@/types/supabase';
import { ViewCounter } from './ViewCounter';

type Post = Database['public']['Tables']['posts']['Row'];

interface TrendingPostItemProps {
  post: Post;
}

export function TrendingPostItem({ post }: TrendingPostItemProps) {
  return (
    <Link 
      href={`/${post.slug}`} 
      className="group relative block overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 aspect-[4/3] w-full"
    >
      {/* Image Background */}
      {post.featured_image ? (
        <img 
          src={post.featured_image} 
          alt={post.title} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gray-200" />
      )}
      
      {/* White Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-white via-white/80 to-transparent" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-1">
        <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:underline decoration-2 underline-offset-4 decoration-black/20 transition-all line-clamp-2">
          {post.title}
        </h3>
        
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
           <ViewCounter 
            postId={post.id} 
            initialViews={post.view_count || 0} 
            trackView={false}
            className="text-gray-600"
          />
        </div>
      </div>
    </Link>
  );
}
