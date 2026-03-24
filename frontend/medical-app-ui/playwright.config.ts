import { defineConfig, devices } from '@playwright/test';

/**
 * MedApp Playwright E2E Configuration
 *
 * Prerequisites before running:
 *   1. docker compose up -d (all DBs)
 *   2. java -jar auth-service.jar       (port 8086)
 *   3. java -jar patient-service.jar    (port 8081)
 *   4. java -jar appointment-service.jar (port 8082)
 *   5. java -jar doctor-service.jar     (port 8083)
 *   6. java -jar api-gateway.jar        (port 8080)
 *   7. ionic serve / ng serve           (port 8100)
 *
 * Run: npx playwright test
 * UI:  npx playwright test --ui
 * Report: npx playwright show-report
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,      // serial: tests share seeded DB state
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: 1,                // single worker to avoid race conditions on shared DB
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:8100',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Start dev server if not already running
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:8100',
  //   reuseExistingServer: true,
  //   timeout: 60_000,
  // },
});
