import { expect, test, type Page } from '@playwright/test'

/**
 * Phase 5: Easter eggs (Konami popup, GrainCoin link, buddies, dial-up sound).
 *
 * SELECTOR CONTRACT for the implementer:
 *   dialog                       native <dialog>; getByRole('dialog', { name: /graincoin/i })
 *   close button                 getByRole('button', { name: /close/i }) inside the dialog
 *   [data-retro="graincoin-link"] retro-only hidden footer link; opens the same dialog
 *   [data-retro="bonzi"]         Bonzi buddy wrapper (contains img/picture, and a speech bubble with text),
 *                                footer area, visible only in retro
 *   [data-retro="clippy"]        Clippy "Office Assistant" window (text /office assistant/i), footer area
 *   [data-retro="clippy-dismiss"] "Don't show again" button inside clippy; click swaps the clippy
 *                                image to /retro/clippy-stomp.gif (static: clippy-stomp.static.png)
 *   localStorage key             'retro-clippy-dismissed' (value 'true') persists the dismissal
 *   GIFs                         <picture><source media="(prefers-reduced-motion: reduce)" srcset="X.static.png">
 *                                <img src="/retro/X.gif"></picture>
 *   Konami: keydown on document; ignored when target is input/textarea.
 *   Dial-up sound: synthesized via window.AudioContext, only created from the toggle click
 *                  (user gesture), oscillators start/stop within 3s. Never on page load.
 */

const SHORT = { timeout: 2000 }
const CLIPPY_KEY = 'retro-clippy-dismissed'
const BONZI = '[data-retro="bonzi"]'
const CLIPPY = '[data-retro="clippy"]'
const CLIPPY_DISMISS = '[data-retro="clippy-dismiss"]'
const GRAINCOIN_LINK = '[data-retro="graincoin-link"]'
const WINDOW = '[data-retro-window]'
const POST = '/blog/the-tab-horde-is-at-the-gates'

const KONAMI = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
]

const setTheme = (page: Page, value: string) =>
    page.addInitScript((v) => {
        if (!sessionStorage.getItem('__seeded')) {
            sessionStorage.setItem('__seeded', '1')
            localStorage.clear()
            localStorage.setItem('theme-preference', v)
        }
    }, value)

const open = async (page: Page, theme: string, path = '/') => {
    await page.route('**/counter/**', (r) => r.abort())
    await setTheme(page, theme)
    await page.goto(path)
    await page.waitForLoadState('networkidle')
}

const konami = async (page: Page) => {
    for (const k of KONAMI) await page.keyboard.press(k)
}

const isRetro = (page: Page) =>
    page.evaluate(() => document.documentElement.classList.contains('retro'))

const scrollBottom = async (page: Page) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(300)
}

const dialog = (page: Page) => page.getByRole('dialog', { name: /graincoin/i })

test.use({ colorScheme: 'light' })

for (const theme of ['light', 'retro'] as const) {
    test.describe(`konami popup from ${theme}`, () => {
        test('opens GrainCoin dialog, forces retro, closes with Escape and returns focus', async ({
            page,
        }) => {
            await open(page, theme)
            const toggle = page.locator('#theme-toggle')
            await toggle.focus()
            await konami(page)
            await expect(dialog(page)).toBeVisible(SHORT)
            expect(await isRetro(page)).toBe(true)
            await page.keyboard.press('Escape')
            await expect(dialog(page)).toBeHidden(SHORT)
            await expect(toggle).toBeFocused(SHORT)
        })

        test('close button dismisses and returns focus', async ({ page }) => {
            await open(page, theme)
            const toggle = page.locator('#theme-toggle')
            await toggle.focus()
            await konami(page)
            await expect(dialog(page)).toBeVisible(SHORT)
            await dialog(page).getByRole('button', { name: /close/i }).click()
            await expect(dialog(page)).toBeHidden(SHORT)
            await expect(toggle).toBeFocused(SHORT)
        })
    })
}

