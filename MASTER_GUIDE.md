# 📖 MASTER GUIDE - Tiket.com Playwright SDET Framework

**Single Comprehensive Reference Document**  
*Everything you need to know about this project in one place*

**Last Updated**: November 2025  
**Framework Version**: 1.0.0+  
**Status**: ✅ Production Ready

---

## 🎯 Quick Navigation

- [Project Overview](#project-overview)
- [5-Minute Quick Start](#5-minute-quick-start)
- [Essential Commands](#essential-commands)
- [Test Suites & URLs](#test-suites--urls)
- [Framework Architecture](#framework-architecture)
- [Creating Tests](#creating-tests)
- [Test Data Management](#test-data-management)
- [Running Tests](#running-tests)
- [Reporting & Debugging](#reporting--debugging)
- [Environments & Configuration](#environments--configuration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [File Structure](#file-structure)

---

## Project Overview

### What is This?

A **production-ready Playwright SDET (Software Development Engineer in Test) framework** built specifically for testing:
- **Tiket.com** - Indonesian travel ticketing platform
- **Sauce Labs Demo** - E-commerce reference site for learning

### Key Features

✅ **Multi-Suite Testing** - Automatic URL switching between Sauce Labs and Tiket  
✅ **Multi-Environment** - Staging (gatotkaca.tiket.com), Preprod (preprod.tiket.com), Production (tiket.com)  
✅ **DRY Architecture** - Page Object Model with reusable base classes  
✅ **Enhanced Locator System** - Human-readable locator names, no duplication  
✅ **Comprehensive Logging** - Every action logged in HTML reports  
✅ **Google Sheets Integration** - Dynamic test data management (optional)  
✅ **Custom Fixtures** - Automated setup and teardown  
✅ **Cross-Browser Support** - Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari  
✅ **Professional Reporting** - HTML, JSON, JUnit, Allure reports  
✅ **Production Safety** - All environments testable (you control risk)  

### Tech Stack

- **Playwright** v1.40.0+ - Browser automation
- **Node.js** v20.10.0+ - Runtime
- **Google Sheets API** - Test data (optional)
- **Winston** - Logging system
- **Faker.js** - Test data generation
- **Allure Reports** - Advanced analytics

---

## 5-Minute Quick Start

### Step 1: Install & Setup
```bash
cd /Users/yanuarkurniawan/pwrght

# Install dependencies (one-time)
npm install && npm run install:browsers

# Create environment file
cp env-template.txt .env
```

### Step 2: Run Tests
```bash
# Sauce Labs tests (https://www.saucedemo.com)
npm run test:sauce

# Tiket tests on staging (https://gatotkaca.tiket.com)
npm run test:tiket

# Tiket tests on production (https://tiket.com)
npm run test:tiket:prod
```

### Step 3: View Results
```bash
npm run report
```

**That's it! ✅**

---

## Essential Commands

### Setup & Installation
```bash
npm install                      # Install dependencies
npm run install:browsers         # Install Playwright browsers
npm run setup                    # Full setup (install + browsers)
cp env-template.txt .env        # Create environment config
```

### Sauce Labs Tests
```bash
npm run test:sauce              # Headless
npm run test:sauce:headed       # With visible browser
npm run test:sauce:debug        # Debug mode
```

### Tiket Tests
```bash
# Staging (default)
npm run test:tiket              # Headless
npm run test:tiket:headed       # With visible browser
npm run test:tiket:debug        # Debug mode

# Preproduction
npm run test:tiket:preprod      # On preprod.tiket.com

# Production
npm run test:tiket:prod         # On tiket.com
```

### General Commands
```bash
npm test                        # Run all tests
npm run test:headed            # All tests with visible browser
npm run test:ui                # Interactive UI mode
npm run test:debug             # Debug mode
npm run report                 # View HTML report
npm run demo                   # Framework demo
npm run demo:locators          # Locator system demo
```

### Advanced
```bash
# Run specific test file
npx playwright test tests/sauce-labs/login.spec.js

# Run tests matching pattern
npx playwright test --grep "login"

# Run tests with specific browser
npx playwright test --project=firefox

# Run in parallel
npx playwright test --workers=4

# Debug logging
LOG_LEVEL=debug npm test
```

---

## Test Suites & URLs

### Overview

| Test Suite | URL | Environment | Command |
|-----------|-----|-------------|---------|
| **Sauce Labs** | https://www.saucedemo.com | Fixed | `npm run test:sauce` |
| **Tiket Staging** | https://gatotkaca.tiket.com | Staging | `npm run test:tiket` |
| **Tiket Preprod** | https://preprod.tiket.com | Preproduction | `npm run test:tiket:preprod` |
| **Tiket Production** | https://tiket.com | Production | `npm run test:tiket:prod` |

### How It Works

**Automatic Detection Priority:**
1. `TEST_SUITE` environment variable (highest priority)
2. Test file path (detects from `/sauce-labs/` or `/tiket/`)
3. Fallback to tiket

**Example:**
```bash
# Explicitly set suite
TEST_SUITE=sauce-labs npm run test:sauce
TEST_SUITE=tiket npm run test:tiket

# Auto-detect from path
npm run test:sauce              # Detects from /tests/sauce-labs/
npm run test:tiket              # Detects from /tests/tiket/
```

---

## Framework Architecture

### Core Components

```
utils/
├── base-page.js              # Base page class (all common actions)
├── locator.js                # Enhanced locator system
├── logger.js                 # Custom logging
├── environment-config.js     # Environment & test suite management
├── google-sheets.js          # Test data integration
├── common-function.js        # Shared utility functions
└── global-setup.js           # Global test setup

pages/
├── login-page.js             # Login page object
└── tiket/
    └── homepage/
        └── home-page.js      # Homepage page object

tests/
├── fixtures/
│   └── page-fixtures.js      # Custom test fixtures
├── sauce-labs/
│   └── login.spec.js         # Sauce Labs tests
└── tiket/
    └── homepage/
        └── home-page.js      # Tiket tests

playwright.config.js          # Playwright configuration
package.json                  # Dependencies & scripts
.env                         # Environment configuration
```

### Key Classes & Methods

#### BasePage Class
Common actions available on all page objects:

```javascript
// Navigation
await page.goto(url);
await page.waitForPageLoad();

// Interaction
await page.click(locator);
await page.fill(locator, value);
await page.selectDropdown(locator, value);
await page.clear(locator);

// Verification
await page.waitForElement(locator, timeout);
await page.assertElementVisible(locator);
await page.assertElementContainsText(locator, text);

// Information
const text = await page.getText(locator);
await page.takeScreenshot(name);
```

#### Logger Class
Detailed logging with multiple levels:

```javascript
logger.step('Step Name', 'Description');        // 🔸 Test steps
logger.info('Information message');              // ℹ️  Information
logger.action('Action name', 'target');          // 🎯 Actions
logger.assertion('Assertion text', true);        // ✅ Assertions
logger.error('Error message', error);            // ❌ Errors
logger.warn('Warning message');                  // ⚠️ Warnings
logger.debug('Debug message');                   // 🐛 Debug
```

#### EnvironmentConfig Class
Manage environments and test suites:

```javascript
envConfig.getTestSuite();                 // Get current suite
envConfig.getBaseUrl();                   // Get appropriate URL
envConfig.getCurrentEnvironment();        // Get env info
envConfig.isProduction();                 // Check if production
envConfig.logEnvironmentInfo();           // Log configuration
```

---

## Creating Tests

### Step 1: Create Page Object

```javascript
// pages/tiket/homepage/home-page.js
import { BasePage } from '../../../utils/base-page.js';
import { locator } from '../../../utils/locator.js';

export class HomePage extends BasePage {
    constructor(page) {
        super(page);
        
        // Define locators with human-readable names
        this.searchBox = locator('[data-test="search"]', 'Search box');
        this.searchButton = locator('[data-test="search-btn"]', 'Search button');
        this.resultsList = locator('.results', 'Results list');
    }

    async search(query) {
        this.logger.step('Search', `Searching for: ${query}`);
        
        await this.fill(this.searchBox, query);
        await this.click(this.searchButton);
        
        await this.waitForElement(this.resultsList);
        this.logger.assertion('Search results displayed', true);
    }

    async verifyPageLoaded() {
        await this.assertElementVisible(this.searchBox);
        this.logger.info('Homepage loaded successfully');
    }
}
```

### Step 2: Add to Fixtures

```javascript
// tests/fixtures/page-fixtures.js
import { HomePage } from '../../pages/tiket/homepage/home-page.js';

export const test = base.extend({
    homePage: async ({ page }, use) => {
        const homePage = new HomePage(page);
        await use(homePage);
    },
});
```

### Step 3: Write Test

```javascript
// tests/tiket/homepage/search.spec.js
import { test, expect } from '../fixtures/page-fixtures.js';

test.describe('Homepage Search @smoke', () => {
    test.beforeEach(async ({ homePage }) => {
        await homePage.navigateToLogin();
        await homePage.verifyPageLoaded();
    });

    test('HM001 - Search for flights', async ({ homePage, logger }) => {
        logger.step('Test Start', 'Searching for flights');
        
        await homePage.search('Jakarta to Bali');
        
        logger.assertion('Search completed successfully', true);
    });
});
```

### Best Practices

✅ **Naming Convention**: `[SUITE][TEST_NUMBER] - [ACTION] - [RESULT]`  
✅ **Locator Priority**: `[data-test]` > `[data-qa]` > `[id]` > `.class` > xpath  
✅ **Use Logging**: Log every step for clear reports  
✅ **Independent Tests**: Each test should work alone  
✅ **Fixtures for Setup**: Use fixtures for common setup  
✅ **Error Handling**: Implement try-catch for important actions  

---

## Test Data Management

### Option 1: Fallback Data (No Setup)

Located in `tests/fixtures/page-fixtures.js`:

```javascript
const testData = {
    users: [
        {
            user_type: "standard_user",
            username: "john",
            password: "secure_pass",
            description: "Regular user"
        }
    ],
    products: [
        {
            product_name: "Flight Ticket",
            price: "$150",
            category: "flights"
        }
    ]
};
```

### Option 2: Google Sheets (Recommended)

#### Setup Steps:
1. Create Google Cloud project
2. Enable Google Sheets API
3. Create Service Account credentials
4. Share Google Sheet with service account email
5. Add credentials to `.env`

#### Usage:
```javascript
test('Login', async ({ testData }) => {
    const user = testData.users.find(u => u.user_type === 'admin_user');
    await loginPage.login(user.username, user.password);
});
```

#### Google Sheets Format:
```
testname | testdata
---------|----------
SL001 | (user_type:standard_user, username:john, password:secret)
SL002 | (product_name:Flight, price:$150)
```

### Option 3: Common Functions

```javascript
// utils/common-function.js
import * as common from '../utils/common-function.js';

async fillForm() {
    const email = common.generateRandomEmail();
    const firstName = common.generateRandomFirstName();
    const lastName = common.generateRandomLastName();
    
    await this.fill(this.emailField, email);
    await this.fill(this.firstNameField, firstName);
    await this.fill(this.lastNameField, lastName);
}
```

---

## Running Tests

### By Suite

```bash
# Sauce Labs
npm run test:sauce

# Tiket (uses environment from .env)
npm run test:tiket

# Explicit environment
ENVIRONMENT=staging npm run test:tiket
ENVIRONMENT=preprod npm run test:tiket:preprod
ENVIRONMENT=production npm run test:tiket:prod
```

### By Pattern

```bash
# Specific test
npx playwright test --grep "login"

# Multiple tests
npx playwright test --grep "@smoke"

# Exclude tests
npx playwright test --grep-invert "@slow"
```

### By Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project=mobile-chrome
```

### With Options

```bash
# Parallel execution
npx playwright test --workers=4

# Single worker (sequential)
npx playwright test --workers=1

# Visible browser
npm run test:headed

# Interactive UI
npm run test:ui

# Debug mode
npm run test:debug
```

---

## Reporting & Debugging

### View HTML Report
```bash
npm run report
```

Features: Screenshots, videos, logs, timing, statistics

### Reports Generated

| Format | Location | Usage |
|--------|----------|-------|
| HTML | `playwright-report/` | Interactive viewing |
| JSON | `test-results/results.json` | CI/CD integration |
| JUnit | `test-results/junit.xml` | Jenkins/CI systems |
| Allure | `allure-results/` | Advanced analytics |

### Log Files

```
test-results/logs/
├── combined.log     # All logs
└── error.log        # Errors only
```

### Debugging Tips

```bash
# Headed mode (see browser)
npm run test:headed

# Debug mode (step through)
npm run test:debug

# Slow down execution
SLOW_MO=3000 npm test

# Detailed logging
LOG_LEVEL=debug npm test

# View specific traces
npx playwright show-trace test-results/trace-*.zip
```

---

## Environments & Configuration

### Three Environments

| Name | URL | Status |
|------|-----|--------|
| **Staging** | https://gatotkaca.tiket.com | ✅ Safe to test |
| **Preproduction** | https://preprod.tiket.com | ✅ Safe to test |
| **Production** | https://tiket.com | ✅ Safe to test (use caution) |

### Environment Variables

```env
# Current environment (staging, preprod, production)
ENVIRONMENT=staging

# URLs
STAGING_URL=https://gatotkaca.tiket.com
PREPROD_URL=https://preprod.tiket.com
PRODUCTION_URL=https://tiket.com
SAUCE_LABS_URL=https://www.saucedemo.com

# Base URL override (highest priority)
# BASE_URL=https://custom-url.com

# Logging
LOG_LEVEL=info              # info, debug, error, warn

# Browser
HEADLESS=true              # true or false
SLOW_MO=0                  # Milliseconds between actions

# Google Sheets (optional)
GOOGLE_SHEETS_PRIVATE_KEY_ID=...
GOOGLE_SHEETS_PRIVATE_KEY="..."
GOOGLE_SHEETS_CLIENT_EMAIL=...
GOOGLE_SHEETS_CLIENT_ID=...
GOOGLE_SHEETS_CLIENT_CERT_URL=...
GOOGLE_SPREADSHEET_ID=...
```

### Switching Environments

```bash
# Staging
ENVIRONMENT=staging npm run test:tiket

# Preproduction
ENVIRONMENT=preprod npm run test:tiket:preprod

# Production
ENVIRONMENT=production npm run test:tiket:prod

# From npm scripts
npm run test:tiket:staging
npm run test:tiket:preprod
npm run test:tiket:prod
```

---

## Best Practices

### Test Organization
```
tests/
├── sauce-labs/          # Sauce Labs suite
├── tiket/               # Tiket suite
├── fixtures/            # Shared fixtures
└── smoke/               # Tag-based organization
```

### Test Naming
```
✅ HM001 - Search for flights and verify results
✅ PROD002 - Add product to cart and verify count
✅ CART003 - Remove item and verify price updated

❌ test1
❌ login test
❌ does stuff
```

### Locator Strategy
```javascript
// ✅ Best - Test attribute
this.element = locator('[data-test="id"]', 'Element name');

// ✅ Good - ID
this.element = locator('[id="unique-id"]', 'Element name');

// ⚠️ OK - Class
this.element = locator('.class-name', 'Element name');

// ❌ Avoid - XPath
this.element = locator('xpath=//div[@class="..."]', 'Element name');
```

### Logging Pattern
```javascript
// Test step start
logger.step('Login', 'Attempting to login with admin account');

// Action with details
logger.action('Filling form', 'username field');

// Verification
logger.assertion('Login successful', true);

// On error
logger.error('Login failed', error);
```

### Error Handling
```javascript
try {
    await loginPage.login(username, password);
    logger.assertion('Login successful', true);
} catch (error) {
    logger.error('Login failed', error);
    throw error; // Re-throw so test fails
}
```

### Waits & Timeouts
```javascript
// ✅ Good - Explicit waits
await page.waitForElement(locator);
await page.waitForURL('**/inventory.html');
await page.waitForLoadState('networkidle');

// ❌ Bad - Hard waits
await page.waitForTimeout(5000);
```

---

## Troubleshooting

### Issue: Wrong URL Being Used

**Cause**: BASE_URL or TEST_SUITE not set correctly

**Solution**:
```bash
# Check current settings
echo $TEST_SUITE
echo $ENVIRONMENT
cat .env | grep BASE_URL

# Run with explicit settings
TEST_SUITE=sauce-labs npm run test:sauce
TEST_SUITE=tiket ENVIRONMENT=staging npm run test:tiket
```

### Issue: Browser Binary Not Found

**Cause**: Playwright browsers not installed

**Solution**:
```bash
npm run install:browsers
# or specific browser
npx playwright install chromium
```

### Issue: Tests Timing Out

**Cause**: Slow network or long operations

**Solution**:
```javascript
// In playwright.config.js
use: {
    actionTimeout: 60000,        // Increase to 60 seconds
    navigationTimeout: 60000,
}

// For specific test
test.setTimeout(120000);         // 2 minutes
```

### Issue: Google Sheets Not Working

**Cause**: Missing or incorrect credentials

**Solution**:
```bash
# Check .env credentials
cat .env | grep GOOGLE_SHEETS

# Verify sheet is shared with service account email
# Verify Google Sheets API is enabled

# Tests will use fallback data if sheets unavailable
```

### Issue: Tests Pass Locally but Fail on CI

**Cause**: Environment differences (locale, timezone, screen size)

**Solution**:
```javascript
// Add to playwright.config.js
use: {
    locale: 'en-US',
    timezoneId: 'UTC',
    viewport: { width: 1280, height: 720 },
}
```

### Issue: Port Already in Use (UI Mode)

**Solution**:
```bash
# Kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
npx playwright test --ui-port=3001
```

---

## File Structure

```
pwrght/
│
├── 📁 pages/                        # Page Object Models
│   ├── login-page.js
│   └── tiket/
│       └── homepage/
│           └── home-page.js
│
├── 📁 tests/                        # Test Specifications
│   ├── fixtures/
│   │   └── page-fixtures.js
│   ├── sauce-labs/
│   │   └── login.spec.js
│   └── tiket/
│       └── homepage/
│
├── 📁 utils/                        # Utilities
│   ├── base-page.js                # Base page class
│   ├── locator.js                  # Locator system
│   ├── logger.js                   # Logging system
│   ├── environment-config.js       # Environment manager
│   ├── google-sheets.js            # Sheets integration
│   ├── common-function.js          # Common utilities
│   ├── global-setup.js             # Global setup
│   └── global-teardown.js          # Global teardown
│
├── 📁 scripts/                      # Helper Scripts
│   ├── demo.js
│   └── locator-demo.js
│
├── 📁 test-results/                # Test Artifacts
│   ├── logs/
│   ├── screenshots/
│   ├── videos/
│   ├── results.json
│   ├── junit.xml
│   └── html-report/
│
├── 📁 allure-results/              # Allure Reports
│
├── 📁 test-data/                   # Test Data Docs
│   └── sample-google-sheets-structure.md
│
├── 📚 Documentation                # All Guides
│   ├── README.md
│   ├── QUICK_START.md
│   ├── QUICK_REFERENCE.md
│   ├── COMPREHENSIVE_GUIDE.md
│   ├── HOW_TO.md
│   ├── TEST_SUITE_GUIDE.md
│   ├── ENVIRONMENT_UPDATE.md
│   ├── PROJECT_SUMMARY.md
│   ├── PROJECT_UPDATES.md
│   ├── ENHANCED_LOCATOR_SYSTEM.md
│   ├── ACHIEVEMENT_SUMMARY.md
│   └── MASTER_GUIDE.md (this file)
│
├── 📄 Configuration Files
│   ├── playwright.config.js
│   ├── package.json
│   ├── .env
│   └── env-template.txt
│
└── 📦 Dependencies
    └── node_modules/
```

---

## Common Workflows

### Development Workflow
```bash
# 1. Setup
npm install && npm run install:browsers
cp env-template.txt .env

# 2. Create page object
# Edit: pages/tiket/homepage/home-page.js

# 3. Add to fixtures
# Edit: tests/fixtures/page-fixtures.js

# 4. Write test
# Create: tests/tiket/homepage/search.spec.js

# 5. Test locally
npm run test:tiket:headed

# 6. Debug if needed
npm run test:tiket:debug

# 7. View results
npm run report
```

### Testing Multiple Environments
```bash
# Test on staging
npm run test:tiket:staging

# Test on preproduction
npm run test:tiket:preprod

# Test on production
npm run test:tiket:prod
```

### CI/CD Pipeline
```bash
# Run Sauce Labs tests
npm run test:sauce

# Run Tiket tests on staging
npm run test:tiket:staging

# Run Tiket tests on production (scheduled)
npm run test:tiket:prod

# Generate reports
npm run report
```

---

## Key Takeaways

✅ **Single File Reference** - Everything in this one document  
✅ **Quick Commands** - Essential commands at the top  
✅ **Clear Examples** - Copy-paste ready code examples  
✅ **Multi-Suite** - Automatically detects which suite to run  
✅ **Multi-Environment** - Test on staging, preprod, or production  
✅ **Production Ready** - Safe and reliable framework  

---

## Need More Info?

| Topic | Document | Location |
|-------|----------|----------|
| Setup & Installation | QUICK_START.md | Root |
| All Commands | QUICK_REFERENCE.md | Root |
| Creating Tests | HOW_TO.md | Root |
| Locators Deep Dive | ENHANCED_LOCATOR_SYSTEM.md | Root |
| Test Suites | TEST_SUITE_GUIDE.md | Root |
| Environments | ENVIRONMENT_UPDATE.md | Root |
| Architecture | COMPREHENSIVE_GUIDE.md | Root |

---

**Status**: ✅ Complete Reference  
**Last Updated**: November 2025  
**Version**: 1.0.0+  

🎉 **You now have everything in one place!**
