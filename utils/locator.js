/**
 * Locator class that stores both the selector and human-readable name
 * This enables cleaner, more maintainable page objects
 */
export class Locator {
    constructor(selector, name) {
        this.selector = selector;
        this.name = name;
    }

    toString() {
        return this.selector;
    }
}

/**
 * Helper function to create locators more concisely
 * @param {string} selector - CSS/XPath selector
 * @param {string} name - Human-readable name for logging
 * @returns {Locator} Locator object
 */
export function locator(selector, name) {
    return new Locator(selector, name);
}