test.describe('konami popup edge cases', () => {
    test('works on a post page in dark theme', async ({ page }) => {
        await open(page, 'dark', POST)
        await konami(page)
        await expect(dialog(page)).toBeVisible(SHORT)
        expect(await isRetro(page)).toBe(true)
    })

    test('keys typed into a textarea do not trigger it', async ({ page }) => {
        await open(page, 'light')
        await page.evaluate(() => {
            const t = document.createElement('textarea')
            t.id = 'injected-textarea'
            document.body.prepend(t)
        })
        await page.locator('#injected-textarea').focus()
        await konami(page)
        await page.waitForTimeout(300)
        await expect(page.getByRole('dialog')).toHaveCount(0)
        expect(await isRetro(page)).toBe(false)
    })

    test('keys typed into an input do not trigger it', async ({ page }) => {
        await open(page, 'light')
        await page.evaluate(() => {
            const t = document.createElement('input')
            t.id = 'injected-input'
            document.body.prepend(t)
        })
        await page.locator('#injected-input').focus()
        await konami(page)
        await page.waitForTimeout(300)
        await expect(page.getByRole('dialog')).toHaveCount(0)
    })
})

test.describe('hidden footer link', () => {
    test('retro-only GrainCoin link opens the same dialog', async ({
        page,
    }) => {
        await open(page, 'retro')
        await scrollBottom(page)
        const link = page.locator(`footer ${GRAINCOIN_LINK}`)
        await expect(link).toBeAttached(SHORT)
        await link.click(SHORT)
        await expect(dialog(page)).toBeVisible(SHORT)
        await page.keyboard.press('Escape')
        await expect(dialog(page)).toBeHidden(SHORT)
    })

    test('link is not visible in light or dark', async ({ page }) => {
        for (const theme of ['light', 'dark']) {
            const p = await page.context().newPage()
            await open(p, theme)
            await scrollBottom(p)
            await expect(p.locator(GRAINCOIN_LINK)).toBeHidden(SHORT)
            await p.close()
        }
    })
})

test.describe('buddies', () => {
    test('Bonzi with speech bubble and Clippy Office Assistant visible in footer area', async ({
        page,
    }) => {
        await open(page, 'retro')
        await scrollBottom(page)
        const bonzi = page.locator(BONZI)
        const clippy = page.locator(CLIPPY)
        await expect(bonzi).toBeVisible(SHORT)
        await expect(bonzi.locator('img[src*="bonzi"]')).toBeVisible(SHORT)
        const bubbleText = await bonzi.innerText()
        expect(bubbleText.trim().length).toBeGreaterThan(0)
        await expect(clippy).toBeVisible(SHORT)
        await expect(clippy).toContainText(/office assistant/i, SHORT)
        await expect(page.locator(CLIPPY_DISMISS)).toBeVisible(SHORT)
    })

    test('at 375px buddies do not overlap the reading window', async ({
        page,
    }) => {
        await page.setViewportSize({ width: 375, height: 800 })
        await open(page, 'retro', POST)
        await scrollBottom(page)
        await expect(page.locator(BONZI)).toBeVisible(SHORT)
        await expect(page.locator(CLIPPY)).toBeVisible(SHORT)
        const boxes = await page.evaluate(
            ([w, b, c]) => {
                const rect = (s: string) => {
                    const r = document.querySelector(s)!.getBoundingClientRect()
                    return {
                        top: r.top,
                        bottom: r.bottom,
                        left: r.left,
                        right: r.right,
                    }
                }
                return { win: rect(w), bonzi: rect(b), clippy: rect(c) }
            },
            [WINDOW, BONZI, CLIPPY]
        )
        for (const buddy of [boxes.bonzi, boxes.clippy]) {
            const overlaps =
                buddy.left < boxes.win.right &&
                buddy.right > boxes.win.left &&
                buddy.top < boxes.win.bottom &&
                buddy.bottom > boxes.win.top
            expect(overlaps).toBe(false)
        }
    })

    test("Don't show again swaps Clippy to the stomp GIF", async ({ page }) => {
        await open(page, 'retro')
        await scrollBottom(page)
        await page.locator(CLIPPY_DISMISS).click(SHORT)
        await expect(page.locator(`${CLIPPY} img`)).toHaveAttribute(
            'src',
            /clippy-stomp\.gif/,
            SHORT
        )
    })

    test('after dismissal and reload Clippy is not shown and the key is persisted', async ({
        page,
    }) => {
        await open(page, 'retro')
        await scrollBottom(page)
        await page.locator(CLIPPY_DISMISS).click(SHORT)
        await expect(page.locator(`${CLIPPY} img`)).toHaveAttribute(
            'src',
            /clippy-stomp/,
            SHORT
        )
        expect(
            await page.evaluate((k) => localStorage.getItem(k), CLIPPY_KEY)
        ).toBe('true')
        await page.reload()
        await page.waitForLoadState('networkidle')
        await scrollBottom(page)
        await expect(page.locator(CLIPPY)).toBeHidden(SHORT)
        await expect(page.locator(BONZI)).toBeVisible(SHORT)
    })

    test('buddies and closed dialog are invisible outside retro', async ({
        page,
    }) => {
        for (const theme of ['light', 'dark']) {
            const p = await page.context().newPage()
            await open(p, theme)
            await scrollBottom(p)
            await expect(p.locator(BONZI)).toBeHidden(SHORT)
            await expect(p.locator(CLIPPY)).toBeHidden(SHORT)
            await expect(p.getByRole('dialog')).toHaveCount(0)
            await p.close()
        }
    })
})

