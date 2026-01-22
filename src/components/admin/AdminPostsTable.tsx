'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Database } from '@/types/supabase';
import { ViewCounter } from '@/components/blog/ViewCounter';
import { DeletePostButton } from './DeletePostButton';
import { CheckSquare, Square, Trash2, Eye, EyeOff } from 'lucide-react';

type Post = Database['public']['Tables']['posts']['Row'];

interface AdminPostsTableProps {
  initialPosts: Post[];
}

export function AdminPostsTable({ initialPosts }: AdminPostsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient() as any;

  const toggleAll = () => {
    if (selectedIds.size === initialPosts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(initialPosts.map(p => p.id)));
    }
  };

  const toggleOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} posts?`)) return;

    setLoading(true);
    const { error } = await supabase
      .from('posts')
      .delete()
      .in('id', Array.from(selectedIds));

    if (error) {
      alert('Error deleting posts: ' + error.message);
    } else {
      setSelectedIds(new Set());
      router.refresh();
    }
    setLoading(false);
  };

  const handleBulkStatusChange = async (published: boolean) => {
    setLoading(true);
    const { error } = await supabase
      .from('posts')
      .update({ published } as any)
      .in('id', Array.from(selectedIds));

    if (error) {
      alert('Error updating posts: ' + error.message);
    } else {
      setSelectedIds(new Set());
      router.refresh();
    }
    setLoading(false);
  };

  const isAllSelected = initialPosts.length > 0 && selectedIds.size === initialPosts.length;

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-xl border border-gray-200 rounded-full px-6 py-3 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <span className="text-sm font-medium text-gray-600 border-r border-gray-200 pr-4">
            {selectedIds.size} selected
          </span>
          
          <button
            onClick={() => handleBulkStatusChange(true)}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800 disabled:opacity-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Publish
          </button>
          
          <button
            onClick={() => handleBulkStatusChange(false)}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-medium text-yellow-700 hover:text-yellow-800 disabled:opacity-50 transition-colors"
          >
            <EyeOff className="w-4 h-4" />
            Draft
          </button>
          
          <div className="w-px h-4 bg-gray-200" />
          
          <button
            onClick={handleBulkDelete}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 md:px-6 py-4 w-12">
                  <button 
                    onClick={toggleAll}
                    className="flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {isAllSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5" />}
                  </button>
                </th>
                <th className="px-4 md:px-6 py-4 font-medium text-gray-500">Title</th>
                <th className="px-4 md:px-6 py-4 font-medium text-gray-500">Status</th>
                <th className="px-4 md:px-6 py-4 font-medium text-gray-500">Views</th>
                <th className="px-4 md:px-6 py-4 font-medium text-gray-500">Date</th>
                <th className="px-4 md:px-6 py-4 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!initialPosts?.length ? (
                <tr>
                  <td colSpan={6} className="px-4 md:px-6 py-8 text-center text-gray-500">
                    No posts found.
                  </td>
                </tr>
              ) : (
                initialPosts.map((post) => {
                  const isSelected = selectedIds.has(post.id);
                  return (
                    <tr key={post.id} className={`transition-colors ${isSelected ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <td className="px-4 md:px-6 py-4">
                        <button 
                          onClick={() => toggleOne(post.id)}
                          className="flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5" />}
                        </button>
                      </td>
                      <td className="px-4 md:px-6 py-4 font-medium max-w-[200px] md:max-w-none truncate" title={post.title}>
                        <Link href={`/admin/posts/${post.id}`} className="hover:text-blue-600 transition-colors">
                          {post.title}
                        </Link>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          post.published ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <ViewCounter 
                          postId={post.id} 
                          initialViews={post.view_count || 0} 
                          trackView={false} 
                          showIcon={false}
                        />
                      </td>
                      <td className="px-4 md:px-6 py-4 text-gray-500">
                        {format(new Date(post.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right space-x-4 whitespace-nowrap">
                        <Link 
                          href={`/admin/posts/${post.id}`} 
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                        <DeletePostButton postId={post.id} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
