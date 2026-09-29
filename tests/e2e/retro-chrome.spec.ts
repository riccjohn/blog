import { expect, test, type Page } from '@playwright/test'

/**
 * Phase 4b: Retro chrome (header / footer set pieces).
 *
 * SELECTOR CONTRACT for the implementer:
 *   [data-retro]                 present on EVERY wacky element (light/dark: must not be visible)
 *   [data-retro="wordmark"]      header wordmark, Comic Sans font-family
 *   [data-retro="marquee"]       header marquee (CSS @keyframes gated by
 *                                prefers-reduced-motion: no-preference; no <marquee>)
 *   [data-retro="globe"]         wrapper (or the <picture>/<img>) of the globe GIF, in <header>
 *   [data-retro="mailbox"]       mailbox GIF, in <header>
 *   [data-retro="message-alert"] message-alert GIF, in <header>, below `header nav`
 *   [data-retro="new-badge"]     NEW! GIF on /blog, inside the first `main li` (newest post), beside its h4.title
 *                                (/blog has no [data-retro-window])
 *   [data-retro="construction-tape"], [data-retro="under-construction"],
 *   [data-retro="walking-computer"], [data-retro="webring"], [data-retro="email-me"],
 *   [data-retro="badges"]        all in <footer>
 *   webring links                role=link named /prev/i, /random/i, /next/i inside webring
 *   [data-retro="badges"] [data-badge]  each 88x31; text includes "Sign my guestbook" and "Best viewed in"
 *   [data-retro="hit-counter"]   has aria-label containing the number; digit cells are
 *                                `[data-digit]` (>= 5). Fallback number >= 13370.
 *   GIFs: <picture><source media="(prefers-reduced-motion: reduce)" srcset=".../X.static.png">
 *         <img src="/retro/X.gif" alt=...></picture>. Footer imgs loading="lazy".
 *   Header nav: `header nav`.
 */

const SHORT = { timeout: 2000 }
const WACKY = '[data-retro]'
const RETRO_IMGS = 'img[src*="/retro/"]'
const GIFS = [
    'globe',
    'mailbox',
    'message-alert',
    'construction-tape',
    'under-construction',
    'walking-computer',
    'email-me',
] as const

const setTheme = (page: Page, value: string) =>
    page.addInitScript((v) => {
        localStorage.setItem('theme-preference', v)
    }, value)

const goRetro = async (page: Page, path = '/') => {
    // Counter must fail: never depend on real network.
    await page.route('**/counter/**', (r) => r.abort())
    await setTheme(page, 'early-web')
    await page.goto(path)
    await page.waitForLoadState('networkidle')
}

const scrollBottom = async (page: Page) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(300)
}

test.use({ colorScheme: 'light' })

for (const theme of ['light', 'dark'] as const) {
    test.describe(`chrome hidden in ${theme}`, () => {
        test(`no visible [data-retro] and no /retro/ requests`, async ({
            page,
        }) => {
            const hits: string[] = []
            page.on('request', (r) => {
                if (r.url().includes('/retro/')) hits.push(r.url())
            })
            await setTheme(page, theme)
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            await scrollBottom(page)
            const visible = await page.evaluate(
                (sel) =>
                    [...document.querySelectorAll(sel)].filter((e) => {
                        const r = e.getBoundingClientRect()
                        const s = getComputedStyle(e)
                        return (
                            s.display !== 'none' &&
                            s.visibility !== 'hidden' &&
                            r.width > 0 &&
                            r.height > 0
                        )
                    }).length,
                WACKY
            )
            expect(visible).toBe(0)
            expect(hits).toEqual([])
        })
    })
}

test.describe('retro chrome: header', () => {
    test('wordmark is Comic Sans; marquee, globe, mailbox visible in header', async ({
        page,
    }) => {
        await goRetro(page)
        const header = page.locator('header').first()
        const wordmark = header.locator('[data-retro="wordmark"]').first()
        await expect(wordmark).toBeVisible(SHORT)
        const ff = await wordmark.evaluate(
            (e) => getComputedStyle(e).fontFamily
        )
        expect(ff.toLowerCase()).toContain('comic sans')
        await expect(header.locator('[data-retro="marquee"]')).toBeVisible(
            SHORT
        )
        await expect(header.locator('[data-retro="globe"]')).toBeVisible(SHORT)
        await expect(header.locator('[data-retro="mailbox"]')).toBeVisible(
            SHORT
        )
        expect(
            await page.locator('marquee').count(),
            'no <marquee> element'
        ).toBe(0)
    })

    test('message-alert sits below the nav', async ({ page }) => {
        await goRetro(page)
        const alert = page.locator('[data-retro="message-alert"]').first()
        await expect(alert).toBeVisible(SHORT)
        const nav = await page.locator('header nav').first().boundingBox()
        const box = await alert.boundingBox()
        expect(nav).not.toBeNull()
        expect(box!.y).toBeGreaterThanOrEqual(nav!.y + nav!.height - 1)
    })
})

