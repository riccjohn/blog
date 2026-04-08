[![Netlify Status](https://api.netlify.com/api/v1/badges/9bbdb904-26ca-4ea9-b837-120553cd9f9c/deploy-status)](https://app.netlify.com/sites/arcanegrain/deploys)

# Arcane Grain

Personal blog and portfolio for John Riccardi, a web developer and consultant with a background in design and animation.

🌐 **Live Site**: [arcanegrain.dev](https://arcanegrain.dev)

## Tech Stack

- **Framework**: [Astro 5](https://astro.build) - Fast, content-focused static site generator
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) + custom CSS
- **Content**: Markdown/MDX with type-safe content collections
- **Deployment**: [Netlify](https://netlify.com) with continuous deployment
- **Package Manager**: pnpm

## Features

- 100/100 Lighthouse performance score
- SEO-friendly with canonical URLs and OpenGraph metadata
- RSS feed support
- Automatic sitemap generation
- Type-safe content with Zod schema validation
- Responsive design optimized for mobile and desktop
- Git hooks for automatic code formatting

## Local Development

```bash
# Install dependencies
pnpm install

# Start dev server at localhost:4321
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm astro check

# Format code
pnpm run prettier:write
```

## Project Structure

```
├── src/
│   ├── assets/          # Images and media for optimization (hero images, etc.)
│   ├── components/      # Reusable UI components
│   ├── content/         # Blog posts and content collections
│   ├── layouts/         # Page templates
│   ├── pages/           # File-based routing
│   └── styles/          # Global CSS
├── public/              # Static assets served as-is (fonts, downloads, favicons)
└── .claude.json         # Claude Code MCP server configuration
```

## Adding New Blog Posts

Create a new `.md` or `.mdx` file in `src/content/blog/` with the following frontmatter:

```yaml
---
title: 'Your Post Title'
description: 'SEO description for the post'
pubDate: '2024-01-01'
heroImage: '../../assets/images/hero.jpg' # Optional - relative path from content file
---
```

**Important**: Store images in `src/assets/images/` (not `public/`) so Astro can optimize them during build. Reference them using relative paths from your content file.

Files prefixed with `.` (e.g., `.draft-post.md`) are excluded from builds.

**Shortcut**: Use `pnpm new-post` to scaffold a draft with pre-filled frontmatter:

```bash
pnpm new-post "My Post Title"
# Creates: src/content/blog/.my-post-title.mdx
```

## Claude Code Configuration

This project includes a `.claude.json` file that configures the Playwright MCP server for automated browser testing when using [Claude Code](https://claude.ai/code). See `CLAUDE.md` for detailed guidance on working with this codebase.
