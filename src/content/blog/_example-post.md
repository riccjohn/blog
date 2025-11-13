---
title: 'Example Blog Post'
description: 'This is an example post showing required and optional frontmatter fields. See src/content.config.ts for the schema.'
pubDate: '2025-01-15'
updatedDate: '2025-01-16'
heroImage: '/blog-placeholder-1.jpg'
---

# Writing Blog Posts

This is an example of a blog post for the Arcane Grain blog. Use this as a template when creating new posts.

## Frontmatter Requirements

All posts **must** include:

- `title` (string): The post title
- `description` (string): A short description for SEO and feed
- `pubDate` (string, coerced to Date): Publication date in YYYY-MM-DD format

Optional fields:

- `updatedDate` (string, coerced to Date): Last update date if different from `pubDate`
- `heroImage` (string): Path to a cover image (sized 1020×510 in `BlogPost.astro`)

## File Naming

Place new posts in `src/content/blog/` with the pattern:

```
YYYY-mm-dd-slug.md
```

Example: `2025-01-15-example-post.md`

## Content Format

Write content in Markdown or MDX. The file will be automatically rendered using `src/layouts/BlogPost.astro`.

- Dates are formatted via `src/components/FormattedDate.astro`
- Images are responsive and sized appropriately
- All imports should use the `@/*` path alias (e.g., `@/components/MyComponent.astro`)

---

**Note:** This is a template file. Delete or rename it before publishing.
