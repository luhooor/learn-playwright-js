/**
 * Locator class that stores selector, name, and optional page reference
 * Automatically resolves to Playwright locator for any selector type
 * Works like Selenium's WebElement pattern
 */
export class Locator {
  constructor(selector, name, page = null) {
    this.selector = selector; // Can be string or Playwright locator
    this.name = name;
    this.page = page; // Optional page reference for resolution

    // Detect if selector is a Playwright locator
    this.isPlaywrightLocator =
      selector &&
      typeof selector === "object" &&
      typeof selector.toString === "function" &&
      typeof selector.click === "function";
  }

  /**
   * Resolve to a Playwright locator that can be used directly
   * @param {Page} pageContext - Optional page object if not provided in constructor
   * @returns {Locator} Playwright locator object
   */
  resolve(pageContext = null) {
    // If it's already a Playwright locator, return as-is
    if (this.isPlaywrightLocator) {
      return this.selector;
    }

    // Get page from either constructor or parameter
    const page = this.page || pageContext;

    // If it's a string selector and we have page, use page.locator()
    if (page && typeof this.selector === "string") {
      return page.locator(this.selector);
    }

    // Fallback: return selector as-is
    return this.selector;
  }

  toString() {
    if (this.isPlaywrightLocator) {
      return this.selector.toString();
    }
    return this.selector;
  }
}

/**
 * Helper function to create locators more concisely
 * Flexible: works with or without page parameter
 * 
 * @param {string|PlaywrightLocator} selector - CSS/XPath selector or Playwright locator
 * @param {string} name - Human-readable name for logging
 * @param {Page} page - Playwright page object (optional, but recommended for string selectors)
 * @returns {Locator} Locator object
 * 
 * @example
 * // String selector with page (recommended)
 * locator('[data-test="button"]', 'Button', page)
 * 
 * // Playwright locator (with or without page - both work)
 * locator(page.getByRole('button', { name: 'Click' }), 'Button', page)
 * locator(page.getByRole('button', { name: 'Click' }), 'Button')  // Also works!
 * 
 * // String selector without page (will fail in resolve if page not provided)
 * locator('[data-test="button"]', 'Button')  // Avoid this
 */
export function locator(selector, name, page = null) {
  return new Locator(selector, name, page);
}
