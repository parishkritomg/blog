'use client';

import { useState } from 'react';
import { Twitter, Facebook, Linkedin, Link as LinkIcon, Check } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
}

export function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    if (typeof window === 'undefined') return;
    
    const url = window.location.href;
    const text = `Check out "${title}"`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const copyLink = () => {
    if (typeof window === 'undefined') return;
    
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-500 mr-2 hidden sm:inline-block">Share</span>
      <div className="flex gap-1">
        <button 
          onClick={() => handleShare('twitter')} 
          className="p-1.5 rounded-full hover:bg-black hover:text-white text-gray-500 transition-all duration-200" 
          aria-label="Share on Twitter"
        >
          <Twitter size={16} />
        </button>
        <button 
          onClick={() => handleShare('facebook')} 
          className="p-1.5 rounded-full hover:bg-black hover:text-white text-gray-500 transition-all duration-200" 
          aria-label="Share on Facebook"
        >
          <Facebook size={16} />
        </button>
        <button 
          onClick={() => handleShare('linkedin')} 
          className="p-1.5 rounded-full hover:bg-black hover:text-white text-gray-500 transition-all duration-200" 
          aria-label="Share on LinkedIn"
        >
          <Linkedin size={16} />
        </button>
        <button 
          onClick={copyLink} 
          className="p-1.5 rounded-full hover:bg-black hover:text-white text-gray-500 transition-all duration-200 relative" 
          aria-label="Copy Link"
        >
          {copied ? <Check size={16} /> : <LinkIcon size={16} />}
          {copied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow-lg whitespace-nowrap">
              Copied!
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
