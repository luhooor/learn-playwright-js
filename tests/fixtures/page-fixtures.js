import { test as base, chromium } from "@playwright/test";
import { LoginPage } from "../../pages/login-page.js";
import { GoogleSheetsManager } from "../../utils/google-sheets.js";
import { Logger } from "../../utils/logger.js";
import { envConfig } from "../../utils/environment-config.js";

// Log environment information on test start
envConfig.logEnvironmentInfo();

// Create logger instance for fixtures
const logger = new Logger();

// Store the shared browser instance
let sharedBrowser = null;

// Extend the base test to include page objects and utilities
export const test = base.extend({
  // Set up shared browser fixture
  browser: [
    async ({}, use) => {
      if (!sharedBrowser) {
        logger.info("Creating new shared browser instance...");
        sharedBrowser = await chromium.launch({ headless: false });
        logger.info("Shared browser instance created");
      } else {
        logger.info("Reusing existing shared browser instance");
      }
      await use(sharedBrowser);
    },
    { scope: "worker" },
  ],

  // Set up context and page fixtures to use shared browser
  context: [
    async ({ browser }, use) => {
      logger.info("Creating new browser context...");
      const context = await browser.newContext();
      logger.info("New browser context created");
      await use(context);
      await context.close();
      logger.info("Browser context closed");
    },
    { scope: "test" },
  ],

  page: [
    async ({ context }, use) => {
      const page = await context.newPage();
      await use(page);
    },
    { scope: "test" },
  ],

  // Page Object fixtures
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // Environment configuration fixture
  environmentConfig: async ({}, use) => {
    await use(envConfig);
  },

  // Google Sheets fixture
  sheetsManager: async ({}, use) => {
    const sheetsManager = new GoogleSheetsManager();
    try {
      await sheetsManager.initialize();
      await use(sheetsManager);
    } catch (error) {
      logger.warn("Google Sheets not configured, using fallback test data");
      await use(null); // Provide null if sheets are not available
    }
  },

  // Logger fixture
  logger: async ({}, use) => {
    const testLogger = new Logger();
    await use(testLogger);
  },

  // Authenticated user fixture - automatically logs in before each test
  authenticatedPage: async ({ page, loginPage, sheetsManager }, use) => {
    let userCredentials;

    if (sheetsManager) {
      try {
        userCredentials = await sheetsManager.getUserCredentials(
          "standard_user"
        );
      } catch (error) {
        logger.warn(
          "Could not get user credentials from Google Sheets, using default"
        );
        userCredentials = {
          username: "standard_user",
          password: "secret_sauce",
        };
      }
    } else {
      userCredentials = { username: "standard_user", password: "secret_sauce" };
    }

    await loginPage.navigateToLogin();
    await loginPage.login(userCredentials.username, userCredentials.password);
    await loginPage.verifySuccessfulLogin();

    await use(page);
  },

  // Test data fixture - provides fallback data when Google Sheets is not available
  testData: async ({ sheetsManager }, use) => {
    let testData = {
      users: [
        {
          user_type: "standard_user",
          username: "standard_user",
          password: "secret_sauce",
          description: "Standard user",
        },
        {
          user_type: "locked_out_user",
          username: "locked_out_user",
          password: "secret_sauce",
          description: "Locked out user",
        },
        {
          user_type: "problem_user",
          username: "problem_user",
          password: "secret_sauce",
          description: "Problem user",
        },
        {
          user_type: "performance_glitch_user",
          username: "performance_glitch_user",
          password: "secret_sauce",
          description: "Performance user",
        },
      ],
      products: [
        // You'll add your own product data when you create product tests!
        {
          product_name: "Sauce Labs Backpack",
          price: "$29.99",
          category: "accessories",
        },
      ],
      customerInfo: {
        firstName: "John",
        lastName: "Doe",
        postalCode: "12345",
      },
    };

    if (sheetsManager) {
      try {
        // Try to get data from the single-sheet TestData layout
        // getAllTestData returns [{ testname, testdataRaw, testdata }, ...]
        const all = await sheetsManager.getAllTestData().catch(() => []);
        if (all.length > 0) {
          // Extract user rows (rows that contain user_type)
          const usersFromSheet = all
            .filter((r) => r.testdata && r.testdata.user_type)
            .map((r) => ({
              user_type: r.testdata.user_type,
              username: r.testdata.username || r.testdata.user,
              password: r.testdata.password,
              description: r.testdata.description || "",
            }));
          if (usersFromSheet.length > 0) testData.users = usersFromSheet;

          // Extract product rows if present
          const productsFromSheet = [];
          for (const r of all) {
            if (
              r.testdata &&
              (r.testdata.product_name || r.testdata.products)
            ) {
              if (r.testdata.product_name) productsFromSheet.push(r.testdata);
              if (Array.isArray(r.testdata.products)) {
                for (const p of r.testdata.products)
                  productsFromSheet.push({ product_name: p });
              }
            }
          }
          if (productsFromSheet.length > 0)
            testData.products = productsFromSheet;

          logger.info("Test data loaded from TestData sheet");
        } else {
          // fallback to legacy Users sheet if present
          const users = await sheetsManager
            .getTestData("Users!A1:D10")
            .catch(() => testData.users);
          testData.users = users.length > 0 ? users : testData.users;
          logger.info("Test data loaded from Google Sheets (legacy)");
        }
      } catch (error) {
        logger.warn(
          "Using fallback test data due to Google Sheets error:",
          error.message
        );
      }
    }

    await use(testData);
  },
});

export { expect } from "@playwright/test";
