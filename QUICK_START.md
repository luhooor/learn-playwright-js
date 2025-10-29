# 🚀 Quick Start Guide

Welcome to your Playwright SDET Framework! This guide will get you up and running in 5 minutes.

## ✅ What You Have

Your framework includes:

- **34 comprehensive test scenarios** for Sauce Labs e-commerce site
- **Page Object Model** with 4 main page classes (Login, Products, Cart, Checkout)
- **Custom logging system** that provides detailed HTML reports with step-by-step actions
- **Google Sheets integration** for dynamic test data management (optional)
- **DRY principles** throughout with reusable base classes and fixtures
- **Multi-browser support** (Chrome, Firefox, Safari, Mobile)
- **Professional reporting** with screenshots, videos, and detailed logs

## 🏃‍♂️ Getting Started (5 Minutes)

### Step 1: Basic Setup
```bash
# You're already in the right directory
cd /Users/yanuarkurniawan/pwrght

# Dependencies are already installed, browsers are ready!
# Just create your environment file
cp env-template.txt .env
```

### Step 2: Run Your First Test
```bash
# Run a quick demo to see the framework in action
npm run demo

# Run all Sauce Labs tests
npm run test:sauce

# Or run with visible browser to see what's happening
npm run test:headed
```

### Step 3: View Your Results
```bash
# Open the HTML report
npm run report
```

## 🎯 Test Scenarios Included

### Login Tests (6 scenarios)
- `SL001` - Standard user login
- `SL008` - Locked out user validation  
- `SL011` - Invalid credentials
- `SL012` - Empty field validation
- `SL013` - Problem user behavior
- `SL014` - Performance user testing

### Products Tests (8 scenarios)
- `SL002` - Add single product to cart
- `SL003` - Add multiple products
- `SL005` - Sort by name A-Z
- `SL006` - Sort by price
- `SL016-021` - Advanced product features

### Cart Tests (7 scenarios)
- `SL007` - Add/remove items
- `SL022-027` - Cart management features

### Checkout Tests (8 scenarios)
- `SL004` - Complete checkout flow
- `SL028-034` - Comprehensive checkout testing

## 📊 What You'll See in Reports

Your HTML reports will show detailed logging like:
```
🔸 STEP: User Login: Attempting to login with username: standard_user
ℹ️  Finding locator: [data-test="username"] (Username field)
ℹ️  Waiting for Username field to be visible
ℹ️  Clearing Username field
ℹ️  Sending "standard_user" to Username field
ℹ️  Successfully filled Username field with "standard_user"
✅ PASSED: Login successful
```

## 🔧 Advanced Features

### Google Sheets Integration (Optional)
1. Create a Google Sheet with the structure in `test-data/sample-google-sheets-structure.md`
2. Set up a Google Cloud service account
3. Add credentials to your `.env` file
4. Tests will automatically pull data from sheets!

### Running Specific Tests
```bash
# Run only login tests
npx playwright test tests/sauce-labs/login.spec.js

# Run with specific browser
npx playwright test --project=chromium

# Run in debug mode
npx playwright test --debug

# Run tests matching a pattern
npx playwright test --grep="checkout"
```

### Custom Configuration
Edit `playwright.config.js` to:
- Change browser settings
- Adjust timeout values
- Modify report outputs
- Configure parallel execution

## 🎭 Framework Architecture Highlights

### DRY Principle Implementation
- **BasePage class**: Common actions with built-in logging
- **Page fixtures**: Automatic setup/teardown
- **Reusable components**: No code duplication
- **Smart fallbacks**: Works with or without Google Sheets

### Enhanced Logging
Every action is logged with context:
- Finding elements
- Waiting for conditions  
- Performing actions
- Verifying results

### Professional Structure
```
pwrght/
├── pages/           # Page Object Models
├── tests/           # Test specifications  
├── utils/           # Utilities & base classes
├── test-results/    # Reports & artifacts
└── scripts/         # Helper scripts
```

## 🚨 Troubleshooting

**Tests failing?**
```bash
# Check if the demo site is accessible
curl https://www.saucedemo.com

# Run with visible browser to debug
npm run test:headed
```

**Need help?**
- Check `README.md` for detailed documentation
- Review `test-data/sample-google-sheets-structure.md` for data setup
- Look at log files in `test-results/logs/`

## 🎉 You're Ready!

Your Playwright SDET framework is production-ready with:
- ✅ Professional logging and reporting
- ✅ Scalable Page Object Model architecture  
- ✅ Google Sheets integration capability
- ✅ 34 comprehensive test scenarios
- ✅ Multi-browser support
- ✅ CI/CD ready configuration

**Next steps:**
1. Run `npm run demo` to see it in action
2. Execute `npm run test:sauce` to run all tests
3. Open `npm run report` to view detailed results
4. Customize the framework for your specific needs

Happy testing! 🎭✨
