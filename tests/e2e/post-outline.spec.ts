import { expect, test } from '@playwright/test'

// claude-ux-designer-pt-2 writes its sections with `#`, so this exercises the
// real heading-demotion plugin rather than a stub of it
const POST = '/blog/claude-ux-designer-pt-2'

test.describe('post outline', () => {
    test.use({ viewport: { width: 1280, height: 900 } })

    test('the post title is the only h1', async ({ page }) => {
        await page.goto(POST)
        await expect(page.locator('h1')).toHaveCount(1)
        await expect(page.locator('.prose .title h1')).toHaveCount(1)
    })

    test('section headings are demoted to h2', async ({ page }) => {
        await page.goto(POST)
        expect(await page.locator('.prose h2').count()).toBeGreaterThan(0)
    })

    test('contents list is built from the demoted headings', async ({
        page,
    }) => {
        await page.goto(POST)
        const links = page.locator('.toc-inline .toc-list a')
        expect(await links.count()).toBeGreaterThanOrEqual(3)

        const first = await links.first().getAttribute('href')
        await expect(page.locator(`.prose h2${first}`)).toHaveCount(1)
    })
})
