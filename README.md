# Playwright SDET Framework

A comprehensive Playwright testing framework built with SDET best practices, featuring DRY principles, Google Sheets integration, custom logging, and detailed HTML reporting.

## 🚀 Features

- **DRY Architecture**: Page Object Model with reusable base classes
- **Google Sheets Integration**: Dynamic test data management
- **Enhanced Logging**: Detailed logging in HTML reports with step-by-step actions
- **Custom Fixtures**: Automated setup and teardown for efficient testing
- **Multiple Browsers**: Support for Chromium, Firefox, Safari, and mobile devices
- **Comprehensive Reporting**: HTML, JSON, JUnit, and Allure reports
- **Sauce Labs Test Suite**: Complete e-commerce testing scenarios

## 📋 Test Coverage

### 🔐 Login Tests
- Standard user login
- Locked out user validation
- Invalid credentials handling
- Empty field validation
- Problem user behavior
- Performance user testing

### 🛍️ Products Tests
- Single product addition
- Multiple products management
- Product sorting (name/price)
- Product details view
- Cart functionality
- Menu navigation

### 🛒 Cart Tests
- Add/remove items
- Cart persistence
- Multiple items handling
- Continue shopping
- Empty cart scenarios
- Item details verification

### ✅ Checkout Tests
- Complete checkout flow
- Form validation
- Order calculations
- Cancel functionality
- Multiple items checkout
- Order confirmation

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone and setup the project:**
```bash
git clone <your-repo>
cd pwrght
npm install
```

2. **Install Playwright browsers:**
```bash
npm run install:browsers
```

3. **Environment Configuration:**
Create a `.env` file in the root directory:
```bash
# Base URL for testing
BASE_URL=https://www.saucedemo.com

# Google Sheets Configuration (Optional)
GOOGLE_SHEETS_PRIVATE_KEY_ID=your_private_key_id
GOOGLE_SHEETS_PRIVATE_KEY=your_private_key
GOOGLE_SHEETS_CLIENT_EMAIL=your_client_email
GOOGLE_SHEETS_CLIENT_ID=your_client_id
GOOGLE_SHEETS_CLIENT_CERT_URL=your_client_cert_url
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id

# Test Environment
TEST_ENV=development
LOG_LEVEL=info
HEADLESS=true
```

### Google Sheets Setup (Optional)

1. **Create a Google Sheet** with the structure defined in `test-data/sample-google-sheets-structure.md`
2. **Set up Service Account:**
   - Go to Google Cloud Console
   - Create a new project or select existing
   - Enable Google Sheets API
   - Create Service Account credentials
   - Download the JSON key file
3. **Share your Google Sheet** with the service account email
4. **Extract credentials** from the JSON file to your `.env` file

## 🏃‍♂️ Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run with headed browsers
npm run test:headed

# Run with UI mode
npm run test:ui

# Run in debug mode
npm run test:debug

# Run only Sauce Labs tests
npm run test:sauce

# Show test report
npm run report
```

### Advanced Commands
```bash
# Run specific test file
npx playwright test tests/sauce-labs/login.spec.js

# Run tests with specific browser
npx playwright test --project=chromium

# Run tests with tags
npx playwright test --grep="@sauce"

