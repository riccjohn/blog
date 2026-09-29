import { expect, test, type Page } from '@playwright/test'

/*
 * Selector contract:
 *   [data-retro="music-toggle"]  retro-only header button, aria-pressed on/off
 *   localStorage['retro-music']  'on' | 'off' (opt-in, default off)
 *   Track URL: /retro/music/background.mp3 (never fetched until the user opts in)
 */

const TRACK = '**/retro/music/**'

const open = async (page: Page, theme: string, music?: 'on' | 'off') => {
    await page.addInitScript(
        ([t, m]) => {
            if (!sessionStorage.getItem('__seeded')) {
                sessionStorage.setItem('__seeded', '1')
                localStorage.clear()
                localStorage.setItem('theme-preference', t)
                if (m) localStorage.setItem('retro-music', m)
            }
        },
        [theme, music ?? ''] as const
    )
    await page.route('**/counter/**', (r) => r.abort())
    const trackRequests: string[] = []
    await page.route(TRACK, (r) => {
        trackRequests.push(r.request().url())
        return r.fulfill({ status: 200, contentType: 'audio/mpeg', body: '' })
    })
    await page.goto('/')
    return trackRequests
}

const toggle = (page: Page) => page.locator('[data-retro="music-toggle"]')

test.describe('retro background music', () => {
    for (const theme of ['light', 'dark']) {
        test(`hidden and never fetched in ${theme}`, async ({ page }) => {
            const requests = await open(page, theme)
            await expect(toggle(page)).toBeHidden()
            expect(requests).toHaveLength(0)
        })
    }

    test('off by default in retro: button visible, not pressed, no fetch', async ({
        page,
    }) => {
        const requests = await open(page, 'early-web')
        await expect(toggle(page)).toBeVisible({ timeout: 2000 })
        await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false')
        await expect(toggle(page)).toHaveAccessibleName(/music/i)
        await page.mouse.click(5, 400)
        expect(requests).toHaveLength(0)
    })

    test('clicking opts in: pressed, remembered, track requested', async ({
        page,
    }) => {
        const requests = await open(page, 'early-web')
        await toggle(page).click()
        await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true')
        expect(
            await page.evaluate(() => localStorage.getItem('retro-music'))
        ).toBe('on')
        await expect.poll(() => requests.length).toBeGreaterThan(0)
    })

    test('clicking again opts out and remembers off', async ({ page }) => {
        await open(page, 'early-web')
        await toggle(page).click()
        await toggle(page).click()
        await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false')
        expect(
            await page.evaluate(() => localStorage.getItem('retro-music'))
        ).toBe('off')
    })

    test('remembered "on" resumes on the first interaction after a page load', async ({
        page,
    }) => {
        const requests = await open(page, 'early-web', 'on')
        await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true')
        expect(requests).toHaveLength(0)
        await page.mouse.click(5, 400)
        await expect.poll(() => requests.length).toBeGreaterThan(0)
    })

    test('keyboard operable', async ({ page }) => {
        await open(page, 'early-web')
        await toggle(page).focus()
        await page.keyboard.press('Enter')
        await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true')
    })

    test('no console errors when the track fails to play', async ({ page }) => {
        const errors: string[] = []
        page.on('pageerror', (e) => errors.push(e.message))
        page.on('console', (m) => {
            if (m.type() === 'error') errors.push(m.text())
        })
        await open(page, 'early-web')
        await toggle(page).click()
        await page.waitForTimeout(300)
        expect(
            errors.filter((e) => !e.includes('Failed to load resource'))
        ).toEqual([])
    })
})
