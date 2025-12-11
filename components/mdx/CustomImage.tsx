'use client';

import Image from 'next/image';

interface CustomImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
}

export default function CustomImage({ src, alt, width, height, caption }: CustomImageProps) {
  // If no width/height provided, we can't use Next.js Image optimization effectively without layout shift 
  // unless we use 'fill', but that requires a container.
  // For MDX, standard <img> is often easier if dimensions aren't known, 
  // BUT Next.js Image is preferred. 
  // Let's fallback to standard <img> if relative path or no dims, or use a responsive wrapper.
  
  // Actually, standard `![alt](src)` in MDX usually passes `src` and `alt`.
  
  return (
    <figure className="my-8">
        <div className="relative w-full h-auto rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800">
            {/* We use standard img for flexibility with unknown dimensions in MDX content */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
                src={src} 
                alt={alt} 
                className="w-full h-auto object-cover"
                loading="lazy"
            />
        </div>
        {caption && (
            <figcaption className="text-center text-sm text-gray-500 font-serif mt-2 italic">
                {caption}
            </figcaption>
        )}
    </figure>
  );
}
