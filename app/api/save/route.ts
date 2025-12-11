import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server'; // Import NextRequest
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { verifyAuth } from '@/lib/auth'; // Import verifyAuth

export async function POST(request: NextRequest) { // Changed Request to NextRequest
  const authResponse = await verifyAuth(request);
  if (authResponse) {
    return authResponse; // Authentication failed
  }

  // Existing NODE_ENV check (can be removed if auth middleware handles dev-only, but keeping for now)
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, message: 'Editing is only allowed in local development mode.' }, { status: 403 });
  }

  try {
    const { title, slug, description, tags, content, date } = await request.json();

    if (!title || !slug || !content) {
      return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
    }

    // Sanitize slug
    const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    // Parse tags if it's a string, otherwise use as is
    const tagList = typeof tags === 'string' 
      ? tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : tags;

    const frontmatterObj = {
      title,
      date: date || new Date().toISOString(),
      description,
      tags: tagList
    };

    const frontmatter = yaml.dump(frontmatterObj);
    const fileContent = `---
${frontmatter}---

${content}`;

    const filePath = path.join(process.cwd(), 'content', `${safeSlug}.mdx`);

    fs.writeFileSync(filePath, fileContent, 'utf8');
    
    return NextResponse.json({ success: true, message: `Saved to content/${safeSlug}.mdx` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Failed to write file.' }, { status: 500 });
  }
}
