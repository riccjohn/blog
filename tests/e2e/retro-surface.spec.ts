import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

/**
 * Phase 4a: Retro reading surface (Win95 window).
 *
 * SELECTOR CONTRACT for the implementer (all inside html.retro):
 *   [data-retro-window]     outer window element wrapping page/post content
 *   [data-retro-titlebar]   title bar; its text content === the page's <title>
 *                           (post: the post title; home: SITE_TITLE, same as <title>)
 *   [data-retro-statusbar]  status bar, inside the window
 *   [data-retro-surface]    the reading surface (descendant of the window);
 *                           background #fffff0, color #1a1a1a. Headings/links
 *                           in the content live inside it.
 *
 * Title comparison uses document.title for both pages because both layouts
 * pass the page title to <title> (home = SITE_TITLE, post = frontmatter title),
 * while the home h1 ("Hi, I'm John!") is a content heading, not the page title.
 * The post title is additionally hardcoded as a guard.
 */

const POST = '/blog/the-tab-horde-is-at-the-gates'
const POST_TITLE =
    "The Tab Horde is at the Gates (And They're Hungry for Your Focus)"
const pages = [
    { name: 'home', path: '/' },
    { name: 'post', path: POST },
] as const

const WINDOW = '[data-retro-window]'
const TITLEBAR = '[data-retro-titlebar]'
const STATUSBAR = '[data-retro-statusbar]'
const SURFACE = '[data-retro-surface]'
const SHORT = { timeout: 2000 }

const goRetro = async (page: Page, path: string) => {
    await page.addInitScript(() => {
        localStorage.setItem('theme-preference', 'retro')
    })
    await page.goto(path)
    await page.waitForLoadState('networkidle')
}

test.use({ colorScheme: 'light' })

for (const { name, path } of pages) {
    test.describe(`retro reading surface: ${name}`, () => {
        test('window chrome: title bar equals page title, status bar present', async ({
            page,
        }) => {
            await goRetro(page, path)
            const win = page.locator(WINDOW).first()
            await expect(win).toBeVisible(SHORT)
            const titlebar = win.locator(TITLEBAR).first()
            await expect(titlebar).toBeVisible(SHORT)
            const docTitle = await page.title()
            await expect(titlebar).toHaveText(docTitle, SHORT)
            if (name === 'post') {
                await expect(titlebar).toHaveText(POST_TITLE, SHORT)
            }
            await expect(win.locator(STATUSBAR).first()).toBeVisible(SHORT)
        })

        test('reading surface colours: bg #fffff0, text #1a1a1a, links #0000ee', async ({
            page,
        }) => {
            await goRetro(page, path)
            const surface = page.locator(SURFACE).first()
            await expect(surface).toBeVisible(SHORT)
            await expect(surface).toHaveCSS(
                'background-color',
                'rgb(255, 255, 240)',
                SHORT
            )
            await expect(surface).toHaveCSS('color', 'rgb(26, 26, 26)', SHORT)

            const linkColors = await surface
                .locator('a[href]:not(:has(img))')
                .evaluateAll((els) =>
                    els.map((el) => getComputedStyle(el).color)
                )
            expect(linkColors.length).toBeGreaterThan(0)
            for (const c of linkColors) expect(c).toBe('rgb(0, 0, 238)')
        })

        test('headings use the pixel font stack', async ({ page }) => {
            await goRetro(page, path)
            const surface = page.locator(SURFACE).first()
            await expect(surface).toBeVisible(SHORT)
            const fonts = await surface
                .locator('h1, h2, h3')
                .evaluateAll((els) =>
                    els.map((el) => getComputedStyle(el).fontFamily)
                )
            expect(fonts.length).toBeGreaterThan(0)
            for (const f of fonts) {
                expect(f).toMatch(/Pixelify Sans|VT323|Silkscreen/)
            }
        })

        test('axe color-contrast: 0 violations in the window', async ({
            page,
        }) => {
            await goRetro(page, path)
            await expect(page.locator(WINDOW).first()).toBeVisible(SHORT)
            const results = await new AxeBuilder({ page })
                .include(WINDOW)
                .withRules(['color-contrast'])
                .analyze()
            expect(
                results.violations.map((v) => ({
                    id: v.id,
                    nodes: v.nodes.map((n) => n.target),
                }))
            ).toEqual([])
        })

        test('no running animations and no gif images inside the window', async ({
            page,
        }) => {
            await goRetro(page, path)
            const win = page.locator(WINDOW).first()
            await expect(win).toBeVisible(SHORT)
            const running = await win.evaluate(
                (el) =>
                    [el, ...Array.from(el.querySelectorAll('*'))].flatMap((e) =>
                        e.getAnimations().map(() => e.tagName)
                    ).length
            )
            expect(running).toBe(0)
            await expect(win.locator('img[src$=".gif"]')).toHaveCount(0)
        })

        test('title bar gradient ends #0a3d8f, not #1084d0', async ({
            page,
        }) => {
            await goRetro(page, path)
            const titlebar = page.locator(WINDOW).locator(TITLEBAR).first()
            await expect(titlebar).toBeVisible(SHORT)
            const bg = await titlebar.evaluate(
                (el) => getComputedStyle(el).backgroundImage
            )
            expect(bg).toContain('rgb(10, 61, 143)')
            expect(bg).not.toContain('rgb(16, 132, 208)')
        })

        test('no horizontal scroll at 375px', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 800 })
            await goRetro(page, path)
            await expect(page.locator(WINDOW).first()).toBeVisible(SHORT)
            const overflow = await page.evaluate(() => ({
                scroll: document.documentElement.scrollWidth,
                client: document.documentElement.clientWidth,
            }))
            expect(overflow.scroll).toBeLessThanOrEqual(overflow.client)
        })
    })
}

