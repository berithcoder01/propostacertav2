import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: process.env.VITE_APP_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'npx vite preview --port 5173 --strictPort',
    url: 'http://localhost:5173',
    timeout: 60 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});