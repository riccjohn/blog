import { expect, test, type Page } from '@playwright/test'

const KEY = 'theme-preference'

const htmlClasses = (page: Page) =>
    page.evaluate(() => Array.from(document.documentElement.classList))

const currentTheme = async (page: Page) => {
    const classes = await htmlClasses(page)
    if (classes.includes('retro')) return 'retro'
    if (classes.includes('dark')) return 'dark'
    return 'light'
}

const stored = (page: Page) =>
    page.evaluate((k) => localStorage.getItem(k), KEY)

test.describe('theme toggle cycle', () => {
    test.use({ colorScheme: 'light' })

    test('cycles light -> dark -> retro -> light and persists across reload', async ({
        page,
    }) => {
        await page.goto('/')
        const toggle = page.locator('#theme-toggle')
        expect(await currentTheme(page)).toBe('light')

        for (const expected of ['dark', 'retro', 'light'] as const) {
            await toggle.click()
            expect(await currentTheme(page)).toBe(expected)
            const classes = await htmlClasses(page)
            expect(classes.includes('dark') && classes.includes('retro')).toBe(
                false
            )
            expect(await stored(page)).toBe(expected)

            await page.reload()
            expect(await currentTheme(page)).toBe(expected)
            expect(await stored(page)).toBe(expected)
        }
    })
})

test.describe('theme resolution', () => {
    test.describe('system dark', () => {
        test.use({ colorScheme: 'dark' })

        test('loads dark and never retro with nothing stored', async ({
            page,
        }) => {
            await page.goto('/')
            const classes = await htmlClasses(page)
            expect(classes).toContain('dark')
            expect(classes).not.toContain('retro')
        })
    })

    test.describe('system light', () => {
        test.use({ colorScheme: 'light' })

        test('invalid stored value resolves to system preference without console errors', async ({
            page,
        }) => {
            const errors: string[] = []
            page.on('console', (m) => {
                if (m.type() === 'error') errors.push(m.text())
            })
            page.on('pageerror', (e) => errors.push(e.message))
            await page.addInitScript((k) => {
                localStorage.setItem(k, 'banana')
            }, KEY)
            await page.goto('/')
            await page.waitForLoadState('networkidle')
            expect(await currentTheme(page)).toBe('light')
            expect(errors).toEqual([])
        })
    })

    test.describe('system dark with invalid stored value', () => {
        test.use({ colorScheme: 'dark' })

        test('banana resolves to dark', async ({ page }) => {
            await page.addInitScript((k) => {
                localStorage.setItem(k, 'banana')
            }, KEY)
            await page.goto('/')
            expect(await currentTheme(page)).toBe('dark')
        })
    })
})

test('no first-paint flash: html.retro present at DOMContentLoaded', async ({
    page,
}) => {
    await page.addInitScript((k) => {
        localStorage.setItem(k, 'retro')
        document.addEventListener('DOMContentLoaded', () => {
            ;(window as unknown as { __retroAtDCL: boolean }).__retroAtDCL =
                document.documentElement.classList.contains('retro')
        })
    }, KEY)
    await page.goto('/')
    const atDcl = await page.evaluate(
        () => (window as unknown as { __retroAtDCL: boolean }).__retroAtDCL
    )
    expect(atDcl).toBe(true)
})

test.describe('toggle accessibility', () => {
    test.use({ colorScheme: 'light' })

    test('aria-label names the theme it will switch to', async ({ page }) => {
        await page.goto('/')
        const toggle = page.locator('#theme-toggle')
        const next = { light: 'dark', dark: 'retro', retro: 'light' } as const

        for (let i = 0; i < 3; i++) {
            const theme = await currentTheme(page)
            const label = (await toggle.getAttribute('aria-label')) ?? ''
            expect(label.toLowerCase()).toContain(next[theme])
            await toggle.click()
        }
    })

    test('is keyboard operable', async ({ page }) => {
        await page.goto('/')
        const toggle = page.locator('#theme-toggle')
        await toggle.focus()
        await expect(toggle).toBeFocused()
        await page.keyboard.press('Enter')
        expect(await currentTheme(page)).toBe('dark')
        await page.keyboard.press('Space')
        expect(await currentTheme(page)).toBe('retro')
    })
})

test.describe('retro base styling', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript((k) => {
            localStorage.setItem(k, 'retro')
        }, KEY)
        await page.goto('/')
    })

    test('body background is the starfield #000018 (or an image)', async ({
        page,
    }) => {
        const { color, image } = await page.evaluate(() => {
            const s = getComputedStyle(document.body)
            return { color: s.backgroundColor, image: s.backgroundImage }
        })
        expect(color === 'rgb(0, 0, 24)' || image !== 'none').toBe(true)
    })

    test('body font stack leads with Verdana', async ({ page }) => {
        const family = await page.evaluate(
            () => getComputedStyle(document.body).fontFamily
        )
        expect(family.toLowerCase()).toMatch(/^["']?verdana/)
    })
})
