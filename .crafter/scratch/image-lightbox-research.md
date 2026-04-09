# Research: Site-Wide Image Lightbox

## Feature Summary

Add click-to-enlarge lightbox behavior to all images in blog posts — `<CaptionedImage>` components, plain markdown `img` tags, and the hero image — using native `<dialog>`, vanilla JS, no libraries.

---

## Codebase Findings

### Rendering Pipeline

- `src/pages/blog/[...slug].astro` → fetches post, calls `render(post)`, passes `<Content />` to `BlogPost.astro`
- `src/layouts/BlogPost.astro` — full HTML document, renders hero image + `<slot />` for post content inside `<article>`
- **Injection point:** `BlogPost.astro` body (after `<Footer />`) for the shared `<dialog>` and script

### Image Sources in Posts

1. `<CaptionedImage>` — renders as `<figure><img ...><figcaption>` — covered by `article img` selector
2. Plain markdown images — render as bare `<img>` in `<article>` — covered by `article img` selector
3. Direct `<Image>` from `astro:assets` — renders as `<img>` — covered by `article img` selector
4. Hero image — in `BlogPost.astro` layout, outside `<article>` — needs separate handling or opt-out

### Existing Patterns

- Scripts: `<script>` tags in components (hydrated module scripts), `is:inline` only for FOUC-critical code
- No `src/scripts/` directory; scripts live in their components
- No View Transitions enabled (safe to use standard DOM APIs)
- Images scoped to `<article>` element in BlogPost layout

### Theming / CSS Variables

- `--color-bg-primary`: `#ffffff` / `#0d1117` (dark)
- `--color-accent-primary`: `#00b894` / `#07f5bd` (dark) ← cyan accent
- `--color-border-default`: `#d0d7de` / `#30363d`
- `--color-shadow-default`: `rgba(31,35,40,0.12)` / `rgba(1,4,9,0.8)`
- `--color-text-secondary`: for captions
- Existing hero shadow: `shadow-[0_4px_12px_var(--color-shadow-default)]`

---

## Web Research Findings

### Approach: Global DOM query vs MDX component override

**Confidence: High**

`document.querySelectorAll('article img')` is the right approach. It catches all image types uniformly without modifying individual MDX files. The MDX `components` prop override only handles markdown-rendered images, misses `<CaptionedImage>` internals, and requires per-post changes.

### Shared dialog vs per-image dialogs

**Confidence: High**

One shared `<dialog>` is the clear winner:

- Smaller DOM (1 element vs N)
- Accessibility: single managed focus/aria state
- W3C APG and eBay MIND Patterns both recommend single-instance pattern

Pattern: store references to `dialog`, inner `img`, and `figcaption`. On click, update `img.src`, `img.alt`, caption text, then call `dialog.showModal()`.

### Native `<dialog>` best practices

**Confidence: High**

- Use `dialog.showModal()` — puts element in top layer, creates `::backdrop`, traps focus, handles Escape natively
- **Close button first** in DOM order (before the image), or use `autofocus` on close button
- Click-outside: `e.target === dialog` — works because backdrop maps to dialog element. **Critical:** put `padding: 0` on `<dialog>`, padding on inner wrapper `<div>`. Otherwise padding area triggers false closes.
- Background scroll: `showModal()` does NOT lock scroll — must manually set `document.body.style.overflow = 'hidden'` on open, restore on close
- Return focus: `dialog.close()` automatically returns focus to the element that triggered `showModal()` — no manual management needed
- `dialog::backdrop` for overlay; `backdrop-filter: blur(4px)` optional

```css
dialog::backdrop {
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(4px);
}
```

### Event delegation (future-proof)

**Confidence: High**

Using event delegation on `document` rather than per-image listeners is more robust and View-Transitions-safe (if ever added):

```javascript
document.addEventListener('click', (e) => {
    const img = e.target.closest('article img')
    if (img) openLightbox(img.src, img.alt)
})
```

This avoids the re-attachment problem if View Transitions are added later.

### View Transitions (currently moot, worth noting)

**Confidence: High**

No View Transitions in this project. If added later: bundled module scripts run once and don't re-run after soft navigation. The event delegation pattern above is immune to this. If per-image listeners are used instead, wrap init in `astro:after-swap` + direct call.

---

## Recommended Architecture

### Files to modify/create

1. **`src/layouts/BlogPost.astro`** — add `<dialog>` element + `<script>` for lightbox
2. **`src/components/CaptionedImage.astro`** — add `data-lightbox-caption` attribute on `<figcaption>` text so the lightbox can pick up the caption

### Implementation sketch

**HTML (in BlogPost.astro body):**

```html
<dialog id="lightbox" aria-label="Image lightbox">
    <div class="lightbox-inner">
        <button id="lightbox-close" autofocus aria-label="Close lightbox">
            ✕
        </button>
        <img id="lightbox-img" src="" alt="" />
        <p id="lightbox-caption"></p>
    </div>
</dialog>
```

**JS (delegated, in BlogPost.astro `<script>`):**

- Delegated click listener on `document` for `article img`
- On open: set img src/alt, caption from closest `figcaption` or `alt`, `showModal()`, lock scroll
- On close: clear src, unlock scroll (handled by `close` event)
- Click-outside: `e.target === dialog` → `dialog.close()`

**CSS:**

- `dialog::backdrop`: dark overlay + optional blur
- Inner div: `border: 1px solid var(--color-border-default)`, `background: var(--color-bg-primary)`
- Close button: styled with `--color-accent-primary` hover, no rounded-lg
- Caption: `color: var(--color-text-secondary)`, monospace, `// ` prefix (matches existing figcaption style)
- `img` inside dialog: `max-height: 80vh; max-width: 90vw; width: auto`
- `cursor: zoom-in` on `article img` via CSS

### Hero image

Hero image is outside `<article>` in BlogPost layout. Two options:

- Add `data-lightbox` attribute to hero `<img>` and include in the selector
- Or exclude it (hero is already large/full-width)

**Recommendation:** Exclude hero image from lightbox — it's already displayed at full width and clicking it to enlarge would be confusing.

---

## Open Questions

1. Should `cursor: zoom-in` be applied globally to `article img` via `global.css`, or scoped to the script?
2. Caption text source: use `closest('figure') .querySelector('figcaption')?.textContent` — will be empty for non-captioned images, which is fine.
3. Hero image opt-out: add `data-no-lightbox` attribute to hero `<img>` in BlogPost layout and scope selector to `article img:not([data-no-lightbox])`.
