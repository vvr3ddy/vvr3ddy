import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getLikesDB, saveLikesDB } from '../likes/route'; // Assuming these are exported now
import { getPostSlugs } from '@/lib/mdx'; // To validate slug

export async function DELETE(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, message: 'Deleting posts is only allowed in local development mode.' }, { status: 403 });
  }

  const password = request.headers.get('x-admin-password');
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, message: 'Unauthorized: Invalid password' }, { status: 401 });
  }

  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json({ success: false, message: 'Slug required.' }, { status: 400 });
    }

    // Validate slug (optional, but good practice)
    const existingSlugs = getPostSlugs().map(s => s.replace(/\.mdx?$/, ''));
    if (!existingSlugs.includes(slug)) {
        return NextResponse.json({ success: false, message: 'Post not found.' }, { status: 404 });
    }

    // 1. Delete MDX file
    const filePathMdx = path.join(process.cwd(), 'content', `${slug}.mdx`);
    const filePathMd = path.join(process.cwd(), 'content', `${slug}.md`); // Check for .md extension too

    if (fs.existsSync(filePathMdx)) {
        fs.unlinkSync(filePathMdx);
    } else if (fs.existsSync(filePathMd)) {
        fs.unlinkSync(filePathMd);
    } else {
        return NextResponse.json({ success: false, message: 'Post MDX/MD file not found.' }, { status: 404 });
    }

    // 2. Remove from likes.json
    const db = getLikesDB();
    if (db[slug]) {
      delete db[slug];
      saveLikesDB(db);
    }
    
    return NextResponse.json({ success: true, message: `Post '${slug}' deleted successfully.` });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete post.' }, { status: 500 });
  }
}
