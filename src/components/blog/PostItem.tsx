import Link from 'next/link';
import { format } from 'date-fns';
import { Database } from '@/types/supabase';
import { ViewCounter } from './ViewCounter';
import { ArrowRight, Calendar, User } from 'lucide-react';

type Post = Database['public']['Tables']['posts']['Row'];

interface PostItemProps {
  post: Post;
}

export function PostItem({ post }: PostItemProps) {
  return (
    <article className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-gray-200 h-full">
      <Link href={`/${post.slug}`} className="flex flex-col h-full">
        {post.featured_image && (
          <div className="relative overflow-hidden aspect-[16/9] bg-gray-50">
            <img 
              src={post.featured_image} 
              alt={post.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
          </div>
        )}
        
        <div className="flex flex-col flex-1 p-6 sm:p-8">
          <div className="flex items-center gap-3 text-xs font-medium text-gray-500 mb-4 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(post.created_at), 'MMMM d, yyyy')}
            </span>
            <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
            <ViewCounter 
              postId={post.id} 
              initialViews={post.view_count || 0} 
              trackView={false}
              className="text-gray-500"
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-gray-600 transition-colors">
            {post.title}
          </h2>

          <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3 flex-1">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-gray-900">Parishkrit Bastakoti</span>
            </div>
            
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-black group-hover:translate-x-1 transition-transform">
              Read Article
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