# Run tests in parallel
npx playwright test --workers=4
```

## 📁 Project Structure

```
pwrght/
├── pages/                          # Page Object Models
│   ├── login-page.js              # Login page actions
│   ├── products-page.js           # Products page actions
│   ├── cart-page.js               # Cart page actions
│   └── checkout-page.js           # Checkout page actions
├── tests/                         # Test specifications
│   ├── fixtures/                  # Test fixtures and utilities
│   │   └── page-fixtures.js       # Custom fixtures
│   └── sauce-labs/               # Sauce Labs test suite
│       ├── login.spec.js         # Login functionality tests
│       ├── products.spec.js      # Products functionality tests
│       ├── cart.spec.js          # Cart functionality tests
│       └── checkout.spec.js      # Checkout functionality tests
├── utils/                         # Utility classes
│   ├── base-page.js              # Base page class with common actions
│   ├── logger.js                 # Custom logging utility
│   ├── google-sheets.js          # Google Sheets integration
│   ├── global-setup.js           # Global test setup
│   └── global-teardown.js        # Global test cleanup
├── test-data/                     # Test data and documentation
│   └── sample-google-sheets-structure.md
├── test-results/                  # Test execution artifacts
│   ├── html-report/              # HTML test reports
│   ├── logs/                     # Test execution logs
│   └── screenshots/              # Failure screenshots
├── playwright.config.js          # Playwright configuration
├── package.json                  # Project dependencies
└── README.md                     # This file
```

## 🎯 Key Features Explained

### DRY Principle Implementation

1. **Base Page Class**: Common actions like `click()`, `fill()`, `waitForElement()` with built-in logging
2. **Page Object Model**: Each page has its own class with specific locators and methods
3. **Custom Fixtures**: Reusable setup code for authentication, page objects, and test data
4. **Utility Classes**: Shared functionality for logging, data management, and configuration

### Enhanced Logging

The framework provides detailed logging that appears in HTML reports:

```javascript
// Automatic logging for all actions
await loginPage.click(this.loginButton, 'Login button');
// Logs: "Finding locator: [data-test='login-button'] (Login button)"
// Logs: "Waiting for Login button to be visible"  
// Logs: "Clicking on Login button"
// Logs: "Successfully clicked on Login button"

// Step-level logging
logger.step('User Login', 'Attempting to login with standard user');

// Custom action logging
logger.action('Filling form', 'username field with standard_user');

// Assertion logging
logger.assertion('Login successful', loginSuccessful);
```

### Google Sheets Integration

- **Dynamic Test Data**: Pull user credentials, product data, and test scenarios from Google Sheets
- **Fallback Support**: Automatic fallback to hardcoded data if Google Sheets is unavailable
- **Real-time Updates**: Update test data without code changes
- **Multiple Data Types**: Support for users, products, configurations, and test scenarios

### Test Reporting

The framework generates multiple report formats:

- **HTML Report**: Interactive report with screenshots, videos, and detailed logs
- **JSON Report**: Machine-readable results for CI/CD integration
- **JUnit Report**: Compatible with CI systems like Jenkins
- **Allure Report**: Advanced reporting with trends and analytics

## 🔧 Configuration

### Browser Configuration
Modify `playwright.config.js` to adjust:
- Browser types and versions
- Viewport sizes
- Timeout settings
- Retry logic
- Parallel execution

### Logging Configuration
Adjust logging levels in `.env`:
```bash
LOG_LEVEL=debug  # Options: error, warn, info, debug
```

### Test Data Configuration
Configure Google Sheets or modify fallback data in:
- `tests/fixtures/page-fixtures.js` (fallback data)
- `utils/google-sheets.js` (Sheets integration)

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm ci
    - run: npx playwright install --with-deps
    - run: npm test
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: test-results/
```

## 🐛 Troubleshooting

### Common Issues

1. **Google Sheets Authentication Failed**
   - Verify service account credentials
   - Check if sheet is shared with service account email
   - Ensure Google Sheets API is enabled

2. **Tests Timing Out**
   - Increase timeout values in `playwright.config.js`
   - Check network connectivity
   - Verify target application is accessible

3. **Screenshots Not Captured**
   - Ensure `test-results/screenshots/` directory exists
   - Check permissions on test results directory

### Debug Mode
Run tests in debug mode to step through execution:
```bash
npm run test:debug
```

## 📈 Best Practices

1. **Test Organization**: Group related tests in describe blocks
2. **Data Management**: Use fixtures for test data setup
3. **Error Handling**: Implement proper error handling in page objects
4. **Assertions**: Use descriptive assertion messages
5. **Maintenance**: Regularly update locators and test data
6. **Performance**: Use parallel execution for faster test runs

## 🤝 Contributing

1. Follow the existing code structure and naming conventions
2. Add appropriate logging to new page objects and tests
3. Update test data structure when adding new test scenarios
4. Include error handling for new functionality
5. Add documentation for new features

## 📝 License

MIT License - See LICENSE file for details.

---

**Happy Testing! 🎭**

