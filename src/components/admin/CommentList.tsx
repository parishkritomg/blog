'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface Comment {
  id: string;
  post_id: string;
  name: string;
  email: string;
  comment: string;
  approved: boolean;
  created_at: string;
  posts: {
    title: string;
  } | null; // Join result
}

export function CommentList({ initialComments }: { initialComments: any[] }) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  // Cast to any to avoid TypeScript issues with generated types during build
  const supabase = createClient() as any;
  const router = useRouter();

  const handleApprove = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const { error } = await supabase
      .from('comments')
      .update({ approved: newStatus })
      .eq('id', id);

    if (error) {
      alert('Error updating comment: ' + error.message);
    } else {
      setComments(comments.map(c => c.id === id ? { ...c, approved: newStatus } : c));
      router.refresh();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    
    const { error } = await supabase.from('comments').delete().eq('id', id);

    if (error) {
      alert('Error deleting comment: ' + error.message);
    } else {
      setComments(comments.filter(c => c.id !== id));
      router.refresh();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 font-medium text-gray-500">Author</th>
            <th className="px-6 py-4 font-medium text-gray-500">Comment</th>
            <th className="px-6 py-4 font-medium text-gray-500">Post</th>
            <th className="px-6 py-4 font-medium text-gray-500">Date</th>
            <th className="px-6 py-4 font-medium text-gray-500">Status</th>
            <th className="px-6 py-4 font-medium text-gray-500 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {comments.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                No comments found.
              </td>
            </tr>
          ) : (
            comments.map((comment) => (
              <tr key={comment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium">{comment.name}</div>
                  <div className="text-xs text-gray-400">{comment.email}</div>
                </td>
                <td className="px-6 py-4 max-w-xs truncate" title={comment.comment}>
                  {comment.comment}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {comment.posts?.title || 'Unknown Post'}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {format(new Date(comment.created_at), 'MMM d')}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    comment.approved ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {comment.approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => handleApprove(comment.id, comment.approved)}
                    className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                      comment.approved 
                        ? 'text-yellow-600 hover:bg-yellow-50' 
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {comment.approved ? 'Unapprove' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs font-medium text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
