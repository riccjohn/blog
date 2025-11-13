<!--
Guidance for AI coding agents working on this repository.
Keep this short, concrete, and tightly coupled to the codebase.
-->

# Copilot / AI agent notes — Arcane Grain (Astro blog)

This repo is an Astro (v5) static blog scaffold with content collections, MDX support, and a small component/layout structure. Use the notes below to move quickly and make correct, low-risk changes.

1. Big picture

    - Astro site (see `astro.config.mjs`) with integrations: `@astrojs/mdx`, `@astrojs/sitemap`.
    - Content lives in `src/content/` (collections configured in `src/content.config.ts`). The primary blog collection is `src/content/blog/` and accepts `.md`/`.mdx` files.
    - Reusable UI is in `src/components/`; top-level layouts are in `src/layouts/` (e.g. `Layout.astro` and `BlogPost.astro`). Pages live in `src/pages/`.

2. Key developer workflows (run from project root)

    - Install: `pnpm install` (this repo uses `pnpm`; packageManager indicates `pnpm@10.10.0`).
    - Dev: `pnpm dev` — starts Astro dev server on `localhost:4321`.
    - Build: `pnpm build` — produces `./dist/`.
    - Preview: `pnpm preview` — preview the built site.
    - Formatting: `pnpm run prettier:write` (Prettier + Astro + Tailwind plugins installed).

3. Content & frontmatter conventions (important to validate)

    - Schema is declared in `src/content.config.ts` using `astro:content` + `zod`:
        - Required: `title: string`, `description: string`, `pubDate: Date` (coerced from string).
        - Optional: `updatedDate: Date`, `heroImage: string`.
    - Add new posts as `.md` or `.mdx` files under `src/content/blog/`. Ensure frontmatter satisfies the schema or the site will type-check fail.

4. Code patterns to follow

    - Path alias: `@/*` maps to `src/*` (see `tsconfig.json`). Use `@/components/...`, `@/layouts/...`, `@/consts` for imports.
    - Layouts expect explicit props (e.g. `Layout.astro` expects `{ title, description }`). `BlogPost.astro` consumes a `CollectionEntry<'blog'>` data shape.
    - Dates are displayed using `src/components/FormattedDate.astro` — reuse it instead of custom date formatting.
    - Hero images in `BlogPost.astro` are rendered with width 1020×510; follow that sizing when adding images.

5. Integrations & external dependencies to be cautious about

    - Tailwind is configured via Vite plugin (`@tailwindcss/vite`) in `astro.config.mjs` — don't replace with a different Tailwind integration without adjusting `vite` config.
    - RSS and sitemap support exist (`@astrojs/rss` and `@astrojs/sitemap`). If you add routes impacting feed/sitemap, update their generators (`src/pages/rss.xml.js` and `astro.config.mjs`).

6. Where to make common changes (examples)

    - Site title/description: `src/consts.ts`.
    - Header/footer links: `src/components/Header.astro` and `src/components/Footer.astro`.
    - Social icons: `src/components/Social/*.astro` (e.g. `Bluesky.astro`) — follow existing SVG + `hoverable` pattern.
    - New blog post: add `src/content/blog/YYYY-mm-dd-slug.md` with frontmatter matching `src/content.config.ts`.

7. Safety and low-risk edit guidance
    - Small content/layout changes are safe to PR directly. For changes that touch `astro.config.mjs`, content schema, or the build pipeline, include a short local smoke test (run `pnpm dev` and check the page) and mention required config changes in the PR.
    - Keep TypeScript strictness in mind: project extends `astro/tsconfigs/strict`. Fix any frontmatter or import type errors rather than silencing TS.

PR rules (must follow)

- Keep PRs small and focused: one feature or bugfix per PR.
- Use a descriptive branch name: prefix with `feat/`, `fix/`, or `chore/` (example: `feat/blog-add-slug`).
- Include unit tests for new logic where applicable. If the change is UI-only or a content update, include a short manual test plan in the PR description.
- In the PR description include: summary of changes, list of files changed, and any manual verification steps (e.g. pages to check locally).

Linter & TypeScript requirements

- Do NOT consider a task finished if there are TypeScript errors, lint warnings, or formatting problems.
- Before opening a PR run these checks locally (from project root):
    - `pnpm install` (first time)
    - `pnpm run prettier:write` (auto-format)
    - `pnpm astro check` (type & site checks)
    - `pnpm build` (catch build-time errors)
- Fix any reported issues rather than silencing them. If a false-positive is encountered, note it in the PR with rationale and a short repro.

Design & visual regression prevention

- **Design is critical.** Do NOT merge changes that cause unintended visual regressions, unwanted layout shifts, or breaks in responsive design.
- Before opening a PR run `pnpm dev` and visually inspect all affected pages on desktop and mobile (if applicable):
    - Check typography, spacing, colors, and alignment look correct.
    - Verify links, buttons, hero images, and interactive elements render properly.
    - If changing layout (`src/layouts/`), test on multiple pages that use that layout.
    - If updating components, test pages that consume them.
- In the PR description, include: before/after screenshots or a link to a staging preview if visual changes are made.
- Tailwind class changes, layout modifications, and CSS tweaks require explicit visual verification—never assume they won't affect rendering.

8. Examples to reference when editing
    - Content schema: `src/content.config.ts` (zod schema + loader base `./src/content/blog`).
    - Blog layout and hero: `src/layouts/BlogPost.astro` (how dates, heroImage, and slots are used).
    - Global constants: `src/consts.ts`.

If anything above is unclear or you'd like more examples (e.g. a sample blog post frontmatter or a short walkthrough to add a new social icon), say so and I will extend this file with concrete snippets or tests.
