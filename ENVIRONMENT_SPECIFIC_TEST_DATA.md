# 🌍 Environment-Specific Test Data Guide

**Status**: ✅ Implemented  
**Date**: November 2025  
**Type**: Feature Enhancement

---

## 📖 Overview

This framework now supports **environment-specific test data** directly from Google Sheets, similar to Java properties files. You can have different test data for staging, preproduction, and production environments, and access them easily with a key-value getter pattern.

```javascript
// Example usage
const properties = await testDataProperties.getTestData('SL001');
const username = properties.get('username');      // Get value
const password = properties.getRequired('password'); // Get required value
```

---

## 🔧 How It Works

### Three-Step Process

1. **Google Sheets Setup**: Store environment-specific data in columns
2. **Fetch Data**: Use `testDataProperties.getTestData(testName)` to fetch
3. **Access Values**: Use `.get('key')` to retrieve individual values

---

## 📊 Google Sheets Format

### Option 1: Single Testdata Column with Environment Keys

**Sheet Name**: `TestData`

| testname | testdata |
|----------|----------|
| SL001 | (staging:(username:user1, password:pass1), preprod:(username:user2, password:pass2), prod:(username:user3, password:pass3)) |
| SL002 | (staging:(email:test@staging.com), preprod:(email:test@preprod.com), prod:(email:test@prod.com)) |

**Format**: Each environment has its own parentheses with key-value pairs

```
(staging:(...), preprod:(...), prod:(...))
```

### Option 2: Separate Environment Columns (Alternative)

| testname | staging_data | preprod_data | prod_data |
|----------|--------------|--------------|-----------|
| SL001 | (username:user1, password:pass1) | (username:user2, password:pass2) | (username:user3, password:pass3) |

---

## 💻 Usage Examples

### Basic Usage

```javascript
import { test, expect } from '../fixtures/page-fixtures.js';

test('SL001 - Login with environment-specific data', async ({ 
  testDataProperties, 
  loginPage, 
  logger 
}) => {
  // Fetch test data for this test on current environment
  const properties = await testDataProperties.getTestData('SL001');
  
  // Get individual values
  const username = properties.get('username');
  const password = properties.get('password');
  
  logger.step('Login', `Using username from ${testDataProperties.currentEnvironment}`);
  await loginPage.login(username, password);
  
  expect(true).toBeTruthy();
});
```

### With Default Values

```javascript
const properties = await testDataProperties.getTestData('SL002');

// Get with default if not found
const email = properties.get('email', 'default@example.com');
const role = properties.get('role', 'user');

logger.info(`Email: ${email}, Role: ${role}`);
```

### With Required Values (Throw Error if Missing)

```javascript
const properties = await testDataProperties.getTestData('SL001');

try {
  // Throws error if 'username' not found
  const username = properties.getRequired('username');
  const password = properties.getRequired('password');
} catch (error) {
  logger.error('Missing required test data field', error);
  throw error;
}
```

### Get All Data

```javascript
const properties = await testDataProperties.getTestData('SL001');

// Get all data as object
const allData = properties.getAll();
console.log(allData); 
// Output: { username: 'user1', password: 'pass1', ... }
```

### Get Multiple Values at Once

```javascript
const properties = await testDataProperties.getTestData('SL001');

// Get multiple keys
const { username, password, email } = properties.getMultiple('username', 'password', 'email');

logger.info(`Credentials: ${username}/${password}, Email: ${email}`);
```

### Check if Key Exists

```javascript
const properties = await testDataProperties.getTestData('SL001');

if (properties.has('premium_account')) {
  // Premium account logic
} else {
  // Regular account logic
}
```

---

## 🔄 TestDataProperties API

### Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `get(key, defaultValue)` | `key: string, defaultValue?: any` | `any` | Get value, return default if not found |
| `getRequired(key)` | `key: string` | `any` | Get value, throw error if not found |
| `getAll()` | none | `Object` | Get all data as object |
| `has(key)` | `key: string` | `boolean` | Check if key exists |
| `getMultiple(...keys)` | `...keys: string[]` | `Object` | Get multiple keys at once |

### Example

```javascript
class TestDataProperties {
  // Get value with optional default
  get(key, defaultValue = null) { ... }
  
  // Get value, throw if missing
  getRequired(key) { ... }
  
  // Get all data
  getAll() { ... }
  
  // Check existence
  has(key) { ... }
  
  // Get multiple keys
  getMultiple(...keys) { ... }
}
```

---

## 🌐 Running Tests with Environment-Specific Data

### Staging
```bash
ENVIRONMENT=staging npm run test:tiket
# or
npm run test:tiket:staging
```

### Preproduction
```bash
ENVIRONMENT=preprod npm run test:tiket:preprod
# or
npm run test:tiket:preprod
```

### Production
```bash
ENVIRONMENT=production npm run test:tiket:prod
# or
npm run test:tiket:prod
```

---

## 📝 Complete Example

### Google Sheets Setup

**Sheet**: `TestData`

