'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export function DeletePostButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    setLoading(true);
    const { error } = await supabase.from('posts').delete().eq('id', postId);

    if (error) {
      alert('Error deleting post: ' + error.message);
    } else {
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading}
      className="inline-flex items-center justify-center text-red-600 hover:text-red-900 disabled:opacity-50 transition-colors"
      title="Delete Post"
    >
      {loading ? (
        <span className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}
