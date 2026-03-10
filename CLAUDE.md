# CLAUDE.md

## Non-Obvious Conventions

- **Date formatting**: Always use `src/components/FormattedDate.astro` — never custom formatting
- **Hero images**: Must be 1020×510px
- **Draft posts**: Prefix filename with `.` (e.g., `.draft-post.md`) to exclude from builds
- **Images**: `src/assets/` gets WebP optimization + responsive variants; `public/` is served as-is
- **Social components**: Follow `src/components/Social/` pattern with `hoverable` prop and SVG icons

## Code Style

- Arrow functions over `function` keyword
- No `any` type
- No `!` in CSS/Tailwind

## Quality Gates

Before completing any task: no TypeScript errors (`pnpm astro check`), no formatting issues (`pnpm run prettier:write`).
