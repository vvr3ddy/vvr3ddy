'use client';

import { Heart, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="fixed bottom-4 left-0 right-0 z-40 pointer-events-none flex justify-center">
      <div className="bg-white/50 dark:bg-black/50 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-gray-200/50 dark:border-gray-800/50 pointer-events-auto transition-all hover:scale-105 hover:bg-white dark:hover:bg-black hover:border-gray-300 dark:hover:border-gray-700">
        <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-sans text-gray-500 dark:text-gray-400">
          Made with
          <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
          by
          <span className="flex items-center gap-1 font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            GEMINI
          </span>
        </p>
      </div>
    </footer>
  );
}
