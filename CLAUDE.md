# CLAUDE.md

## Non-Obvious Conventions

- **Date formatting**: Always use `src/components/FormattedDate.astro` — never custom formatting
- **Hero images**: 16:9, shown in a 1020×574 `object-cover` frame (`BlogPost.astro`). Export at 2× (2040×1148 or similar) so it stays sharp; any other ratio leaves a gap or crops
- **Draft posts**: Prefix filename with `.` (e.g., `.draft-post.md`) to exclude from builds
- **Images**: `src/assets/` gets WebP optimization + responsive variants; `public/` is served as-is
- **Social components**: Follow `src/components/Social/` pattern with `hoverable` prop and SVG icons

## Code Style

- Arrow functions over `function` keyword
- No `any` type
- No `!` in CSS/Tailwind

## Quality Gates

Before completing any task: no TypeScript errors (`pnpm astro check`), no formatting issues (`pnpm run prettier:write`).

- `pnpm test` (Vitest unit tests)
- `pnpm test:e2e` (Playwright, headless Chromium)

e2e uses port 4329 with a fresh build; visual baselines live in `tests/e2e/visual-baseline.spec.ts-snapshots/`.
