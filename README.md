# Digital Garden & Journal

A minimalist, typography-focused space for your thoughts, built with Next.js and MDX.
Designed for readability and ease of use.

## The Concept

- **Seeds**: Your posts. They live in `content/`.
- **Topological**: Unlike a blog, posts can evolve. Use Wiki-links (coming soon) or standard links to connect them.
- **Paper Aesthetic**: Serif fonts for reading, Sans-serif for metadata.

## How to Plant a Seed (Write a Post)

1. Create a new file in `content/` ending in `.mdx`.
2. Add the frontmatter at the top:

```yaml
---
title: "The Title of Your Thought"
date: "2025-12-11"
description: "A brief summary for the index."
tags: ["philosophy", "design"]
---
```

3. Write your content using Markdown and $\LaTeX$.
   - Math: `$E=mc^2$`
   - Code: Standard markdown code blocks.

## Development

Run the local server to see your garden grow:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (GitHub Pages)

This project is configured for static export.

1. Push this code to a GitHub repository.
2. Go to **Settings > Pages**.
3. Source: **GitHub Actions**.
4. GitHub will automatically detect the Next.js project and suggest a workflow.
   - Or, simply run `npm run build` and deploy the `out/` folder manually.

## Customization

- **Styles**: Edit `app/globals.css`.
- **Fonts**: Edit `app/layout.tsx`.
- **Logic**: `lib/mdx.ts` handles the content fetching.