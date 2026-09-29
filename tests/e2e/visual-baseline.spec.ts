import { expect, test } from '@playwright/test'

const themes = ['light', 'dark'] as const
const widths = [375, 768, 1280] as const
const pages = [
    { name: 'home', path: '/' },
    { name: 'blog-index', path: '/blog' },
    { name: 'post', path: '/blog/the-tab-horde-is-at-the-gates' },
] as const

// Animated hero images (GIF → animated WebP) never produce a stable frame
const animatedImages = [
    'a[href="/blog/stop-playing-whac-a-mole-with-your-rag-chatbot/"] img',
]

for (const theme of themes) {
    for (const width of widths) {
        for (const { name, path } of pages) {
            test(`${name} @ ${width}px [${theme}]`, async ({ page }) => {
                await page.addInitScript((value) => {
                    localStorage.setItem('theme-preference', value)
                }, theme)
                await page.setViewportSize({ width, height: 900 })
                await page.goto(path)
                await page.waitForLoadState('networkidle')
                // Lazy images below the fold otherwise load mid-screenshot
                await page.evaluate(() =>
                    Promise.all(
                        Array.from(document.images, (img) => {
                            img.loading = 'eager'
                            return img.decode().catch(() => undefined)
                        })
                    )
                )
                await expect(page).toHaveScreenshot(
                    `${name}-${theme}-${width}.png`,
                    {
                        fullPage: true,
                        animations: 'disabled',
                        mask: animatedImages.map((selector) =>
                            page.locator(selector)
                        ),
                    }
                )
            })
        }
    }
}
