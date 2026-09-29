# Design & Visual Guidance

## Aesthetic

Terminal/developer aesthetic. Accent: cyan (#07f5bd) dark / teal (#00b894) light. Monospace typography. Never generic or AI-looking.

## Standards

- Examine existing components before creating anything new — match their exact patterns (borders, spacing, colors, radius, typography)
- WCAG 2.1 AA minimum (4.5:1 contrast for text)

## Avoid

- `rounded-lg` on everything
- Default Tailwind button styles
- Cookie-cutter shadows (`shadow-md/lg`)
- Simple color-swap hover effects

## Visual Verification (required for any UI change)

Use Playwright MCP after any UI change. Start dev server with `pnpm dev`, then:

1. Screenshot at 375px (mobile), 768px (tablet), 1280px (desktop)
2. Save to `.playwright-mcp/screenshots/`
3. Check browser console for errors
4. Verify nothing looks generic — if it does, redesign before finishing

## Retro theme

- Scoped exception to the terminal aesthetic: `html.retro` only, mutually exclusive with `html.dark`. Every rule is scoped under `html.retro` or the `retro:` variant.
- "Loud edges, calm reading surface": GIFs and marquee live only in header, nav and footer. Buddies float in the side gutters from 1200px up (never over the reading window) and sit in the footer below that. Post content sits in `RetroWindow` on paper `#fffff0`. Only wacky element allowed inside a window: the NEW! badge on `/blog`.
- Palette: paper `#fffff0`, ink `#1a1a1a`, headings `#000080` (Pixelify Sans), links `#0000ee` / visited `#551a8b`, meta `#595959`, code `#33ff33` on `#000`, inline code `#000080` on `#e0e0e0`, starfield `#000018`, title-bar gradient ends `#0a3d8f`.
- GIFs: flash-audit each one (frame delay × luminance change, ≤3 Hz). Upscale by integers only (2×, `image-rendering: pixelated`). Every GIF has a `.static.png` for reduced motion. Keep them in `public/retro/`, never `src/assets/` (sharp strips animation). Render with `RetroGif`.
- Light and dark must stay pixel-identical to the baselines. Retro elements take zero space and fetch nothing outside retro.
