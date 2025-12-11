'use client';

import { useState, useEffect, Suspense } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStatus } from '@/hooks/useAuthStatus'; // Import useAuthStatus

function Editor() {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get('slug');
  const router = useRouter();

  const { isAuthenticated, isLoading, redirectToLogin, logout } = useAuthStatus(); // Use the auth hook, destructure logout

  const [content, setContent] = useState('# Hello World\n\nStart writing...');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [date, setDate] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState('');

  // Redirect if not authenticated and not loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirectToLogin();
    }
  }, [isAuthenticated, isLoading, redirectToLogin]);

  // Fetch post data once authenticated and if editing
  useEffect(() => {
    if (editSlug && isAuthenticated) {
      setIsPending(true); // Reusing isPending for loading state
      fetch('/api/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(res => {
            if (res.status === 401) { // Session expired or invalid
              redirectToLogin();
              throw new Error('Unauthorized');
            }
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
          if (err.message !== 'Unauthorized') setMessage('Error loading post.');
        })
        .finally(() => setIsPending(false));
    }
  }, [editSlug, isAuthenticated, redirectToLogin]);

  const handleLogout = async () => {
    setMessage(''); // Clear any messages before logging out
    await logout(); // Use the logout function from the hook
  };

  const handleSave = async () => {
    setIsPending(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        redirectToLogin();
        return;
      }

      const result = await response.json();
      if (result.success) {
        setMessage(result.message);
        router.push(`/write?slug=${slug}`); // Update URL (or navigate if slug changed)
      } else {
        setMessage(result.message || 'Failed to save post.');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred while saving.');
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async () => {
    if (!editSlug) return; // Can only delete existing posts

    if (!window.confirm(`Are you sure you want to delete the post "${title}"? This action cannot be undone.`)) {
      return;
    }

    setIsPending(true);
    setMessage('');

    try {
      const response = await fetch('/api/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug: editSlug }),
      });

      if (response.status === 401) {
        setMessage('Unauthorized: Session expired');
        redirectToLogin();
        return;
      }

      const result = await response.json();
      if (result.success) {
        setMessage(result.message);
        router.push('/'); // Redirect to home page
      } else {
        setMessage(result.message || 'Failed to delete post.');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred while deleting.');
    } finally {
      setIsPending(false);
    }
  };

  if (isLoading || !isAuthenticated) { // Show loading until auth status is known, then redirect if not auth
    return <div className="flex h-screen items-center justify-center text-gray-400 font-sans text-sm animate-pulse">Loading Editor...</div>;
  }

  // Render the Editor UI only if authenticated
  return (
    <div className="flex h-screen w-full bg-[#fdfbf7] dark:bg-[#0a0a0a] overflow-hidden transition-colors duration-500">
      {/* Editor Pane (Left) */}
      <div className="w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-800 h-full transition-colors">
        <header className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-black/50 backdrop-blur transition-colors">
          <h1 className="font-sans font-bold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest">Studio {editSlug ? '(Editing)' : ''}</h1>
          <div className="flex items-center gap-2">
            {editSlug && (
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-red-500 hover:text-red-700 text-xs font-sans font-medium px-3 py-2 transition-colors disabled:opacity-50"
              >
                Delete Post
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-600 text-xs font-sans font-medium px-3 py-2 transition-colors"
            >
              Logout
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded text-sm font-sans font-medium hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Saving...' : 'Save Post'}
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <input
            type="text"
            placeholder="Post Title"
            className="w-full bg-transparent text-3xl font-bold font-sans outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
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
              className="w-full bg-gray-50 dark:bg-gray-900 p-2 rounded text-sm font-mono outline-none border border-transparent focus:border-gray-200 dark:focus:border-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <input
              type="text"
              placeholder="comma, separated, tags"
              className="w-full bg-gray-50 dark:bg-gray-900 p-2 rounded text-sm font-sans outline-none border border-transparent focus:border-gray-200 dark:focus:border-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <textarea
            placeholder="Short description..."
            className="w-full bg-gray-50 dark:bg-gray-900 p-2 rounded text-sm font-serif resize-none outline-none border border-transparent focus:border-gray-200 dark:focus:border-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="h-px bg-gray-100 dark:bg-gray-800 my-4 transition-colors" />

          <TextareaAutosize
            minRows={10}
            placeholder="Write your thoughts here..."
            className="w-full bg-transparent font-mono text-sm leading-relaxed outline-none resize-none text-gray-800 dark:text-gray-200 transition-colors"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        
        {message && (
          <div className={`p-2 text-center text-xs font-sans ${message.includes('Saved') || message.includes('deleted') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}
      </div>

      {/* Preview Pane (Right) */}
      <div className="w-1/2 h-full overflow-y-auto bg-white dark:bg-black p-12 md:p-20 transition-colors">
        <article className="prose prose-lg prose-gray dark:prose-invert mx-auto transition-colors">
          <h1 className="font-sans mb-4">{title || 'Untitled'}</h1>
          <div className="text-sm text-gray-400 font-sans mb-8">
            {date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString()} · {tags || 'No tags'}
          </div>
          
          <ReactMarkdown 
            remarkPlugins={[remarkMath]} 
            rehypePlugins={[rehypeKatex]}
            components={{
              p: ({children}) => <p className="font-serif text-gray-800 dark:text-gray-200 leading-relaxed mb-6 transition-colors">{children}</p>,
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