| testname | testdata |
|----------|----------|
| LOGIN_TEST | (staging:(username:staging_user, password:staging_pass, url:https://gatotkaca.tiket.com), preprod:(username:preprod_user, password:preprod_pass, url:https://preprod.tiket.com), prod:(username:prod_user, password:prod_pass, url:https://tiket.com)) |
| BOOKING_TEST | (staging:(passenger_name:John Staging, email:john@staging.com), preprod:(passenger_name:John Preprod, email:john@preprod.com), prod:(passenger_name:John Prod, email:john@prod.com)) |

### Test Implementation

```javascript
import { test, expect } from '../fixtures/page-fixtures.js';

test('LOGIN_TEST - Login with environment-specific credentials', async ({ 
  testDataProperties, 
  loginPage, 
  logger 
}) => {
  // Current environment from ENVIRONMENT env var
  logger.info(`Running on: ${testDataProperties.currentEnvironment}`);
  
  // Get test data for this environment
  const properties = await testDataProperties.getTestData('LOGIN_TEST');
  
  // Extract values
  const username = properties.get('username');
  const password = properties.get('password');
  const url = properties.get('url');
  
  // Use in test
  logger.step('Navigate', `Going to ${url}`);
  await loginPage.goto(url);
  
  logger.step('Login', `Using credentials from ${testDataProperties.currentEnvironment}`);
  await loginPage.login(username, password);
  
  expect(loginPage.isLoggedIn()).toBeTruthy();
});

test('BOOKING_TEST - Create booking with environment-specific data', async ({ 
  testDataProperties, 
  bookingPage, 
  logger 
}) => {
  const properties = await testDataProperties.getTestData('BOOKING_TEST');
  
  const passengerName = properties.getRequired('passenger_name');
  const email = properties.getRequired('email');
  
  logger.info(`Creating booking for: ${passengerName} (${email})`);
  
  await bookingPage.fillPassengerInfo(passengerName, email);
  await bookingPage.submitBooking();
  
  expect(bookingPage.isConfirmed()).toBeTruthy();
});
```

---

## 🔀 Comparison: Before vs After

### Before (No Environment-Specific Data)

```javascript
// Had to use same data for all environments
test('Login', async ({ testData }) => {
  const user = testData.users.find(u => u.user_type === 'standard_user');
  // Always same user across all environments
  await loginPage.login(user.username, user.password);
});
```

### After (Environment-Specific)

```javascript
// Uses different data per environment
test('Login', async ({ testDataProperties }) => {
  const properties = await testDataProperties.getTestData('LOGIN_TEST');
  // Username/password changes per environment!
  const username = properties.get('username');
  const password = properties.get('password');
  await loginPage.login(username, password);
});
```

---

## 📌 Best Practices

✅ **Use Environment-Specific Data**
```javascript
// Good: Data changes per environment
const properties = await testDataProperties.getTestData('LOGIN_TEST');
const url = properties.get('url'); // Different per environment
```

❌ **Don't Hardcode URLs**
```javascript
// Bad: Same URL everywhere
await page.goto('https://gatotkaca.tiket.com');
```

✅ **Use Required for Critical Data**
```javascript
// Good: Fail fast if required data missing
const password = properties.getRequired('password');
```

⚠️ **Use Default for Optional Data**
```javascript
// Good: Fallback to default
const role = properties.get('role', 'user');
```

✅ **Log Environment Being Used**
```javascript
// Good: Document which environment's data is used
logger.info(`Using test data from: ${testDataProperties.currentEnvironment}`);
```

---

## 🚀 Advanced Usage

### Custom Data Parser

If your Google Sheets format is different, you can create a custom parser:

```javascript
// In your page object or test
const properties = await testDataProperties.getTestData('SL001');

// Parse complex nested data
const addresses = properties.get('addresses', '').split('|').map(addr => ({
  street: addr.split(',')[0],
  city: addr.split(',')[1],
}));
```

### Conditional Test Execution

```javascript
test('Premium features test', async ({ testDataProperties }) => {
  const properties = await testDataProperties.getTestData('PREMIUM_TEST');
  
  if (properties.has('premium_account')) {
    // Run premium feature tests
  } else {
    // Skip or run limited tests
    test.skip();
  }
});
```

### Data-Driven Tests

```javascript
const testCases = [
  { testName: 'LOGIN_TEST', action: 'login' },
  { testName: 'BOOKING_TEST', action: 'book' },
  { testName: 'PAYMENT_TEST', action: 'pay' },
];

for (const { testName, action } of testCases) {
  test(`${action} with environment-specific data`, async ({ testDataProperties }) => {
    const properties = await testDataProperties.getTestData(testName);
    // Use properties for test
  });
}
```

---

## 🐛 Troubleshooting

### Problem: Test data not found

```
[2025-11-01 11:28:24][WARN] - Test data for "UNKNOWN_TEST" not found
```

**Solution**: Check test name matches exactly in Google Sheets

```javascript
// Check Google Sheets has row with testname matching what you request
const properties = await testDataProperties.getTestData('SL001'); // Must exist!
```

### Problem: Key not found

```
[2025-11-01 11:28:24][WARN] - Key "username" not found in test data
```

**Solution**: Use `getRequired()` to fail fast or provide default

```javascript
// Option 1: Fail if missing (recommended for critical data)
const username = properties.getRequired('username');

// Option 2: Provide default
const username = properties.get('username', 'default_user');
```

### Problem: Wrong environment data being used

**Check**: 
```bash
# Verify ENVIRONMENT variable
echo $ENVIRONMENT

# Set it if not set
export ENVIRONMENT=staging
npm run test:tiket:staging
```

---

## 📚 Files Modified/Created

| File | Changes |
|------|---------|
| `utils/google-sheets.js` | Added `TestDataProperties` class, `getTestDataByEnvironment()` method |
| `tests/fixtures/page-fixtures.js` | Added `testDataProperties` fixture |
| `ENVIRONMENT_SPECIFIC_TEST_DATA.md` | This documentation |

---

## 🎯 Summary

✅ **Environment-Specific Data**: Different data for staging/preprod/prod  
✅ **Key-Value Access**: Use `.get('key')` pattern like Java properties  
✅ **Safe Access**: `.getRequired()` for critical data, `.get(key, default)` for optional  
✅ **Type Safe**: Returns correct types (string, number, boolean, array)  
✅ **Integrated**: Works with existing Google Sheets setup  
✅ **Automatic**: Respects `ENVIRONMENT` variable for current environment  

---

**Status**: ✅ Production Ready  
**Learn More**: See MASTER_GUIDE.md Test Data Management section