test.describe('retro chrome: /blog NEW! badge', () => {
    test('exactly one NEW! badge, in the newest post li beside its title', async ({
        page,
    }) => {
        await goRetro(page, '/blog')
        const badge = page.locator('[data-retro="new-badge"]')
        await expect(badge).toHaveCount(1, SHORT)
        await expect(badge).toBeVisible(SHORT)
        const first = page.locator('main li').first()
        await expect(first.locator('[data-retro="new-badge"]')).toHaveCount(
            1,
            SHORT
        )
        const b = await badge.boundingBox()
        const t = await first.locator('h4').first().boundingBox()
        expect(b).not.toBeNull()
        expect(t).not.toBeNull()
        const mid = (x: { y: number; height: number }) => x.y + x.height / 2
        expect(Math.abs(mid(b!) - mid(t!))).toBeLessThan(60)
    })

    test('new.gif picture has a matching .static.png reduced-motion source', async ({
        page,
    }) => {
        await goRetro(page, '/blog')
        const img = page.locator('img[src$="/retro/new.gif"]').first()
        await expect(img).toBeAttached(SHORT)
        const srcset = await img.evaluate((e) => {
            const p = e.parentElement
            if (!p || p.tagName !== 'PICTURE') return null
            return (
                p
                    .querySelector(
                        'source[media="(prefers-reduced-motion: reduce)"]'
                    )
                    ?.getAttribute('srcset') ?? null
            )
        })
        expect(srcset).not.toBeNull()
        expect(srcset!.trim().split(/\s+/)[0]).toMatch(
            /\/retro\/new\.static\.png$/
        )
        const alt = await img.getAttribute('alt')
        const hidden = await img.evaluate(
            (e) => e.closest('[aria-hidden="true"]') !== null
        )
        expect(alt).not.toBeNull()
        if (alt!.trim() === '') expect(hidden).toBe(true)
    })

    test.describe('reduced motion', () => {
        test.use({ reducedMotion: 'reduce' })
        test('new.gif currentSrc is .static.png', async ({ page }) => {
            await goRetro(page, '/blog')
            const img = page.locator('img[src$="/retro/new.gif"]').first()
            await expect(img).toBeVisible(SHORT)
            const src = await img.evaluate(
                (e) => (e as HTMLImageElement).currentSrc
            )
            expect(src).toMatch(/\.static\.png$/)
        })
    })
})

test.describe('retro chrome: footer', () => {
    test('footer set pieces, webring, email-me, badges', async ({ page }) => {
        await goRetro(page)
        await scrollBottom(page)
        const footer = page.locator('footer').first()
        for (const k of [
            'construction-tape',
            'under-construction',
            'walking-computer',
            'email-me',
        ]) {
            await expect(footer.locator(`[data-retro="${k}"]`)).toBeVisible(
                SHORT
            )
        }
        const ring = footer.locator('[data-retro="webring"]')
        await expect(ring).toBeVisible(SHORT)
        for (const n of [/prev/i, /random/i, /next/i]) {
            await expect(ring.getByRole('link', { name: n })).toBeVisible(SHORT)
        }
        const badges = footer.locator('[data-retro="badges"]')
        await expect(badges).toBeVisible(SHORT)
        await expect(badges).toContainText(/sign my guestbook/i, SHORT)
        await expect(badges).toContainText(/best viewed in/i, SHORT)
        const sizes = await badges.locator('[data-badge]').evaluateAll((els) =>
            els.map((e) => {
                const r = e.getBoundingClientRect()
                return [Math.round(r.width), Math.round(r.height)]
            })
        )
        expect(sizes.length).toBeGreaterThanOrEqual(2)
        for (const s of sizes) expect(s).toEqual([88, 31])
    })

    test('footer GIFs are lazy-loaded', async ({ page }) => {
        await goRetro(page)
        const loading = await page
            .locator(`footer ${RETRO_IMGS}`)
            .evaluateAll((els) => els.map((e) => e.getAttribute('loading')))
        expect(loading.length).toBeGreaterThan(0)
        for (const l of loading) expect(l).toBe('lazy')
    })
})

test.describe('retro chrome: hit counter (fallback path)', () => {
    test('renders >=5 digit cells with aria-label >= 13370, silently', async ({
        page,
    }) => {
        const errors: string[] = []
        page.on('pageerror', (e) => errors.push(e.message))
        page.on('console', (m) => {
            // Browser's own network-failure log is not app code.
            if (
                m.type() === 'error' &&
                !/Failed to load resource/i.test(m.text())
            )
                errors.push(m.text())
        })
        await goRetro(page)
        await scrollBottom(page)
        const counter = page.locator('[data-retro="hit-counter"]').first()
        await expect(counter).toBeVisible(SHORT)
        expect(
            await counter.locator('[data-digit]').count()
        ).toBeGreaterThanOrEqual(5)
        const label = (await counter.getAttribute('aria-label')) ?? ''
        const n = Number(label.replace(/[^0-9]/g, ''))
        expect(n).toBeGreaterThanOrEqual(13370)
        expect(errors).toEqual([])
    })
})

