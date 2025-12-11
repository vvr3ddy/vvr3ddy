import { getPostBySlug, getAllPosts } from '@/lib/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { X, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';

// Force static generation for GitHub Pages
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const options = {
    mdxOptions: {
      remarkPlugins: [remarkMath, remarkGfm],
      rehypePlugins: [rehypeKatex],
    },
  };

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <article className="min-h-screen max-w-3xl mx-auto px-6 py-12 md:py-20 relative">
      <div className="flex justify-between items-start mb-10">
        <Link 
          href="/" 
          className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-900"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </Link>

        {isDev && (
          <Link
            href={`/write?slug=${slug}`}
            className="inline-flex items-center text-xs font-mono text-gray-400 hover:text-black hover:underline"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Edit Post
          </Link>
        )}
      </div>

      <header className="mb-12">
        <div className="flex items-center text-sm text-gray-500 font-sans mb-3">
          <time dateTime={post.frontmatter.date}>
            {format(new Date(post.frontmatter.date), 'MMMM d, yyyy')}
          </time>
          <span className="mx-2">·</span>
          <span className="capitalize">{post.frontmatter.tags?.join(', ') || 'Note'}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-sans text-gray-900 leading-tight">
          {post.frontmatter.title}
        </h1>
      </header>

      <div className="prose prose-lg prose-gray hover:prose-a:text-black">
        <MDXRemote source={post.content} options={options} />
      </div>

      <hr className="my-12 border-gray-200" />
      
      <div className="flex justify-between items-center">
        <p className="font-serif italic text-gray-500">
          Planting seeds for the future.
        </p>
      </div>
    </article>
  );
}
