'use client';

import { useState, useEffect, Suspense } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [message, setMessage] = useState('');

  // Check auth on load
  useEffect(() => {
    const checkAuth = async () => {
      const savedPassword = localStorage.getItem('admin_password');
      if (savedPassword) {
        try {
          const res = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'x-admin-password': savedPassword }
          });
          if (res.ok) {
            setPassword(savedPassword);
            setIsAuthorized(true);
          }
        } catch (e) {
          console.error(e);
        }
      }
      setAuthChecking(false);
    };
    checkAuth();
  }, []);

  // Fetch post data once authorized (and if editing)
  useEffect(() => {
    if (editSlug && isAuthorized) {
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
          setMessage('Error loading post.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [editSlug, isAuthorized, password]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthChecking(true);
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'x-admin-password': password }
      });
      if (res.ok) {
        localStorage.setItem('admin_password', password);
        setIsAuthorized(true);
      } else {
        setMessage('Incorrect password');
      }
    } catch (error) {
      setMessage('Login failed');
    } finally {
      setAuthChecking(false);
    }
  };

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
        setMessage('Unauthorized: Session expired');
        setIsAuthorized(false);
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

  if (authChecking) {
    return <div className="flex h-screen items-center justify-center text-gray-400 font-sans text-sm animate-pulse">Verifying...</div>;
  }

  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fdfbf7]">
        <form onSubmit={handleLogin} className="flex flex-col items-center gap-4 w-full max-w-xs px-6">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
          <h1 className="font-sans font-bold text-gray-900 mb-2">Restricted Access</h1>
          <input
            type="password"
            placeholder="Enter admin password"
            className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-center font-sans text-sm outline-none focus:border-black transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-black text-white rounded px-4 py-2 font-sans text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Unlock Studio
          </button>
          {message && <p className="text-red-500 text-xs font-sans mt-2">{message}</p>}
        </form>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-gray-500 font-sans">Loading post content...</div>;
  }

  return (
    <div className="flex h-screen w-full bg-[#fdfbf7] overflow-hidden">
      {/* Editor Pane (Left) */}
      <div className="w-1/2 flex flex-col border-r border-gray-200 h-full">
        <header className="p-4 border-b border-gray-200 flex justify-between items-center bg-white/50 backdrop-blur">
          <h1 className="font-sans font-bold text-sm text-gray-500 uppercase tracking-widest">Studio {editSlug ? '(Editing)' : ''}</h1>
          <div className="flex items-center gap-2">
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
