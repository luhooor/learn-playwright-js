import { expect } from '@playwright/test';
import { Logger } from './logger.js';
import { Locator } from './locator.js';

export class BasePage {
  constructor(page) {
    this.page = page;
    this.logger = new Logger();
  }

  /**
   * Helper method to extract locator info
   * Automatically resolves any locator type to a usable Playwright locator
   * @param {string|Locator|PlaywrightLocator} locator - Element locator
   * @param {string} fallbackName - Fallback name if locator is string
   * @returns {Object} Object with selector (Playwright locator) and name
   */
  _getLocatorInfo(locator, fallbackName = "element") {
    // Handle custom Locator object
    if (locator instanceof Locator) {
      return {
        selector: locator.resolve(this.page), // Pass page context to resolve
        name: `'${locator.name}'`,
      };
    }

    // Handle Playwright locator object directly
    if (
      locator &&
      typeof locator === "object" &&
      typeof locator.toString === "function" &&
      typeof locator.click === "function"
    ) {
      return {
        selector: locator, // Already a Playwright locator
        name: fallbackName,
      };
    }

    // Handle string selector - wrap with page.locator()
    if (typeof locator === "string") {
      return {
        selector: this.page.locator(locator),
        name: fallbackName,
      };
    }

    // Fallback
    return {
      selector: locator,
      name: fallbackName,
    };
  }

  /**
   * Navigate to a URL with logging
   * @param {string} url - URL to navigate to
   */
  async goto(url) {
    this.logger.info(`Navigating to: ${url}`);
    await this.page.goto(url);
    this.logger.info(`Successfully navigated to: ${url}`);
  }

  /**
   * Click an element with enhanced logging and error handling
   * @param {string|Locator} locator - Element locator (string or Locator object)
   * @param {string} elementName - Human readable element name for logging (optional if using Locator object)
   */
  async click(locator, elementName) {
    const locatorInfo = this._getLocatorInfo(locator, elementName);

    this.logger.info(
      `Finding locator: ${locatorInfo.selector} (${locatorInfo.name})`
    );
    const element = locatorInfo.selector;

    this.logger.info(`Waiting for ${locatorInfo.name} to be visible`);
    await element.waitFor({ state: "visible" });

    this.logger.info(`Clicking on ${locatorInfo.name}`);
    await element.click();
    this.logger.info(`Successfully clicked on ${locatorInfo.name}`);
  }

  /**
   * Fill an input field with enhanced logging
   * @param {string|Locator} locator - Element locator (string or Locator object)
   * @param {string} value - Value to fill
   * @param {string} fieldName - Human readable field name for logging (optional if using Locator object)
   */
  async fill(locator, value, fieldName) {
    const locatorInfo = this._getLocatorInfo(locator, fieldName || "field");

    this.logger.info(
      `Finding locator: ${locatorInfo.selector} (${locatorInfo.name})`
    );
    const element = locatorInfo.selector;

    this.logger.info(`Waiting for ${locatorInfo.name} to be visible`);
    await element.waitFor({ state: "visible" });

    this.logger.info(`Clearing ${locatorInfo.name}`);
    await element.clear();

    this.logger.info(`Sending "${value}" to ${locatorInfo.name}`);
    await element.fill(value);
    this.logger.info(`Successfully filled ${locatorInfo.name} with "${value}"`);
  }

  /**
   * Wait for element to appear with logging
   * @param {string|Locator} locator - Element locator (string or Locator object)
   * @param {string} elementName - Human readable element name for logging (optional if using Locator object)
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElement(locator, elementName, timeout = 30000) {
    const locatorInfo = this._getLocatorInfo(locator, elementName || "element");

    this.logger.info(
      `Waiting for ${locatorInfo.name} to appear: ${locatorInfo.selector}`
    );

    // locatorInfo.selector is already a Playwright locator (resolved), use it directly
    await locatorInfo.selector.waitFor({
      state: "visible",
      timeout,
    });

    this.logger.info(`${locatorInfo.name} appeared successfully`);
  }

  /**
   * Get text from element with logging
   * @param {string|Locator} locator - Element locator (string or Locator object)
   * @param {string} elementName - Human readable element name for logging (optional if using Locator object)
   * @returns {Promise<string>} Element text
   */
  async getText(locator, elementName) {
    const locatorInfo = this._getLocatorInfo(locator, elementName || "element");

    this.logger.info(
      `Finding locator: ${locatorInfo.selector} (${locatorInfo.name})`
    );
    const element = locatorInfo.selector;

    this.logger.info(`Waiting for ${locatorInfo.name} to be visible`);
    await element.waitFor({ state: "visible" });

    const text = await element.textContent();
    this.logger.info(`Retrieved text from ${locatorInfo.name}: "${text}"`);
    return text;
  }

