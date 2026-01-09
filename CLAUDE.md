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

## Claude Code Setup

This project is configured for use with [Claude Code](https://claude.ai/code). Configuration is stored in `.claude.json` at the project root.

### MCP Servers

MCP (Model Context Protocol) servers extend Claude Code's capabilities. This project uses:

| Server       | Purpose                               |
| ------------ | ------------------------------------- |
| `playwright` | Browser automation for visual testing |

MCP servers defined in `.claude.json` load automatically when Claude Code starts in this directory.

### First-Time Setup

After cloning the repository:

1. Install project dependencies: `pnpm install`
2. Install Playwright browsers: `npx playwright install`

### Configuration Files

- **`.claude.json`** - Project-level Claude Code config (MCP servers, hooks). Committed to repo.
- **`~/.claude.json`** - User-level config for personal settings across all projects. Not committed.

### Hooks

This project uses Claude Code hooks to auto-format code:

- **Edit/Write hooks**: Run `pnpm run prettier:write` after file modifications

## Architecture Overview

This is an Astro 5.13.5 static site blog with:

- **Content Collections**: Blog posts in `src/content/blog/` with Zod schema validation in `src/content.config.ts`
- **File-based Routing**: Pages in `src/pages/` map to routes (e.g., `src/pages/blog/[...slug].astro` generates `/blog/{post-id}/`)
- **Layouts**: `src/layouts/Layout.astro` (default page wrapper), `src/layouts/BlogPost.astro` (blog-specific with hero image support)
- **Components**: Reusable UI in `src/components/`, including social icons in `src/components/Social/`
- **Assets**: Images stored in `src/assets/` are automatically optimized during build (WebP conversion, responsive sizing)
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
- `heroImage: ImageMetadata` - Featured image (rendered at 1020×510px, automatically optimized)

### Adding New Posts

1. Create `src/content/blog/your-post-slug.md` with valid frontmatter
2. Store images in `src/assets/images/` (NOT `public/`) to enable automatic optimization
3. Reference images using relative paths: `heroImage: '../../assets/images/hero.jpg'`
4. Posts prefixed with `.` (e.g., `.example-post.md`) are excluded from builds
5. Post ID becomes the URL slug: `/blog/your-post-slug/`
6. Use `getCollection('blog')` to query posts programmatically

**Image Handling**: Images in `src/assets/` are processed by Astro's image pipeline, which:

- Converts to WebP format for smaller file sizes
- Generates responsive image variants
- Returns an `ImageMetadata` object with `src`, `width`, `height`, and `format` properties
- Images in `public/` bypass this optimization and are served as-is

## Design Philosophy

**Critical**: This project has a distinctive terminal/developer-focused aesthetic. All design work must maintain this identity and avoid generic, AI-generated looks.

### Design Direction

- **Style**: Terminal-inspired with monospace typography
- **Accent Color**: Bright cyan (#07f5bd) for dark mode, teal (#00b894) for light mode
- **Aesthetic**: Clean, professional, developer-friendly
- **Theme Support**: Full dark/light mode with smooth transitions

**Reference**: `.claude/context/design-system.md` contains comprehensive design specifications

### Design Quality Standards

**NEVER create generic-looking components that could have been AI-generated. Every component must feel custom and intentional.**

#### What to AVOID:

- Generic rounded corners everywhere (rounded-lg on everything)
- Default Tailwind button styles (blue bg, white text)
- Cookie-cutter card shadows (shadow-md/lg)
- Predictable hover effects (simple color changes)
- Template-like layouts that lack personality

#### What to CREATE:

- **Distinctive visual identity**: Follow the established terminal aesthetic
- **Consistent design language**: Match existing component patterns exactly
- **Thoughtful details**: Custom animations, intentional transitions
- **Original interaction patterns**: Hovers and states that feel polished
- **Design consistency**: If one component uses `border border-border-default`, all borders should follow this pattern

### Design Consistency Protocol

**For ANY new component:**

1. **First, examine existing components** in the codebase
2. **Extract established patterns**: border radius, shadows, spacing, colors, typography
3. **Match those patterns exactly**: Use the same Tailwind classes and values
4. **Reference design-system.md**: Check color palette, spacing scale, and component patterns
5. **Maintain accessibility**: WCAG 2.1 AA minimum (4.5:1 contrast for text)

### Self-Review Checklist for Design Work

Before considering design work complete, verify:

- [ ] Does this look like a generic template? (If yes, redesign immediately)
- [ ] Is it perfectly consistent with other components in the project?
- [ ] Does it match the terminal/developer aesthetic defined in design-system.md?
- [ ] Are all interactions smooth, intentional, and polished?
- [ ] Would a user recognize this as custom-designed (not AI-generated)?
- [ ] Is the component responsive and accessible (WCAG 2.1 AA)?
- [ ] Have I used the exact same design patterns as existing components?

## Important Patterns

- **Layout Props**: `Layout.astro` expects `{ title: string, description: string }`, `BlogPost.astro` expects `CollectionEntry<'blog'>`
- **Date Formatting**: Always use `src/components/FormattedDate.astro` component instead of custom formatting
- **Hero Images**: Size at 1020×510px in blog post layout
- **Social Components**: Follow existing pattern in `src/components/Social/*.astro` with `hoverable` prop and SVG icons
- **Global Constants**: Site metadata in `src/consts.ts` (SITE_TITLE, SITE_DESCRIPTION)
- **Design System**: Always reference `.claude/context/design-system.md` before implementing any UI changes

## Code Style & Quality

- Prefer using arrow functions over the 'function' keyword
- Never use the 'any' type unless absolutely necessary (extremely rare)
- Never use '!' in CSS/Tailwind

## Testing & Visual Verification

This project has the **Playwright MCP server** configured in `.claude.json`, which provides browser automation capabilities for testing and visual verification.

**Note for Claude Code users**: The MCP server is automatically available when working in this repository. No additional setup needed.

### When to Use Playwright

**Use Playwright proactively for ALL visual/design changes:**

- After modifying layouts, components, or styles
- When adding new UI components or pages
- When updating colors, spacing, typography, or borders
- Before completing any design-related task
- To verify responsive behavior across devices

### Playwright Workflow

1. **Start dev server**: `pnpm dev`
2. **Navigate to page**: Use `browser_navigate` to open `localhost:4321` or specific routes
3. **Capture screenshots at multiple viewports**:
    - Mobile: 375px width
    - Tablet: 768px width
    - Desktop: 1280px width
4. **Store screenshots**: Save all screenshots to `.playwright-mcp/` directory (gitignored)
5. **Verify accessibility**: Use `browser_snapshot` to check accessibility tree structure
6. **Wait for content**: Use `browser_wait` if pages need time to load or render
7. **Check console**: Verify no errors or warnings in browser console

### Playwright Tools Available

- `browser_navigate` - Navigate to specific URLs
- `browser_screenshot` - Capture page screenshots
- `browser_snapshot` - Get accessibility tree data
- `browser_wait` - Wait for page loads or specific timeouts

**Important**: Always store screenshots in `.playwright-mcp/` to keep them out of version control.

### Visual Verification is Required

Before marking any design work as complete:

1. **Take screenshots** at mobile, tablet, and desktop sizes
2. **Compare** against existing components for consistency
3. **Verify** the design matches the terminal aesthetic
4. **Check** that nothing looks generic or AI-generated
5. **Test** all interactive states (hover, focus, active)

This ensures design quality without manual browser testing for every change.

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
4. **Visual verification** (for any UI changes):
    - Use Playwright MCP to capture screenshots at mobile, tablet, desktop sizes
    - Verify design consistency with existing components
    - Confirm nothing looks generic or AI-generated
    - Check all interactive states (hover, focus, active)
    - Verify WCAG 2.1 AA accessibility standards
5. **Design consistency** (for any UI changes):
    - Components match established terminal aesthetic
    - Uses exact same design patterns as existing components
    - References design-system.md for colors, spacing, typography
    - Self-review checklist completed

DO NOT consider a task complete if:

- There are TypeScript errors, lint warnings, or formatting issues
- Design work hasn't been visually verified with Playwright
- Components look generic or could have been AI-generated
- Design patterns don't match existing components

### Design Verification

Design quality is critical. Before merging:

- **Use Playwright MCP** to automate visual verification (required for all design changes)
    - Capture screenshots at mobile (375px), tablet (768px), and desktop (1280px) viewports
    - Store screenshots in `.playwright-mcp/` directory
    - Test interactive elements programmatically
    - Check browser console for errors
- **Verify design consistency**:
    - Components match the terminal/developer aesthetic
    - Nothing looks generic or AI-generated
    - Uses exact same patterns as existing components (borders, spacing, colors, typography)
    - All design decisions are intentional and polished
- Include screenshots in PR description for visual changes

## Common Tasks

| Task                          | Location                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------- |
| Update site title/description | `src/consts.ts`                                                              |
| Modify header/footer          | `src/components/Header.astro`, `src/components/Footer.astro`                 |
| Add social icon               | Create `src/components/Social/NewPlatform.astro` following existing pattern  |
| Add new blog post             | Create `src/content/blog/post-slug.md` with schema-compliant frontmatter     |
| Add blog post images          | Store in `src/assets/images/`, reference with `../../assets/images/file.jpg` |
| Update RSS feed               | Modify `src/pages/rss.xml.js`                                                |
| Change global styles          | Edit `src/styles/global.css`                                                 |

## Key Files Reference

- **Content Schema**: `src/content.config.ts` (Zod validation for blog frontmatter)
- **Blog Layout**: `src/layouts/BlogPost.astro` (hero image, dates, typography)
- **Site Config**: `astro.config.mjs` (integrations, site URL, Vite plugins)
- **TypeScript Config**: `tsconfig.json` (strict mode, path aliases)
- **Global Constants**: `src/consts.ts` (site metadata)