test.describe('retro chrome: GIF media handling', () => {
    test('every retro GIF is a <picture> with a matching .static.png reduced-motion source', async ({
        page,
    }) => {
        await goRetro(page)
        await scrollBottom(page)
        for (const name of GIFS) {
            const img = page.locator(`img[src$="/retro/${name}.gif"]`).first()
            await expect(img, `${name}.gif present`).toBeAttached(SHORT)
            const srcset = await img.evaluate((e) => {
                const p = e.parentElement
                if (!p || p.tagName !== 'PICTURE') return null
                const s = p.querySelector(
                    'source[media="(prefers-reduced-motion: reduce)"]'
                )
                return s?.getAttribute('srcset') ?? null
            })
            expect(srcset, `${name} source`).not.toBeNull()
            expect(srcset!.trim().split(/\s+/)[0]).toMatch(
                new RegExp(`/retro/${name}\\.static\\.png$`)
            )
        }
    })

    test('alt text is meaningful or decorative+aria-hidden', async ({
        page,
    }) => {
        await goRetro(page)
        await scrollBottom(page)
        const imgs = await page.locator(RETRO_IMGS).evaluateAll((els) =>
            els.map((e) => ({
                src: e.getAttribute('src'),
                alt: e.getAttribute('alt'),
                hidden: e.closest('[aria-hidden="true"]') !== null,
            }))
        )
        expect(imgs.length).toBeGreaterThanOrEqual(GIFS.length)
        for (const i of imgs) {
            if (i.alt === null) throw new Error(`${i.src}: missing alt`)
            if (i.alt.trim() === '')
                expect(i.hidden, `${i.src} decorative`).toBe(true)
        }
    })

    test('2x GIFs (globe on /, NEW! on /blog) render at double intrinsic size, pixelated', async ({
        page,
    }) => {
        const cases = [
            { path: '/', name: 'globe', w: 50, h: 50 },
            { path: '/blog', name: 'new', w: 40, h: 30 },
        ]
        for (const { path, name, w, h } of cases) {
            await goRetro(page, path)
            const img = page.locator(`img[src$="/retro/${name}.gif"]`).first()
            await expect(img).toBeVisible(SHORT)
            const m = await img.evaluate((e: HTMLImageElement) => {
                const r = e.getBoundingClientRect()
                return {
                    nw: e.naturalWidth,
                    nh: e.naturalHeight,
                    w: r.width,
                    h: r.height,
                    ir: getComputedStyle(e).imageRendering,
                }
            })
            expect([m.nw, m.nh]).toEqual([w, h])
            expect([m.w, m.h]).toEqual([w * 2, h * 2])
            expect(m.ir).toBe('pixelated')
        }
    })
})

test.describe('retro chrome: reduced motion', () => {
    test.use({ reducedMotion: 'reduce' })

    test('all images use .static.png and marquee has no running animation', async ({
        page,
    }) => {
        await goRetro(page)
        await scrollBottom(page)
        const marquee = page.locator('[data-retro="marquee"]').first()
        await expect(marquee).toBeVisible(SHORT)
        const srcs = await page
            .locator(RETRO_IMGS)
            .evaluateAll((els) =>
                els.map((e) => (e as HTMLImageElement).currentSrc)
            )
        expect(srcs.length).toBeGreaterThanOrEqual(GIFS.length)
        for (const s of srcs) expect(s).toMatch(/\.static\.png$/)
        const running = await marquee.evaluate(
            (e) =>
                [e, ...e.querySelectorAll('*')].flatMap((n) =>
                    n.getAnimations().filter((a) => a.playState === 'running')
                ).length
        )
        expect(running).toBe(0)
    })
})

test.describe('retro chrome: layout', () => {
    for (const path of ['/', '/blog/the-tab-horde-is-at-the-gates']) {
        test(`wacky elements are never inside the reading window: ${path}`, async ({
            page,
        }) => {
            await goRetro(page, path)
            expect(await page.locator(WACKY).count()).toBeGreaterThan(0)
            const inside = await page.evaluate(() =>
                [
                    ...document.querySelectorAll(
                        '[data-retro-window] [data-retro]'
                    ),
                ].map((e) => e.getAttribute('data-retro'))
            )
            expect(inside).toEqual([])
        })
    }

    test('no horizontal scroll at 375px', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 800 })
        await goRetro(page)
        await scrollBottom(page)
        expect(await page.locator(WACKY).count()).toBeGreaterThan(0)
        const overflow = await page.evaluate(
            () =>
                document.documentElement.scrollWidth -
                document.documentElement.clientWidth
        )
        expect(overflow).toBeLessThanOrEqual(0)
    })
})
