import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalSetup() {
    console.log('🚀 Starting global setup...');

    // Create necessary directories
    const directories = [
        'test-results/logs',
        'test-results/screenshots',
        'test-results/videos',
        'test-results/traces'
    ];

    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`📁 Created directory: ${dir}`);
        }
    });

    // Initialize browser for any pre-test setup if needed
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // You can add any pre-test setup here, such as:
    // - Clearing test databases
    // - Setting up test data
    // - Warming up services

    console.log('🌐 Browser initialized for global setup');

    await browser.close();
    console.log('✅ Global setup completed');
}

export default globalSetup;

