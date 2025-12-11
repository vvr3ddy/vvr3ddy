import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content');

export type Post = {
  slug: string;
  frontmatter: {
    title: string;
    date: string;
    description?: string;
    tags?: string[];
    [key: string]: any;
  };
  content: string;
};

export function getPostSlugs() {
  return fs.readdirSync(contentDirectory).filter((file) => file.endsWith('.mdx') || file.endsWith('.md'));
}

export function getPostBySlug(slug: string): Post {
  const realSlug = slug.replace(/\.mdx?$/, '');
  const fullPath = path.join(contentDirectory, `${realSlug}.mdx`);
  
  // Fallback to .md if .mdx doesn't exist
  let fileContents;
  try {
    fileContents = fs.readFileSync(fullPath, 'utf8');
  } catch (e) {
    fileContents = fs.readFileSync(path.join(contentDirectory, `${realSlug}.md`), 'utf8');
  }

  const { data, content } = matter(fileContents);

  return {
    slug: realSlug,
    frontmatter: {
      title: data.title,
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      ...data,
    },
    content,
  };
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .sort((post1, post2) => (post1.frontmatter.date > post2.frontmatter.date ? -1 : 1));
  return posts;
}
