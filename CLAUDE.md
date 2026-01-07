# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the project root using pnpm:

| Command                   | Purpose                              |
| ------------------------- | ------------------------------------ |
| `pnpm install`            | Install dependencies                 |
| `pnpm dev`                | Start dev server at `localhost:4321` |
| `pnpm build`              | Build production site to `./dist/`   |
| `pnpm preview`            | Preview production build locally     |
| `pnpm astro check`        | Run TypeScript and Astro validation  |
| `pnpm run prettier:write` | Auto-format code with Prettier       |
| `pnpm astro ...`          | Run Astro CLI commands               |

## Architecture Overview

This is an Astro 5.13.5 static site blog with:

- **Content Collections**: Blog posts in `src/content/blog/` with Zod schema validation in `src/content.config.ts`
- **File-based Routing**: Pages in `src/pages/` map to routes (e.g., `src/pages/blog/[...slug].astro` generates `/blog/{post-id}/`)
- **Layouts**: `src/layouts/Layout.astro` (default page wrapper), `src/layouts/BlogPost.astro` (blog-specific with hero image support)
- **Components**: Reusable UI in `src/components/`, including social icons in `src/components/Social/`
- **Styling**: Tailwind CSS 4 via `@tailwindcss/vite` plugin + custom global CSS in `src/styles/global.css`
- **Path Aliases**: `@/*` maps to `src/*` (use `import X from '@/components/X.astro'`)
- **Integrations**: MDX (`@astrojs/mdx`), Sitemap (`@astrojs/sitemap`), RSS feed (`@astrojs/rss`)

## Content Management

### Blog Post Schema

Required frontmatter fields in `src/content/blog/*.md` or `*.mdx`:

- `title: string` - Post title
- `description: string` - Meta description
- `pubDate: Date` - Publication date (coerced from string)

Optional fields:

- `updatedDate: Date` - Last update date
- `heroImage: string` - Featured image URL (rendered at 1020×510px)

### Adding New Posts

1. Create `src/content/blog/your-post-slug.md` with valid frontmatter
2. Posts prefixed with `.` (e.g., `.example-post.md`) are excluded from builds
3. Post ID becomes the URL slug: `/blog/your-post-slug/`
4. Use `getCollection('blog')` to query posts programmatically

## Important Patterns

- **Layout Props**: `Layout.astro` expects `{ title: string, description: string }`, `BlogPost.astro` expects `CollectionEntry<'blog'>`
- **Date Formatting**: Always use `src/components/FormattedDate.astro` component instead of custom formatting
- **Hero Images**: Size at 1020×510px in blog post layout
- **Social Components**: Follow existing pattern in `src/components/Social/*.astro` with `hoverable` prop and SVG icons
- **Global Constants**: Site metadata in `src/consts.ts` (SITE_TITLE, SITE_DESCRIPTION)

## PR and Quality Requirements

### PR Rules

- Keep PRs small and focused: one feature or bugfix per PR
- Use descriptive branch names: `feat/`, `fix/`, or `chore/` prefix
- Include test plan or manual verification steps in PR description
- For visual changes, include before/after screenshots

### Pre-PR Checklist

Before opening a PR, verify:

1. `pnpm run prettier:write` - Code is formatted
2. `pnpm astro check` - No TypeScript errors
3. `pnpm build` - Build succeeds
4. `pnpm dev` - Visual inspection of affected pages (desktop + mobile)

DO NOT consider a task complete if there are TypeScript errors, lint warnings, or formatting issues.

### Design Verification

Design is critical. Before merging:

- Visually inspect all affected pages on desktop and mobile
- Check typography, spacing, colors, alignment
- Verify links, buttons, images, and interactive elements
- Test layout changes on multiple pages that use modified layouts/components
- Include screenshots in PR description for visual changes

## Common Tasks

| Task                          | Location                                                                    |
| ----------------------------- | --------------------------------------------------------------------------- |
| Update site title/description | `src/consts.ts`                                                             |
| Modify header/footer          | `src/components/Header.astro`, `src/components/Footer.astro`                |
| Add social icon               | Create `src/components/Social/NewPlatform.astro` following existing pattern |
| Add new blog post             | Create `src/content/blog/post-slug.md` with schema-compliant frontmatter    |
| Update RSS feed               | Modify `src/pages/rss.xml.js`                                               |
| Change global styles          | Edit `src/styles/global.css`                                                |

## Key Files Reference

- **Content Schema**: `src/content.config.ts` (Zod validation for blog frontmatter)
- **Blog Layout**: `src/layouts/BlogPost.astro` (hero image, dates, typography)
- **Site Config**: `astro.config.mjs` (integrations, site URL, Vite plugins)
- **TypeScript Config**: `tsconfig.json` (strict mode, path aliases)
- **Global Constants**: `src/consts.ts` (site metadata)
