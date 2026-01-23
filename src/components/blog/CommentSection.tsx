'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Reply, MessageCircle, MoreHorizontal } from 'lucide-react';
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
        // Simple admin check by email
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
    if (!user) return;

    setIsSubmitting(true);
    setMessage(null);

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
      
      if (myComments[commentId]) {
        const { [commentId]: removed, ...rest } = myComments;
        setMyComments(rest);
        localStorage.setItem('my_comments', JSON.stringify(rest));
      }
    }
  };

  // State alias fix for form
  const commentState = comment; 

  const rootComments = comments.filter(c => !c.parent_id);

  return (
    <div className="mt-24 pt-12 border-t border-gray-100 max-w-3xl mx-auto">
      <div className="flex items-baseline justify-between mb-10">
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          Discussion
          <span className="bg-gray-100 text-gray-600 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {comments.length}
          </span>
        </h3>
      </div>

      {message && (
        <div className={`p-4 mb-8 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Main Comment Form */}
      <div className="mb-16">
        {!user ? (
          <div className="bg-gray-50 border border-gray-100 p-8 rounded-2xl text-center">
            <h4 className="font-semibold text-gray-900 mb-2">Join the conversation</h4>
            <p className="text-gray-500 mb-6 text-sm">Log in to share your thoughts with the community.</p>
            <a 
              href={`/login?next=${pathname}`}
              className="inline-flex items-center justify-center bg-black text-white px-8 py-2.5 text-sm font-medium rounded-full hover:bg-gray-800 transition-all hover:scale-105"
            >
              Login to Comment
            </a>
          </div>
        ) : !replyTo ? (
          <form onSubmit={(e) => handleSubmit(e, null)} className="relative group">
            <div className="absolute top-0 left-0 -ml-12 hidden md:block">
              <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                {user.user_metadata?.avatar_url ? (
                  <Image 
                    src={user.user_metadata.avatar_url} 
                    alt={name} 
                    width={32} 
                    height={32} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                    {name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <textarea
              required
              value={commentState}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-transparent border-b-2 border-gray-100 p-4 pl-0 text-base placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors resize-none min-h-[100px]"
              placeholder="What are your thoughts?"
            />
            <div className="flex justify-end mt-4 opacity-100 transition-opacity">
              <button
                type="submit"
                disabled={isSubmitting || !commentState.trim()}
                className="bg-black text-white px-6 py-2 text-sm font-medium rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-black transition-all"
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : null}
      </div>

      {/* Comment List */}
      <div className="space-y-10">
        {rootComments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No comments yet</p>
            <p className="text-gray-400 text-sm mt-1">Start the conversation by leaving a comment.</p>
          </div>
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
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className={`group ${isReply ? 'mt-6 pl-4 md:pl-0' : 'mt-8'}`}>
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 overflow-hidden relative border border-gray-100">
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
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-900 text-sm">
                  {comment.name}
                </span>
                {comment.isAdmin && (
                  <Image
                    src="/verification_badge.png"
                    alt="Verified"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                )}
              </div>
              <span className="text-gray-300 text-xs">•</span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
          
          <div className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {comment.comment}
          </div>
          
          <div className="flex items-center gap-4 mt-3">
            <button 
              onClick={() => {
                if (!user) {
                  window.location.href = `/login?next=${pathname}`;
                  return;
                }
                setReplyTo(replyTo === comment.id ? null : comment.id);
              }}
              className="text-xs font-semibold text-gray-500 hover:text-black flex items-center gap-1.5 transition-colors"
            >
              <Reply size={14} className="stroke-[2.5]" />
              Reply
            </button>

            {(isAdmin || myComments[comment.id] || (user && user.id === comment.user_id)) && (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-gray-600"
                  aria-label="More options"
                >
                  <MoreHorizontal size={16} />
                </button>
                
                {showMenu && (
                  <div className="absolute left-0 mt-1 bg-white border border-gray-100 shadow-lg rounded-lg py-1 z-20 w-32 animate-in fade-in zoom-in-95 duration-100">
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
            <div className="mt-6 mb-8 animate-in fade-in slide-in-from-top-2">
              <form onSubmit={(e) => handleSubmit(e, comment.id)} className="relative">
                <textarea
                  required
                  value={commentValue}
                  onChange={(e) => setCommentValue(e.target.value)}
                  placeholder={`Reply to ${comment.name}...`}
                  rows={3}
                  autoFocus
                  className="w-full bg-gray-50 border-0 rounded-xl p-4 text-sm focus:ring-2 focus:ring-black/5 transition-all resize-none"
                />
                <div className="flex items-center justify-end gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-black transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-black text-white px-4 py-2 text-xs font-medium rounded-full hover:bg-gray-800 disabled:opacity-50 transition-all"
                  >
                    {isSubmitting ? 'Sending...' : 'Reply'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Nested Replies Container */}
          {replies.length > 0 && (
            <div className="mt-4 border-l-2 border-gray-100 pl-4 md:pl-6 space-y-6">
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
          )}
        </div>
      </div>
    </div>
  );
};
