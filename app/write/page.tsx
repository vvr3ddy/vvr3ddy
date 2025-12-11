'use client';

import { useState, useEffect, Suspense } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useSearchParams } from 'next/navigation';

function Editor() {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get('slug');

  const [content, setContent] = useState('# Hello World\n\nStart writing...');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [date, setDate] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(!!editSlug);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Attempt to load password from localStorage on mount
    const savedPassword = localStorage.getItem('admin_password');
    if (savedPassword) setPassword(savedPassword);
  }, []);

  useEffect(() => {
    if (password) {
      localStorage.setItem('admin_password', password);
    }
  }, [password]);

  useEffect(() => {
    if (editSlug && password) { // Only fetch if we have a password (or let it fail and show auth error? Better to wait/retry)
      setIsLoading(true);
      fetch('/api/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({ slug: editSlug }),
      })
        .then(res => {
            if (res.status === 401) throw new Error('Unauthorized');
            return res.json();
        })
        .then(data => {
          if (data.success && data.post) {
            setTitle(data.post.title);
            setSlug(data.post.slug);
            setDescription(data.post.description);
            setTags(Array.isArray(data.post.tags) ? data.post.tags.join(', ') : data.post.tags);
            setContent(data.post.content);
            setDate(data.post.date);
          } else {
            setMessage('Failed to load post.');
          }
        })
        .catch(err => {
          console.error(err);
          setMessage(err.message === 'Unauthorized' ? 'Invalid Password' : 'Error loading post.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [editSlug, password]); // Retry when password changes

  const handleSave = async () => {
    setIsPending(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({
          title,
          slug,
          description,
          tags,
          content,
          date // Send back the original date (or empty to create new)
        }),
      });

      if (response.status === 401) {
        setMessage('Unauthorized: Check password');
        setIsPending(false);
        return;
      }

      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      console.error(error);
      setMessage('An error occurred while saving.');
    } finally {
      setIsPending(false);
    }
  };

  if (isLoading && !password) {
     // If loading but no password yet (and using effect), just show editor? 
     // actually with the effect dependency, it won't fetch until password is set. 
     // So we just show the normal UI and the user types the password.
  }

  return (
    <div className="flex h-screen w-full bg-[#fdfbf7] overflow-hidden">
      {/* Editor Pane (Left) */}
      <div className="w-1/2 flex flex-col border-r border-gray-200 h-full">
        <header className="p-4 border-b border-gray-200 flex justify-between items-center bg-white/50 backdrop-blur">
          <h1 className="font-sans font-bold text-sm text-gray-500 uppercase tracking-widest">Studio {editSlug ? '(Editing)' : ''}</h1>
          <div className="flex items-center gap-2">
            <input 
              type="password" 
              placeholder="Admin Password"
              className="bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200 focus:outline-none focus:border-black transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={handleSave}
              disabled={isPending}
              className="bg-black text-white px-4 py-2 rounded text-sm font-sans font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Saving...' : 'Save Post'}
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <input
            type="text"
            placeholder="Post Title"
            className="w-full bg-transparent text-3xl font-bold font-sans outline-none placeholder:text-gray-300"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              // Only auto-generate slug if not editing or if slug is empty
              if (!editSlug && !slug) {
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
              }
            }}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="slug-of-post"
              className="w-full bg-gray-50 p-2 rounded text-sm font-mono outline-none border border-transparent focus:border-gray-200"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <input
              type="text"
              placeholder="comma, separated, tags"
              className="w-full bg-gray-50 p-2 rounded text-sm font-sans outline-none border border-transparent focus:border-gray-200"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <textarea
            placeholder="Short description..."
            className="w-full bg-gray-50 p-2 rounded text-sm font-serif resize-none outline-none border border-transparent focus:border-gray-200"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="h-px bg-gray-100 my-4" />

          <TextareaAutosize
            minRows={10}
            placeholder="Write your thoughts here..."
            className="w-full bg-transparent font-mono text-sm leading-relaxed outline-none resize-none text-gray-800"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        
        {message && (
          <div className={`p-2 text-center text-xs font-sans ${message.includes('Saved') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}
      </div>

      {/* Preview Pane (Right) */}
      <div className="w-1/2 h-full overflow-y-auto bg-white p-12 md:p-20">
        <article className="prose prose-lg prose-gray mx-auto">
          <h1 className="font-sans mb-4">{title || 'Untitled'}</h1>
          <div className="text-sm text-gray-400 font-sans mb-8">
            {date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString()} · {tags || 'No tags'}
          </div>
          
          <ReactMarkdown 
            remarkPlugins={[remarkMath]} 
            rehypePlugins={[rehypeKatex]}
            components={{
              p: ({children}) => <p className="font-serif text-gray-800 leading-relaxed mb-6">{children}</p>,
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}

export default function Studio() {
  return (
    <Suspense fallback={<div>Loading Editor...</div>}>
      <Editor />
    </Suspense>
  );
}