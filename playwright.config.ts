import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Root directory for test discovery
  testDir: './tests',

  // Run test files in parallel (worker-level)
  fullyParallel: true,

  // Fail the build on CI if any test.only is committed
  forbidOnly: !!process.env.CI,

  // Retry failed tests twice on CI, zero locally
  retries: process.env.CI ? 2 : 0,

  // Limit parallel workers on CI to avoid flakiness
  workers: process.env.CI ? 2 : undefined,

  // ---------------------------------------------------------------------------
  // Reporters
  // ---------------------------------------------------------------------------
  reporter: [
    ['list'],                                     // real-time console output
    ['html', { open: 'never' }],                  // rich HTML report (playwright-report/)
    ['json', { outputFile: 'test-results/results.json' }],  // machine-readable
  ],

  // ---------------------------------------------------------------------------
  // Shared settings for every test
  // ---------------------------------------------------------------------------
  use: {
    baseURL: 'https://www.saucedemo.com',

    // Capture trace on first retry to aid debugging (viewable in trace viewer)
    trace: 'on-first-retry',

    // Take a screenshot only on failure
    screenshot: 'only-on-failure',

    // Record a video only on failure
    video: 'on-first-retry',

    // Global timeout per action (e.g. click, fill)
    actionTimeout: 10_000,

    // Viewport matching a standard desktop resolution
    viewport: { width: 1280, height: 720 },
  },

  // Global test timeout
  timeout: 30_000,

  // Timeout waiting for expect() assertions
  expect: {
    timeout: 5_000,
  },

  // ---------------------------------------------------------------------------
  // Browser projects
  // ---------------------------------------------------------------------------
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewport smoke tests
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  // Artefacts output directory (screenshots, videos, traces)
  outputDir: 'test-results/',
});
