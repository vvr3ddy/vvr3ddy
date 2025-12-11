'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Heart } from 'lucide-react';

export default function PostActions({ slug, title }: { slug: string, title: string }) {
  const [copied, setCopied] = useState(false);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  // Fetch initial likes
  useEffect(() => {
    fetch(`/api/likes?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.likes !== undefined) setLikes(data.likes);
      })
      .catch(err => console.error('Failed to fetch likes:', err));
  }, [slug]);

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url
        });
      } catch (err) {
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = async () => {
    if (hasLiked) return;
    
    // Optimistic UI update
    setHasLiked(true);
    setLikes(prev => prev + 1);

    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      
      const data = await res.json();
      if (data.success) {
        setLikes(data.likes);
      } else {
        // Revert if failed
        setHasLiked(false);
        setLikes(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      setHasLiked(false);
      setLikes(prev => prev - 1);
    }
  };

  return (
    <div className="flex items-center gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
      <button 
        onClick={handleLike}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
            hasLiked 
            ? 'bg-red-50 dark:bg-red-900/20 text-red-500' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'
        }`}
      >
        <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current scale-110' : ''}`} />
        <span className="font-sans font-medium text-sm">{likes > 0 ? likes : 'Like'}</span>
      </button>

      <button 
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all duration-300"
      >
        {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
        <span className="font-sans font-medium text-sm">{copied ? 'Copied' : 'Share'}</span>
      </button>
    </div>
  );
}
