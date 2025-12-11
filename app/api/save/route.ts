import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, message: 'Editing is only allowed in local development mode.' }, { status: 403 });
  }

  const password = request.headers.get('x-admin-password');
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, message: 'Unauthorized: Invalid password' }, { status: 401 });
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
