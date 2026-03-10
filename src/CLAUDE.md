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
