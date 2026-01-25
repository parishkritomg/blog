'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Database } from '@/types/supabase';
import { RichTextEditor } from './RichTextEditor';
import { format } from 'date-fns';
import { Eye, Send, ChevronDown, ChevronUp, Plus, Trash2, Settings, X, Calendar, MapPin, Globe, ImageIcon, Tag } from 'lucide-react';

type Post = Database['public']['Tables']['posts']['Row'];

interface PollOption {
  id: string;
  text: string;
}

interface Poll {
  id: string;
  post_id: string;
  question: string;
  options: PollOption[];
  placement?: 'top' | 'bottom' | 'middle';
  created_at: string;
}

interface PostEditorProps {
  post?: Post;
  initialPoll?: Poll | null;
}

export function PostEditor({ post, initialPoll }: PostEditorProps) {
  const router = useRouter();
  const supabase = createClient() as any;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Main Fields
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  
  // Sidebar Fields
  const [slug, setSlug] = useState(post?.slug || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [published, setPublished] = useState(post?.published || false);
  const [tags, setTags] = useState<string>(post?.tags ? post.tags.join(', ') : '');
  const [featuredImage, setFeaturedImage] = useState(post?.featured_image || '');
  
  // Poll Fields
  const [hasPoll, setHasPoll] = useState(!!initialPoll);
  const [pollQuestion, setPollQuestion] = useState(initialPoll?.question || '');
  const [pollOptions, setPollOptions] = useState<PollOption[]>(
    initialPoll?.options || [
      { id: '1', text: '' },
      { id: '2', text: '' }
    ]
  );
  const [pollPlacement, setPollPlacement] = useState<'top' | 'bottom' | 'middle'>(initialPoll?.placement || 'bottom');
  const [showPoll, setShowPoll] = useState(!!initialPoll);
  const toLocalISO = (isoString?: string) => {
    const date = isoString ? new Date(isoString) : new Date();
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const [publishDate, setPublishDate] = useState<string>(toLocalISO(post?.created_at));

  // UI State
  const [showOptions, setShowOptions] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const addPollOption = () => {
    setPollOptions([...pollOptions, { id: Date.now().toString(), text: '' }]);
  };

  const removePollOption = (id: string) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter(o => o.id !== id));
    }
  };

  const updatePollOption = (id: string, text: string) => {
    setPollOptions(pollOptions.map(o => o.id === id ? { ...o, text } : o));
  };

  const handleSubmit = async (e: React.FormEvent | null, isPublish: boolean) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    const postData = {
      title,
      slug,
      excerpt: excerpt || content.replace(/<[^>]*>?/gm, '').slice(0, 150) + '...', // Auto-generate excerpt if empty
      content,
      published: isPublish,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      featured_image: featuredImage || null,
      created_at: new Date(publishDate).toISOString(),
    };

    let result;
    if (post) {
      result = await supabase
        .from('posts')
        .update(postData)
        .eq('id', post.id)
        .select();
    } else {
      result = await supabase
        .from('posts')
        .insert(postData)
        .select();
    }

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else {
      // Handle Poll
      const savedPost = result.data[0];
      if (savedPost) {
        if (hasPoll && pollQuestion.trim()) {
          const validOptions = pollOptions.filter(o => o.text.trim());
          if (validOptions.length < 2) {
            // Should probably show an error but for now let's just not save invalid poll
          } else {
            const pollData = {
              post_id: savedPost.id,
              question: pollQuestion,
              options: validOptions,
              placement: pollPlacement
            };

            let pollError;
            if (initialPoll) {
              const { error } = await supabase
                .from('polls')
                .update(pollData)
                .eq('id', initialPoll.id);
              pollError = error;
            } else {
              const { error } = await supabase
                .from('polls')
                .insert(pollData);
              pollError = error;
            }

            if (pollError) {
              setError('Error saving poll: ' + pollError.message);
              setLoading(false);
              return;
            }
          }
        } else if (initialPoll && !hasPoll) {
          // Delete poll if it existed but was disabled
          const { error } = await supabase
            .from('polls')
            .delete()
            .eq('id', initialPoll.id);
            
          if (error) {
            setError('Error deleting poll: ' + error.message);
            setLoading(false);
            return;
          }
        }
      }

      router.push('/admin');
      router.refresh();
    }
  };

  // Auto-generate slug from title if slug is empty
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!post && !slug) {
      setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handlePreview = () => {
    // Save draft first then preview? Or simple preview of content.
    // For simplicity, let's just open the post page if it exists, or alert.
    if (post?.slug) {
      window.open(`/${post.slug}`, '_blank');
    } else {
      alert('Please save the post first to preview.');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50/50 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-white border-b border-gray-200 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-gray-900">
            {post ? 'Edit Post' : 'New Post'}
          </h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          <button 
            type="button"
            onClick={handlePreview}
            className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            <Eye size={16} />
            <span className="hidden md:inline">Preview</span>
          </button>
          <button 
            type="button"
            onClick={() => handleSubmit(null, true)}
            disabled={loading}
            className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-white bg-black rounded hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Send size={16} />
            <span className="hidden md:inline">{loading ? 'Publishing...' : 'Publish'}</span>
            <span className="md:hidden">{loading ? '...' : 'Publish'}</span>
          </button>
          <button 
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 lg:hidden"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto w-full">
          {error && (
            <div className="mb-6 bg-red-50 text-red-700 p-4 text-sm rounded border border-red-200">
              {error}
            </div>
          )}
          
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Title"
            className="text-3xl md:text-4xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none bg-transparent mb-6 w-full"
          />

          <div className="flex-1 min-h-[500px]">
            <RichTextEditor 
              content={content} 
              onChange={setContent} 
            />
          </div>
        </div>

        {/* Sidebar Overlay (Mobile) */}
        {isSettingsOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm" 
            onClick={() => setIsSettingsOpen(false)} 
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 right-0 w-80 bg-white border-l border-gray-200 shadow-2xl transform transition-transform duration-300 z-40
          lg:relative lg:transform-none lg:shadow-none lg:border-l lg:z-0 lg:flex flex-col overflow-y-auto
          ${isSettingsOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex items-center justify-between p-4 border-b border-gray-100 lg:hidden">
            <h2 className="text-lg font-bold text-gray-900">Settings</h2>
            <button onClick={() => setIsSettingsOpen(false)} className="text-gray-500 hover:text-gray-900">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Post Settings Header */}
            <div className="hidden lg:block">
              <h2 className="text-lg font-medium text-gray-900 mb-1">Post settings</h2>
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <button className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-orange-500 group">
                <div className="flex items-center gap-2">
                  <ImageIcon size={16} className="text-gray-400 group-hover:text-orange-500" />
                  <span>Featured Image</span>
                </div>
                <ChevronUp size={16} className="text-gray-400" />
              </button>
              <div className="pt-2">
                <input
                  type="text"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="Image URL"
                  className="w-full border-b border-gray-300 py-2 text-sm focus:border-orange-500 focus:outline-none placeholder-gray-400"
                />
              </div>
            </div>

            {/* Labels */}
            <div className="space-y-2">
              <button className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-orange-500 group">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-gray-400 group-hover:text-orange-500" />
                  <span>Labels</span>
                </div>
                <ChevronUp size={16} className="text-gray-400" />
              </button>
              <div className="pt-2">
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Separate labels with commas"
                  className="w-full border-b border-gray-300 py-2 text-sm focus:border-orange-500 focus:outline-none placeholder-gray-400"
                />
              </div>
            </div>

            {/* Published On */}
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <button className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-orange-500 group">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400 group-hover:text-orange-500" />
                  <span>Published on</span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              <div className="pt-2">
                 <input
                  type="datetime-local"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full text-sm text-gray-600 border border-gray-200 rounded p-2"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(publishDate), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            </div>

            {/* Permalink */}
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <button className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-orange-500 group">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-gray-400 group-hover:text-orange-500" />
                  <span>Permalink</span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              <div className="pt-2">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full border border-gray-200 rounded p-2 text-sm text-gray-600 bg-gray-50"
                />
              </div>
            </div>

            {/* Location (Placeholder) */}
            <div className="space-y-2 border-t border-gray-100 pt-4 opacity-50">
              <button className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 cursor-not-allowed group">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400 group-hover:text-orange-500" />
                  <span>Location</span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Poll */}
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <button 
                onClick={() => setShowPoll(!showPoll)}
                className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-orange-500"
              >
                <span>Poll</span>
                {showPoll ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
              
              {showPoll && (
                <div className="pt-2 space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hasPoll"
                      checked={hasPoll}
                      onChange={(e) => setHasPoll(e.target.checked)}
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                    <label htmlFor="hasPoll" className="text-sm text-gray-600">Include a poll</label>
                  </div>

                  {hasPoll && (
                    <div className="space-y-3 pl-1">
                      <div>
                        <input
                          type="text"
                          value={pollQuestion}
                          onChange={(e) => setPollQuestion(e.target.value)}
                          placeholder="Poll Question"
                          className="w-full border-b border-gray-300 py-2 text-sm focus:border-orange-500 focus:outline-none placeholder-gray-400"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Placement</label>
                        <select
                          value={pollPlacement}
                          onChange={(e) => setPollPlacement(e.target.value as 'top' | 'bottom' | 'middle')}
                          className="w-full border-b border-gray-300 py-2 text-sm focus:border-orange-500 focus:outline-none bg-transparent"
                        >
                          <option value="top">Top (Before Content)</option>
                          <option value="middle">Middle (Within Content)</option>
                          <option value="bottom">Bottom (After Content)</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        {pollOptions.map((option, index) => (
                          <div key={option.id} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => updatePollOption(option.id, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              className="flex-1 border-b border-gray-300 py-1 text-sm focus:border-orange-500 focus:outline-none placeholder-gray-400"
                            />
                            {pollOptions.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removePollOption(option.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addPollOption}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
                        >
                          <Plus size={12} />
                          Add Option
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <button 
                onClick={() => setShowOptions(!showOptions)}
                className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-orange-500"
              >
                <span>Options</span>
                {showOptions ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
              
              {showOptions && (
                <div className="pt-2 space-y-4">
                   <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 uppercase">Excerpt</label>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-200 rounded p-2 text-sm text-gray-600"
                      placeholder="Custom excerpt..."
                    />
                   </div>
                   
                   <div className="flex items-center gap-2 pt-2">
                     <button
                        type="button"
                        onClick={() => handleSubmit(null, false)} // Save as draft
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                     >
                       Save as Draft
                     </button>
                   </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
