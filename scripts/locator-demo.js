#!/usr/bin/env node

/**
 * Demonstration of the new Locator system
 * Shows the before/after comparison and benefits
 */

import { chromium } from '@playwright/test';
import { LoginPage } from '../pages/login-page.js';
import { Logger } from '../utils/logger.js';

async function demonstrateLocatorSystem() {
    console.log('🎭 Enhanced Locator System Demo');
    console.log('=====================================\n');

    const logger = new Logger();
    let browser, context, page;

    try {
        // Launch browser
        logger.info('Launching browser...');
        browser = await chromium.launch({ headless: false });
        context = await browser.newContext({
            baseURL: 'https://www.saucedemo.com'
        });
        page = await context.newPage();

        // Initialize page object
        const loginPage = new LoginPage(page);

        logger.step('Demo Step 1', 'Navigate to login page');
        await loginPage.navigateToLogin();

        console.log('\n🔥 NEW LOCATOR SYSTEM BENEFITS:');
        console.log('===============================');

        console.log('\n📝 BEFORE (Old way):');
        console.log('this.usernameInput = \'[data-test="username"]\';');
        console.log('await this.fill(this.usernameInput, username, "Username field"); // Had to repeat name');

        console.log('\n✨ AFTER (New way):');
        console.log('this.usernameInput = locator(\'[data-test="username"]\', "Username field");');
        console.log('await this.fill(this.usernameInput, username); // Name automatically included!');

        logger.step('Demo Step 2', 'Test the new locator system in action');

        // Demonstrate the new system
        console.log('\n🎯 Watch the logs - notice how human-readable names are automatically included:');
        await loginPage.login('standard_user', 'secret_sauce');

        console.log('\n✅ SUCCESS! Notice in the logs above:');
        console.log('   - "Finding locator: [data-test=\\"username\\"] (Username field)"');
        console.log('   - "Sending \\"standard_user\\" to Username field"');
        console.log('   - "Finding locator: [data-test=\\"password\\"] (Password field)"');
        console.log('   - "Sending \\"secret_sauce\\" to Password field"');
        console.log('   - "Finding locator: [data-test=\\"login-button\\"] (Login button)"');
        console.log('   - "Clicking on Login button"');

        console.log('\n🎉 THE BENEFITS:');
        console.log('================');
        console.log('✅ DRY Principle: Define locator + name once, use everywhere');
        console.log('✅ Less Code: No need to repeat human-readable names');
        console.log('✅ Consistency: All logs automatically have meaningful names');
        console.log('✅ Maintainability: Change name in one place, updates everywhere');
        console.log('✅ Readability: Code is cleaner and more focused');
        console.log('✅ Backward Compatible: Still works with old string locators');

        logger.step('Demo Complete', 'Enhanced locator system demonstrated successfully');

    } catch (error) {
        logger.error('Demo failed', error);
        console.error('❌ Demo failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run demo if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    demonstrateLocatorSystem();
}

export { demonstrateLocatorSystem };
