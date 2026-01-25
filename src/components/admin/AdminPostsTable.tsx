'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Database } from '@/types/supabase';
import { DeletePostButton } from './DeletePostButton';
import { CheckSquare, Square, Trash2, Eye, EyeOff, Pencil, Search } from 'lucide-react';

type Post = Database['public']['Tables']['posts']['Row'];

interface AdminPostsTableProps {
  initialPosts: Post[];
}

export function AdminPostsTable({ initialPosts }: AdminPostsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const supabase = createClient() as any;

  const filteredPosts = initialPosts.filter(post => {
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.slug.toLowerCase().includes(query) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(query)) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  });

  const toggleAll = () => {
    if (selectedIds.size === filteredPosts.length && filteredPosts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPosts.map(p => p.id)));
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

  const isAllSelected = filteredPosts.length > 0 && selectedIds.size === filteredPosts.length;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search posts by title, slug, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all shadow-sm text-sm"
        />
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:bottom-8 md:right-8 bg-black text-white shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <span className="text-sm font-medium border-r border-gray-700 pr-4">
            {selectedIds.size} selected
          </span>
          
          <button
            onClick={() => handleBulkStatusChange(true)}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-medium hover:text-green-400 disabled:opacity-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Publish</span>
          </button>
          
          <button
            onClick={() => handleBulkStatusChange(false)}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-medium hover:text-yellow-400 disabled:opacity-50 transition-colors"
          >
            <EyeOff className="w-4 h-4" />
            <span className="hidden sm:inline">Draft</span>
          </button>
          
          <div className="w-px h-4 bg-gray-700" />
          
          <button
            onClick={handleBulkDelete}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-12">
                  <button 
                    onClick={toggleAll}
                    className="flex items-center text-gray-400 hover:text-black transition-colors"
                  >
                    {isAllSelected ? <CheckSquare className="w-5 h-5 text-black" /> : <Square className="w-5 h-5" />}
                  </button>
                </th>
                <th className="px-6 py-4 font-semibold text-gray-900">Title</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Views</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!filteredPosts?.length ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Search className="w-8 h-8 mb-3 text-gray-300" />
                      <p className="font-medium">{initialPosts.length === 0 ? "No posts found" : "No posts match your search"}</p>
                      <p className="text-xs mt-1">Try creating a new post or adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => {
                  const isSelected = selectedIds.has(post.id);
                  return (
                    <tr key={post.id} className={`transition-colors group ${isSelected ? 'bg-gray-50' : 'hover:bg-gray-50/50'}`}>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleOne(post.id)}
                          className="flex items-center text-gray-300 group-hover:text-gray-400 hover:!text-black transition-colors"
                        >
                          {isSelected ? <CheckSquare className="w-5 h-5 text-black" /> : <Square className="w-5 h-5" />}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-[300px] md:max-w-[400px]">
                          <Link href={`/admin/posts/${post.id}`} className="font-medium text-gray-900 hover:text-black hover:underline decoration-1 underline-offset-4 transition-all line-clamp-1 block">
                            {post.title}
                          </Link>
                          <span className="text-xs text-gray-400 font-mono mt-0.5 line-clamp-1 block">/{post.slug}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          post.published 
                            ? 'bg-green-50 text-green-700 border-green-100' 
                            : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                        }`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Eye className="w-4 h-4 text-gray-300" />
                          <span>{post.view_count || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {format(new Date(post.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link 
                            href={`/admin/posts/${post.id}`} 
                            className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit Post"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <DeletePostButton postId={post.id} />
                        </div>
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