  /**
   * Assert element is visible with logging
   * @param {string|Locator} locator - Element locator (string or Locator object)
   * @param {string} elementName - Human readable element name for logging (optional if using Locator object)
   */
  async assertElementVisible(locator, elementName) {
    const locatorInfo = this._getLocatorInfo(locator, elementName || "element");

    this.logger.info(
      `Verifying ${locatorInfo.name} is visible: ${locatorInfo.selector}`
    );
    await expect(locatorInfo.selector).toBeVisible();
    this.logger.info(`${locatorInfo.name} is visible as expected`);
  }

  /**
   * Assert element contains text with logging
   * @param {string|Locator} locator - Element locator (string or Locator object)
   * @param {string} expectedText - Expected text
   * @param {string} elementName - Human readable element name for logging (optional if using Locator object)
   */
  async assertElementContainsText(locator, expectedText, elementName) {
    const locatorInfo = this._getLocatorInfo(locator, elementName || "element");

    this.logger.info(
      `Verifying ${locatorInfo.name} contains text: "${expectedText}"`
    );
    await expect(locatorInfo.selector).toContainText(expectedText);
    this.logger.info(
      `${locatorInfo.name} contains expected text: "${expectedText}"`
    );
  }

  /**
   * Take screenshot with logging
   * @param {string} name - Screenshot name
   */
  async takeScreenshot(name) {
    this.logger.info(`Taking screenshot: ${name}`);
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
    });
    this.logger.info(`Screenshot saved: ${name}.png`);
  }

  /**
   * Wait for page load with logging
   */
  async waitForPageLoad() {
    this.logger.info("Waiting for page to load completely");
    await this.page.waitForLoadState("networkidle");
    this.logger.info("Page loaded successfully");
  }

  /**
   * Select dropdown option with logging
   * @param {string|Locator} locator - Dropdown locator (string or Locator object)
   * @param {string} value - Option value to select
   * @param {string} dropdownName - Human readable dropdown name for logging (optional if using Locator object)
   */
  async selectDropdown(locator, value, dropdownName) {
    const locatorInfo = this._getLocatorInfo(
      locator,
      dropdownName || "dropdown"
    );

    this.logger.info(
      `Finding locator: ${locatorInfo.selector} (${locatorInfo.name})`
    );
    const element = locatorInfo.selector;

    this.logger.info(`Waiting for ${locatorInfo.name} to be visible`);
    await element.waitFor({ state: "visible" });

    this.logger.info(`Selecting "${value}" from ${locatorInfo.name}`);
    await element.selectOption(value);
    this.logger.info(
      `Successfully selected "${value}" from ${locatorInfo.name}`
    );
  }

  /**
   * Clear an input field with enhanced logging
   * @param {string|Locator} locator - Element locator (string or Locator object)
   * @param {string} elementName - Human readable element name for logging (optional if using Locator object)
   */
  async clear(locator, elementName) {
    const locatorInfo = this._getLocatorInfo(locator, elementName);

    this.logger.info(
      `Finding locator: ${locatorInfo.selector} (${locatorInfo.name})`
    );
    const element = locatorInfo.selector;

    this.logger.info(`Waiting for ${locatorInfo.name} to be visible`);
    await element.waitFor({ state: "visible" });

    this.logger.info(`Clearing ${locatorInfo.name}`);
    await element.clear();
    this.logger.info(`Successfully cleared ${locatorInfo.name}`);
  }

  async isElementVisible(locator, elementName) {
    const locatorInfo = this._getLocatorInfo(locator, elementName);
    this.logger.info(
      `Checking if ${locatorInfo.name} is visible. Locator: ${locatorInfo.selector}`
    );

    return await locatorInfo.selector.isVisible();
  }
}

