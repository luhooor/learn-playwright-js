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
   * @param {string|Locator} locator - Element locator (string or Locator object)
   * @param {string} fallbackName - Fallback name if locator is string
   * @returns {Object} Object with selector and name
   */
  _getLocatorInfo(locator, fallbackName = "element") {
    if (locator instanceof Locator) {
      return {
        selector: locator.selector,
        name: `'${locator.name}'`,
      };
    }
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
    const element = this.page.locator(locatorInfo.selector);

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
    const element = this.page.locator(locatorInfo.selector);

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
    await this.page.locator(locatorInfo.selector).waitFor({
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
    const element = this.page.locator(locatorInfo.selector);

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
    await expect(this.page.locator(locatorInfo.selector)).toBeVisible();
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
    await expect(this.page.locator(locatorInfo.selector)).toContainText(
      expectedText
    );
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
    const element = this.page.locator(locatorInfo.selector);

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
    const element = this.page.locator(locatorInfo.selector);

    this.logger.info(`Waiting for ${locatorInfo.name} to be visible`);
    await element.waitFor({ state: "visible" });

    this.logger.info(`Clearing ${locatorInfo.name}`);
    await element.clear();
    this.logger.info(`Successfully cleared ${locatorInfo.name}`);
  }
}

