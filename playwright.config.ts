import { defineConfig } from '@playwright/test'

const PORT = 3140
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [
    { name: 'phone', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: { command: `npx next dev -p ${PORT}`, url: `http://localhost:${PORT}/`, timeout: 120_000, reuseExistingServer: !process.env.CI },
})
