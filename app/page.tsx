import { getAllPosts } from '@/lib/mdx';
import Graph from '@/components/Graph';

export default function Home() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen relative overflow-hidden">
      <Graph posts={posts} />
      
      {/* Optional: Add a small floating header or instruction if needed, 
          but User asked for the graph to BE the UI. */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h1 className="font-sans text-xl font-bold tracking-tight mb-1 dark:text-white opacity-80">My Digital Garden</h1>
        <p className="text-gray-500 dark:text-gray-400 font-serif italic text-xs">Explore the web of thoughts.</p>
      </div>
    </main>
  );
}