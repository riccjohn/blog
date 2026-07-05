# Image Lightbox — Implementation Plan

## Feature

Add click-to-enlarge lightbox to all images in blog posts. Clicking any image opens it in a centered modal overlay. Clicking outside, pressing Escape, or clicking the close button dismisses it.

## Scope

- All `<img>` tags inside `<article>` in blog posts (covers `<CaptionedImage>`, plain markdown images, direct `<Image>` components)
- Hero image excluded (already full-width, opt-out via `data-no-lightbox`)
- No external libraries — native `<dialog>` + vanilla JS

## Files to Change

### 1. `src/layouts/BlogPost.astro`

- Add shared `<dialog id="lightbox">` element to the end of `<body>` (before `</body>`)
- Add `<script>` tag with lightbox logic
- Add `cursor: zoom-in` CSS for `article img:not([data-no-lightbox])`
- Add `data-no-lightbox` attribute to the existing hero `<img>` element

### 2. No other files need to change

`CaptionedImage.astro` does not need modification — caption is read from the nearest `<figcaption>` at runtime.

## Dialog HTML Structure

```html
<dialog id="lightbox" aria-label="Image lightbox">
    <div class="lightbox-inner">
        <button id="lightbox-close" autofocus aria-label="Close">✕</button>
        <img id="lightbox-img" src="" alt="" />
        <p id="lightbox-caption"></p>
    </div>
</dialog>
```

**Critical:** `padding: 0` on `<dialog>` itself, padding on `.lightbox-inner`. Otherwise padding area falsely triggers close.

## JavaScript Logic

Use **event delegation** on `document` (not per-image listeners) — this is View-Transitions-safe if ever added later.

```javascript
const dialog = document.getElementById('lightbox')
const lightboxImg = document.getElementById('lightbox-img')
const lightboxCaption = document.getElementById('lightbox-caption')

document.addEventListener('click', (e) => {
    const img = e.target.closest('article img:not([data-no-lightbox])')
    if (!img) return
    lightboxImg.src = img.src
    lightboxImg.alt = img.alt
    const figcaption = img.closest('figure')?.querySelector('figcaption')
    lightboxCaption.textContent =
        figcaption?.textContent?.replace(/^\/\/\s*/, '') ?? ''
    lightboxCaption.hidden = !lightboxCaption.textContent
    document.body.style.overflow = 'hidden'
    dialog.showModal()
})

// Click outside to close (backdrop maps to dialog element)
dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close()
})

// Restore scroll on close
dialog.addEventListener('close', () => {
    document.body.style.overflow = ''
    lightboxImg.src = ''
})
```

## CSS (in `<style>` block or inline in BlogPost.astro)

Use existing CSS custom properties for theme consistency:

```css
article img:not([data-no-lightbox]) {
    cursor: zoom-in;
}

#lightbox {
    padding: 0;
    border: none;
    background: transparent;
    max-width: 100vw;
    max-height: 100vh;
}

#lightbox::backdrop {
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(4px);
}

.lightbox-inner {
    position: relative;
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-default);
    box-shadow: 0 8px 32px var(--color-shadow-default);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    max-width: 90vw;
    max-height: 90vh;
}

#lightbox-close {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: transparent;
    border: 1px solid var(--color-border-default);
    color: var(--color-text-primary);
    font-family: monospace;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    line-height: 1;
}

#lightbox-close:hover {
    border-color: var(--color-accent-primary);
    color: var(--color-accent-primary);
}

#lightbox-img {
    max-width: 85vw;
    max-height: 75vh;
    width: auto;
    height: auto;
    display: block;
    cursor: zoom-out;
}

#lightbox-caption {
    color: var(--color-text-secondary);
    font-family: monospace;
    font-size: 0.875rem;
    text-align: center;
    margin: 0;
}

#lightbox-caption::before {
    content: '// ';
}
```

## Aesthetic Notes

- Terminal aesthetic: monospace fonts, `//` caption prefix (matches existing `figcaption` style)
- No `rounded-lg` — square/sharp borders
- Accent color (`--color-accent-primary`) used on close button hover only
- Caption prefix `// ` matches existing `CaptionedImage` figcaption `::before` style

## After Implementation

Run visual verification per CLAUDE.md:

1. `pnpm dev` to start dev server
2. Playwright screenshots at 375px, 768px, 1280px
3. Save to `.playwright-mcp/screenshots/`
4. Check browser console for errors

## Notes from Research

- `dialog.showModal()` handles focus trap, Escape key, and focus return automatically
- No need for `aria-modal="true"` when using `showModal()` (redundant but harmless)
- The `// ` prefix on captions in existing `CaptionedImage` is added via CSS `::before` — strip it before displaying in lightbox caption (`.replace(/^\/\/\s*/, '')`)
- View Transitions not currently enabled — no lifecycle event handling needed. If added later, the delegation pattern already handles it without changes.
