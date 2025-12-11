import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server'; // Import NextRequest
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { verifyAuth } from '@/lib/auth'; // Import verifyAuth

export async function POST(request: NextRequest) { // Changed Request to NextRequest
  const authResponse = await verifyAuth(request);
  if (authResponse) {
    return authResponse; // Authentication failed
  }
  
  // Existing NODE_ENV check (can be removed if auth middleware handles dev-only, but keeping for now)
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, message: 'Editing allowed in dev only' }, { status: 403 });
  }

  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json({ success: false, message: 'Slug required' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'content', `${slug}.mdx`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    return NextResponse.json({
      success: true,
      post: {
        slug,
        title: data.title,
        date: data.date,
        description: data.description,
        tags: data.tags,
        content
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Failed to read post' }, { status: 500 });
  }
}
