import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    reporter: 'list',
    use: {
        baseURL: 'http://localhost:4329',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command: 'pnpm build && pnpm preview --port 4329 --ignore-lock',
        url: 'http://localhost:4329',
        // Never reuse: another local Astro app on the port would be tested silently
        reuseExistingServer: false,
        timeout: 300_000,
        // Astro auto-backgrounds `preview` when it detects an AI agent, which
        // Playwright sees as the server exiting early. This keeps it in the foreground.
        env: { ASTRO_PREVIEW_BACKGROUND: '1' },
    },
})
