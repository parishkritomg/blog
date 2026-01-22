'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { Trash2, Reply, MessageSquare } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface Comment {
  id: string;
  name: string;
  comment: string;
  created_at: string;
  parent_id: string | null;
  user_id: string | null;
  avatar_url?: string | null;
  isAdmin?: boolean;
}

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
}

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const pathname = usePathname();
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [myComments, setMyComments] = useState<Record<string, string>>({}); // id -> secret

  const supabase = createClient() as any;

  useEffect(() => {
    // Check auth state
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Simple admin check by email (should match your admin email)
        const isAdminUser = user.email === 'parishkrit2061@gmail.com';
        setIsAdmin(isAdminUser);
        
        // Pre-fill form
        if (isAdminUser) {
          setName('Parishkrit Bastakoti');
        } else if (user.user_metadata?.full_name) {
          setName(user.user_metadata.full_name);
        }
        
        if (user.email) setEmail(user.email);
      }
    };
    checkUser();

    // Load local comments
    const saved = localStorage.getItem('my_comments');
    if (saved) {
      setMyComments(JSON.parse(saved));
    }
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!user) return; // Should not happen if UI is correct

    setIsSubmitting(true);
    setMessage(null);

    // Generate a random secret for this comment (legacy support for local delete)
    const userSecret = crypto.randomUUID();

    // Try inserting with avatar_url first
    let { data, error } = await supabase.from('comments').insert({
      post_id: postId,
      parent_id: parentId,
      user_id: user.id,
      name,
      email,
      comment,
      avatar_url: user.user_metadata?.avatar_url,
      approved: true,
      user_secret: userSecret,
    }).select().single();

    // If that fails (likely due to missing column), try without avatar_url
    if (error) {
      console.warn('Initial comment submission failed, retrying without avatar_url...', error);
      const result = await supabase.from('comments').insert({
        post_id: postId,
        parent_id: parentId,
        user_id: user.id,
        name,
        email,
        comment,
        approved: true,
        user_secret: userSecret,
      }).select().single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error submitting comment:', error);
      setMessage({ type: 'error', text: 'Failed to submit comment. Please try again.' });
    } else {
      // Add new comment to local state immediately
      const newComment = {
        id: data.id,
        name,
        comment,
        created_at: data.created_at,
        parent_id: parentId,
        user_id: user.id,
        avatar_url: user.user_metadata?.avatar_url,
        isAdmin: isAdmin
      };
      
      setComments([...comments, newComment]);

      // Save secret to local storage
      const newMyComments = { ...myComments, [data.id]: userSecret };
      setMyComments(newMyComments);
      localStorage.setItem('my_comments', JSON.stringify(newMyComments));

      setMessage({ type: 'success', text: 'Comment posted successfully!' });
      setComment('');
      setReplyTo(null);
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    // Get secret if available
    const secret = myComments[commentId];

    const { error } = await supabase.rpc('delete_comment', {
      comment_id: commentId,
      secret_key: secret || null
    });

    if (error) {
      console.error('Delete error:', error);
      alert('Failed to delete comment. You might not have permission.');
    } else {
      setComments(comments.filter(c => c.id !== commentId && c.parent_id !== commentId));
      
      // Cleanup local storage
      if (myComments[commentId]) {
        const { [commentId]: removed, ...rest } = myComments;
        setMyComments(rest);
        localStorage.setItem('my_comments', JSON.stringify(rest));
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // State alias fix for form
  const commentState = comment; 

  const rootComments = comments.filter(c => !c.parent_id);

  return (
    <div className="mt-16 pt-10 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-8">
        <MessageSquare size={20} className="text-gray-900" />
        <h3 className="text-xl font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {message && (
        <div className={`p-4 mb-8 rounded text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Main Comment Form */}
      <div className="mb-12">
        {!user ? (
          <div className="bg-gray-50 p-6 rounded-lg text-center py-6">
            <p className="text-gray-600 mb-4 text-sm">Please login to leave a comment.</p>
            <a 
              href={`/login?next=${pathname}`}
              className="inline-block bg-black text-white px-6 py-2 text-sm font-medium rounded hover:bg-gray-800 transition-colors"
            >
              Login / Sign Up
            </a>
          </div>
        ) : !replyTo ? (
          <form onSubmit={(e) => handleSubmit(e, null)} className="space-y-4">
            <div className="relative">
              <textarea
                required
                value={commentState}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-white border border-gray-200 p-4 text-sm rounded-lg focus:outline-none focus:border-black transition-colors resize-none min-h-[120px]"
                placeholder={`Comment as ${name}...`}
              />
              <div className="absolute bottom-3 right-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-black text-white px-4 py-1.5 text-xs font-medium rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </form>
        ) : null}
      </div>

      {/* Comment List */}
      <div className="space-y-2">
        {rootComments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first to share your thoughts.</p>
        ) : (
          rootComments.map((c) => (
            <CommentItem 
              key={c.id} 
              comment={c} 
              allComments={comments}
              user={user}
              isAdmin={isAdmin}
              myComments={myComments}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              handleSubmit={handleSubmit}
              handleDelete={handleDelete}
              commentValue={commentState}
              setCommentValue={setComment}
              isSubmitting={isSubmitting}
              userName={name}
              pathname={pathname}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  allComments: Comment[];
  isReply?: boolean;
  user: any;
  isAdmin: boolean;
  myComments: Record<string, string>;
  replyTo: string | null;
  setReplyTo: (id: string | null) => void;
  handleSubmit: (e: React.FormEvent, parentId: string | null) => Promise<void>;
  handleDelete: (commentId: string) => Promise<void>;
  commentValue: string;
  setCommentValue: (value: string) => void;
  isSubmitting: boolean;
  userName: string;
  pathname: string;
}

const CommentItem = ({ 
  comment, 
  allComments, 
  isReply = false,
  user,
  isAdmin,
  myComments,
  replyTo,
  setReplyTo,
  handleSubmit,
  handleDelete,
  commentValue,
  setCommentValue,
  isSubmitting,
  userName,
  pathname
}: CommentItemProps) => {
  const replies = allComments.filter(c => c.parent_id === comment.id);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className={`${isReply ? 'ml-3 md:ml-12 mt-4' : 'mt-8'}`}>
      <div className="flex gap-3 md:gap-4 group">
        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 overflow-hidden relative">
          {comment.avatar_url ? (
            <Image 
              src={comment.avatar_url} 
              alt={comment.name}
              fill
              className="object-cover"
            />
          ) : (
            getInitials(comment.name)
          )}
        </div>
        <div className="flex-1">
          <div className="bg-gray-50 p-4 rounded-lg rounded-tl-none">
            <div className="flex items-start justify-between mb-2 gap-2">
              <span className="font-medium text-sm text-gray-900 break-words min-w-0">
                {comment.name}
                {comment.isAdmin && (
                  <span className="inline-flex align-middle ml-1">
                    <Image 
                      src="/verification_badge.png" 
                      alt="Verified Admin" 
                      width={14} 
                      height={14} 
                    />
                  </span>
                )}
              </span>
              <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 mt-0.5">
                {format(new Date(comment.created_at), 'MMM d, yyyy')}
              </span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{comment.comment}</p>
          </div>
          
          <div className="flex items-center gap-4 mt-2 ml-1">
            <button 
              onClick={() => {
                if (!user) {
                  window.location.href = `/login?next=${pathname}`;
                  return;
                }
                setReplyTo(replyTo === comment.id ? null : comment.id);
              }}
              className="text-xs font-medium text-gray-500 hover:text-black flex items-center gap-1 transition-colors"
            >
              <Reply size={12} />
              Reply
            </button>
            {(isAdmin || myComments[comment.id] || (user && user.id === comment.user_id)) && (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className={`p-1 hover:bg-gray-100 rounded-full transition-all ${showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  aria-label="More options"
                >
                  <MoreVertical size={14} className="text-gray-500" />
                </button>
                
                {showMenu && (
                  <div className="absolute left-0 mt-1 bg-white border border-gray-100 shadow-xl rounded-lg py-1 z-20 w-32 animate-in fade-in zoom-in-95 duration-100">
                    <button 
                      onClick={() => {
                        handleDelete(comment.id);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reply Form */}
          {replyTo === comment.id && (
            <div className="mt-4 ml-2 md:ml-4 pl-3 md:pl-4 border-l-2 border-gray-100 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reply to {comment.name}</h5>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="text-xs text-gray-400 hover:text-black"
                >
                  Cancel
                </button>
              </div>
              <form onSubmit={(e) => handleSubmit(e, comment.id)} className="space-y-3">
                <div className="relative">
                  <textarea
                    required
                    value={commentValue}
                    onChange={(e) => setCommentValue(e.target.value)}
                    placeholder={`Reply as ${userName}...`}
                    rows={3}
                    className="w-full bg-white border border-gray-200 p-3 text-sm rounded-lg focus:outline-none focus:border-black transition-colors resize-none"
                  />
                  <div className="absolute bottom-2 right-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-black text-white px-3 py-1 text-xs font-medium rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      {isSubmitting ? 'Sending...' : 'Reply'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Nested Replies */}
          {replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              isReply={true}
              allComments={allComments}
              user={user}
              isAdmin={isAdmin}
              myComments={myComments}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              handleSubmit={handleSubmit}
              handleDelete={handleDelete}
              commentValue={commentValue}
              setCommentValue={setCommentValue}
              isSubmitting={isSubmitting}
              userName={userName}
              pathname={pathname}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