/**
 * Phase 4c: /blog index in retro. The page does not use Layout/RetroWindow
 * today, so post cards sit on the starfield. Post list must live in the window.
 *
 * Title colour choice: link blue rgb(0, 0, 238) (#0000ee). Titles are inside
 * the card <a>, so they inherit link colour on the #fffff0 surface.
 */
const BLOG_LINK_BLUE = 'rgb(0, 0, 238)'

const goBlogRetro = async (page: Page) => {
    await page.route('**/counter/**', (r) => r.abort())
    await goRetro(page, '/blog')
}

test.describe('blog index in retro', () => {
    test('post list is inside a window with title bar, status bar and surface colours', async ({
        page,
    }) => {
        await goBlogRetro(page)
        const win = page.locator(WINDOW).first()
        await expect(win).toBeVisible(SHORT)
        const listInWindow = await page
            .locator('main ul')
            .first()
            .evaluate((el, sel) => el.closest(sel) !== null, WINDOW)
        expect(listInWindow).toBe(true)
        await expect(win.locator(TITLEBAR).first()).toHaveText(
            await page.title(),
            SHORT
        )
        await expect(win.locator(STATUSBAR).first()).toBeVisible(SHORT)
        const surface = page.locator(SURFACE).first()
        await expect(surface).toBeVisible(SHORT)
        await expect(surface).toHaveCSS(
            'background-color',
            'rgb(255, 255, 240)',
            SHORT
        )
        await expect(surface).toHaveCSS('color', 'rgb(26, 26, 26)', SHORT)
    })

    test('post titles are link blue (#0000ee)', async ({ page }) => {
        await goBlogRetro(page)
        await expect(page.locator('main li h4').first()).toBeVisible(SHORT)
        const colors = await page
            .locator('main li h4')
            .evaluateAll((els) => els.map((el) => getComputedStyle(el).color))
        expect(colors.length).toBeGreaterThan(0)
        for (const c of colors) expect(c).toBe(BLOG_LINK_BLUE)
    })

    test('axe color-contrast: 0 violations in the window', async ({ page }) => {
        await goBlogRetro(page)
        await expect(page.locator(WINDOW).first()).toBeVisible(SHORT)
        const results = await new AxeBuilder({ page })
            .include(WINDOW)
            .withRules(['color-contrast'])
            .analyze()
        expect(
            results.violations.map((v) => ({
                id: v.id,
                nodes: v.nodes.map((n) => n.target),
            }))
        ).toEqual([])
    })

    test('hero image wrappers are square (border-radius 0px)', async ({
        page,
    }) => {
        await goBlogRetro(page)
        await expect(page.locator('main li img').first()).toBeVisible(SHORT)
        const radii = await page.locator('main li img').evaluateAll((els) =>
            els.map((img) => ({
                img: getComputedStyle(img).borderRadius,
                wrapper: img.closest('div')
                    ? getComputedStyle(img.closest('div') as HTMLElement)
                          .borderRadius
                    : null,
            }))
        )
        expect(radii.length).toBeGreaterThan(0)
        for (const r of radii) {
            expect(r.img).toBe('0px')
            expect(r.wrapper).toBe('0px')
        }
    })

    test('no horizontal scroll at 375px', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 800 })
        await goBlogRetro(page)
        const overflow = await page.evaluate(() => ({
            scroll: document.documentElement.scrollWidth,
            client: document.documentElement.clientWidth,
        }))
        expect(overflow.scroll).toBeLessThanOrEqual(overflow.client)
    })

    test('NEW! badge is the only [data-retro] element inside the window', async ({
        page,
    }) => {
        await goBlogRetro(page)
        const win = page.locator(WINDOW).first()
        await expect(win).toBeVisible(SHORT)
        const kinds = await win
            .locator('[data-retro]')
            .evaluateAll((els) =>
                els.map((el) => el.getAttribute('data-retro'))
            )
        expect(kinds).toEqual(['new-badge'])
    })
})
