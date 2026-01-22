'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Database } from '@/types/supabase';
import { RichTextEditor } from './RichTextEditor';
import { format } from 'date-fns';
import { Eye, Send, ChevronDown, ChevronUp } from 'lucide-react';

type Post = Database['public']['Tables']['posts']['Row'];

interface PostEditorProps {
  post?: Post;
}

export function PostEditor({ post }: PostEditorProps) {
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
  const toLocalISO = (isoString?: string) => {
    const date = isoString ? new Date(isoString) : new Date();
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const [publishDate, setPublishDate] = useState<string>(toLocalISO(post?.created_at));

  // UI State
  const [showOptions, setShowOptions] = useState(true);

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
    <div className="flex flex-col h-[calc(100vh-65px)] bg-gray-50 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800">
          {post ? 'Edit Post' : 'New Post'}
        </h1>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            <Eye size={16} />
            Preview
          </button>
          <button 
            type="button"
            onClick={() => handleSubmit(null, true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Send size={16} />
            {loading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col p-8 overflow-y-auto">
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
            className="text-4xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none bg-transparent mb-6 w-full"
          />

          <div className="flex-1 min-h-[500px]">
            <RichTextEditor 
              content={content} 
              onChange={setContent} 
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto flex flex-col">
          <div className="p-6 space-y-8">
            {/* Post Settings Header */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-1">Post settings</h2>
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <button className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-orange-500">
                <span>Featured Image</span>
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
              <button className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-orange-500">
                <span>Labels</span>
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
              <button className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-orange-500">
                <span>Published on</span>
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
              <button className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-orange-500">
                <span>Permalink</span>
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
              <button className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 cursor-not-allowed">
                <span>Location</span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
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
