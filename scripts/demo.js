#!/usr/bin/env node

/**
 * Demo script to showcase the Playwright SDET Framework
 * This script demonstrates the framework capabilities without running full tests
 */

import { chromium } from '@playwright/test';
import { LoginPage } from '../pages/login-page.js';
import { ProductsPage } from '../pages/products-page.js';
import { Logger } from '../utils/logger.js';

async function runDemo() {
    console.log('🎭 Playwright SDET Framework Demo');
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

        // Initialize page objects
        const loginPage = new LoginPage(page);
        const productsPage = new ProductsPage(page);

        // Demo: Navigate to login page
        logger.step('Demo Step 1', 'Navigate to Sauce Demo login page');
        await loginPage.navigateToLogin();
        await loginPage.verifyLoginPageDisplayed();

        // Demo: Display available users
        logger.step('Demo Step 2', 'Display available test users');
        const usernames = await loginPage.getAvailableUsernames();
        console.log('Available test users found on page:');
        console.log(usernames);

        // Demo: Login with standard user
        logger.step('Demo Step 3', 'Login with standard user');
        await loginPage.loginWithStandardUser();
        await loginPage.verifySuccessfulLogin();

        // Demo: Verify products page
        logger.step('Demo Step 4', 'Verify products page loaded');
        await productsPage.verifyProductsPageLoaded();

        // Demo: Get product information
        logger.step('Demo Step 5', 'Retrieve product information');
        const productNames = await productsPage.getAllProductNames();
        const productPrices = await productsPage.getAllProductPrices();

        console.log('\nProducts available on the site:');
        productNames.forEach((name, index) => {
            console.log(`${index + 1}. ${name} - ${productPrices[index]}`);
        });

        // Demo: Add product to cart
        logger.step('Demo Step 6', 'Add product to cart');
        await productsPage.addProductToCart(productNames[0]);
        const cartCount = await productsPage.getCartItemCount();
        console.log(`\\nCart now contains: ${cartCount} item(s)`);

        // Demo: Sort products
        logger.step('Demo Step 7', 'Demonstrate product sorting');
        await productsPage.sortProducts('za');
        logger.info('Products sorted by name (Z to A)');

        logger.step('Demo Complete', 'Framework demonstration finished successfully');
        console.log('\\n✅ Demo completed successfully!');
        console.log('🚀 Ready to run full test suite with: npm test');

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
    runDemo();
}

export { runDemo };
