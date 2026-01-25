'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, Eye } from 'lucide-react';
import { formatViewCount } from '@/lib/utils';

export function AdminStats() {
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [totalPostViews, setTotalPostViews] = useState(0);
  const supabase = createClient() as any;

  useEffect(() => {
    // Fetch initial stats
    const fetchStats = async () => {
      // Get Site Visitors
      const { data: siteStats } = await supabase
        .from('site_stats')
        .select('total_visitors')
        .single();
      
      if (siteStats) {
        setTotalVisitors(siteStats.total_visitors);
      }

      // Get Total Post Views
      const { data: posts } = await supabase
        .from('posts')
        .select('view_count');
      
      if (posts) {
        const total = posts.reduce((sum: number, post: any) => sum + (post.view_count || 0), 0);
        setTotalPostViews(total);
      }
    };

    fetchStats();

    // Subscribe to site_stats
    const siteChannel = supabase
      .channel('admin_site_stats')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'site_stats',
          filter: 'id=eq.1',
        },
        (payload: any) => {
          setTotalVisitors(payload.new.total_visitors);
        }
      )
      .subscribe();

    // Subscribe to posts for total view count
    const postsChannel = supabase
      .channel('admin_posts_stats')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events to update total sum
          schema: 'public',
          table: 'posts',
        },
        async () => {
          // Re-fetch sum on any post change (simplest way to keep accurate total without tracking 50 rows)
          const { data: posts } = await supabase
            .from('posts')
            .select('view_count');
          
          if (posts) {
            const total = posts.reduce((sum: number, post: any) => sum + (post.view_count || 0), 0);
            setTotalPostViews(total);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(siteChannel);
      supabase.removeChannel(postsChannel);
    };
  }, [supabase]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-gray-200 transition-colors">
        <div className="flex justify-between items-start z-10">
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Total Visitors</p>
            <h3 className="text-3xl font-bold tracking-tight text-gray-900" title={totalVisitors.toLocaleString()}>
              {formatViewCount(totalVisitors)}
            </h3>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 blur-2xl group-hover:opacity-75 transition-opacity" />
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-gray-200 transition-colors">
        <div className="flex justify-between items-start z-10">
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Total Views</p>
            <h3 className="text-3xl font-bold tracking-tight text-gray-900" title={totalPostViews.toLocaleString()}>
              {formatViewCount(totalPostViews)}
            </h3>
          </div>
          <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:scale-110 transition-transform">
            <Eye className="w-5 h-5" />
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-green-50 rounded-full opacity-50 blur-2xl group-hover:opacity-75 transition-opacity" />
      </div>

      {/* Placeholder for future stat, e.g., Total Posts or Comments */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-gray-200 transition-colors border-dashed bg-gray-50/50">
        <div className="flex items-center justify-center h-full text-gray-400 text-sm font-medium">
          More stats coming soon
        </div>
      </div>
    </div>
  );
}
