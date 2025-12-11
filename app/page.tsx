'use client';

import Link from 'next/link';
import { getAllPosts } from '@/lib/mdx';
import { format } from 'date-fns';
import Graph from '@/components/Graph';
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from 'react';

export default function Home() {
  const posts = getAllPosts();
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-12 md:py-20 relative z-10">
      <div className="absolute top-6 right-6">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        )}
      </div>

      <Graph />
      <header className="mb-16">
        <h1 className="font-sans text-3xl font-bold tracking-tight mb-2 dark:text-white">My Digital Garden</h1>
        <p className="text-gray-500 dark:text-gray-400 font-serif italic">A collection of evolving thoughts and notes.</p>
      </header>

      <div className="space-y-12">
        {posts.map((post) => (
          <article key={post.slug} className="group relative">
            <div className="absolute -left-4 top-0 h-full w-1 bg-gray-200 dark:bg-gray-700 opacity-0 transition-opacity group-hover:opacity-100" />
            
            <Link href={`/posts/${post.slug}`} className="block">
              <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
                <h2 className="text-xl font-bold font-sans text-gray-900 dark:text-gray-100 group-hover:underline decoration-gray-400 underline-offset-4 transition-all">
                  {post.frontmatter.title}
                </h2>
                <time className="text-sm text-gray-400 dark:text-gray-500 font-sans tabular-nums mt-1 md:mt-0">
                  {format(new Date(post.frontmatter.date), 'MMM d, yyyy')}
                </time>
              </div>
              
              {post.frontmatter.description && (
                <p className="text-gray-600 dark:text-gray-400 font-serif leading-relaxed">
                  {post.frontmatter.description}
                </p>
              )}
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}