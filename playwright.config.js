import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { envConfig } from './utils/environment-config.js';

// Load environment variables
dotenv.config();

export default defineConfig({
  testDir: "./tests",

  /* Run tests sequentially */
  fullyParallel: false,
  workers: 1,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    [
      "html",
      {
        outputFolder: "playwright-report",
        open: "never",
      },
    ],
    [
      "json",
      {
        outputFile: "test-results/results.json",
      },
    ],
    [
      "junit",
      {
        outputFile: "test-results/junit.xml",
      },
    ],
    [
      "allure-playwright",
      {
        detail: true,
        outputFolder: "allure-results",
        suiteTitle: false,
      },
    ],
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: envConfig.getBaseUrl(),

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "retain-on-failure",

    /* Take screenshot on failure */
    screenshot: "only-on-failure",

    /* Record video on failure */
    video: "retain-on-failure",

    /* Custom timeout settings */
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        contextOptions: {
          reducedMotion: "reduce",
        },
        launchOptions: {
          headless: process.env.HEADLESS !== "false",
        },
      },
      testMatch: /.*.spec.js/,
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  /* Global Setup */
  globalSetup: "./utils/global-test-setup.js",

  /* Output directory for test artifacts */
  outputDir: "test-results/",
});

