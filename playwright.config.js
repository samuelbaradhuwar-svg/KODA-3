// Playwright end-to-end tests for the KODA site. Run with `npm run test:e2e` after `npm run build`,
// or `npm run verify` for build + tests + summary. Tests run against the production build served by
// `vite preview`, so they see the pre-rendered HTML exactly as Vercel serves it.
// Set BASE_URL to test another server instead (for example a Vercel preview URL); no local server is started then.
import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT || 4173);
const external = process.env.BASE_URL;

export default defineConfig({
  testDir: "tests/e2e",
  outputDir: "test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: external || `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: external
    ? undefined
    : {
        command: `npx vite preview --port ${PORT} --strictPort`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
