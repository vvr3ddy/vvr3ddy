'use client';

import Link from 'next/link';
import { Edit2 } from 'lucide-react';
import { useAuthStatus } from '@/hooks/useAuthStatus';

export default function PostAdminActions({ slug }: { slug: string }) {
  const { isAuthenticated, isLoading } = useAuthStatus();

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return null; // Not authenticated, don't show anything
  }

  return (
    <Link
      href={`/write?slug=${slug}`}
      className="inline-flex items-center text-xs font-mono text-gray-400 hover:text-black dark:hover:text-white hover:underline"
    >
      <Edit2 className="w-3 h-3 mr-1" />
      Edit Post
    </Link>
  );
}