test.describe('reduced motion buddies', () => {
    test.use({ reducedMotion: 'reduce' })

    test('buddies use static PNGs, stomp uses clippy-stomp.static.png', async ({
        page,
    }) => {
        await open(page, 'retro')
        await scrollBottom(page)
        const src = (sel: string) =>
            page
                .locator(`${sel} img`)
                .evaluate((i: HTMLImageElement) => i.currentSrc)
        await expect(page.locator(BONZI)).toBeVisible(SHORT)
        await expect(page.locator(CLIPPY)).toBeVisible(SHORT)
        expect(await src(BONZI)).toMatch(/\.static\.png$/)
        expect(await src(CLIPPY)).toMatch(/\.static\.png$/)
        await page.locator(CLIPPY_DISMISS).click(SHORT)
        await expect
            .poll(() => src(CLIPPY), SHORT)
            .toMatch(/clippy-stomp\.static\.png$/)
    })
})

const spyAudio = (page: Page) =>
    page.addInitScript(() => {
        const w = window as unknown as {
            __audio: { count: number; starts: number[]; stops: number[] }
            AudioContext: typeof AudioContext
        }
        w.__audio = { count: 0, starts: [], stops: [] }
        const Real = w.AudioContext
        if (!Real) return
        const Wrapped = function (
            this: unknown,
            ...args: ConstructorParameters<typeof AudioContext>
        ) {
            w.__audio.count += 1
            const ctx = new Real(...args)
            const origCreate = ctx.createOscillator.bind(ctx)
            ctx.createOscillator = () => {
                const osc = origCreate()
                const s = osc.start.bind(osc)
                const e = osc.stop.bind(osc)
                osc.start = (when?: number) => {
                    w.__audio.starts.push(when ?? ctx.currentTime)
                    return s(when)
                }
                osc.stop = (when?: number) => {
                    w.__audio.stops.push(when ?? ctx.currentTime)
                    return e(when)
                }
                return osc
            }
            return ctx
        } as unknown as typeof AudioContext
        Wrapped.prototype = Real.prototype
        w.AudioContext = Wrapped
    })

const audio = (page: Page) =>
    page.evaluate(
        () =>
            (
                window as unknown as {
                    __audio: {
                        count: number
                        starts: number[]
                        stops: number[]
                    }
                }
            ).__audio
    )

test.describe('dial-up sound', () => {
    test('toggling into retro creates an AudioContext with sound of at most 3s', async ({
        page,
    }) => {
        await spyAudio(page)
        await open(page, 'dark')
        expect((await audio(page)).count).toBe(0)
        await page.locator('#theme-toggle').click()
        expect(await isRetro(page)).toBe(true)
        await expect.poll(async () => (await audio(page)).count, SHORT).toBe(1)
        const a = await audio(page)
        expect(a.starts.length).toBeGreaterThan(0)
        expect(a.stops.length).toBeGreaterThan(0)
        const duration = Math.max(...a.stops) - Math.min(...a.starts)
        expect(duration).toBeGreaterThan(0)
        expect(duration).toBeLessThanOrEqual(3)
    })

    test('loading a page with retro already stored creates no AudioContext', async ({
        page,
    }) => {
        await spyAudio(page)
        await open(page, 'retro')
        await page.waitForTimeout(500)
        expect((await audio(page)).count).toBe(0)
    })
})
