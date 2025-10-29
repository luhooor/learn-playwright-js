# 🎓 HOW TO: Write Test Cases with This Framework

## 📚 **Learning Path Overview**

This guide will teach you step-by-step how to create test cases using the Playwright SDET framework. You'll learn by building real test scenarios from scratch!

## 🎯 **What You'll Learn**

1. **Page Object Model** - How to create page classes
2. **Enhanced Locator System** - Using the new locator() approach  
3. **Test Structure** - Writing clean, maintainable tests
4. **Custom Fixtures** - Leveraging the framework's power
5. **Logging & Debugging** - Understanding the detailed output

---

## 🚀 **Tutorial 1: Create Your First Page Object**

Let's create a **Products Page** to handle the inventory/products functionality.

### **Step 1: Create the Page Object File**

Create `pages/products-page.js`:

```javascript
import { BasePage } from '../utils/base-page.js';
import { locator } from '../utils/locator.js';

export class ProductsPage extends BasePage {
  constructor(page) {
    super(page);
    
    // 🎯 Define locators with human-readable names
    this.pageTitle = locator('.title', 'Page title');
    this.inventoryList = locator('.inventory_list', 'Product inventory');
    this.productItems = locator('.inventory_item', 'Product items');
    this.sortDropdown = locator('[data-test="product_sort_container"]', 'Sort dropdown');
    this.cartButton = locator('.shopping_cart_link', 'Shopping cart button');
    this.cartBadge = locator('.shopping_cart_badge', 'Cart item count badge');
  }

  /**
   * Verify the products page has loaded correctly
   */
  async verifyProductsPageLoaded() {
    this.logger.step('Verify Products Page', 'Checking if products page loaded correctly');
    
    await this.waitForElement(this.pageTitle);
    await this.assertElementContainsText(this.pageTitle, 'Products');
    await this.assertElementVisible(this.inventoryList);
    
    this.logger.assertion('Products page loaded successfully', true);
  }

  /**
   * Get all product names from the page
   * @returns {Promise<Array>} Array of product names
   */
  async getAllProductNames() {
    this.logger.info('Getting all product names from the page');
    
    // Wait for products to load
    await this.waitForElement(this.inventoryList);
    
    // Get all product name elements
    const productNames = await this.page.locator('.inventory_item_name').allTextContents();
    
    this.logger.info(`Found ${productNames.length} products: ${productNames.join(', ')}`);
    return productNames;
  }

  /**
   * Add a product to cart by name
   * @param {string} productName - Name of product to add
   */
  async addProductToCart(productName) {
    this.logger.step('Add Product to Cart', `Adding "${productName}" to shopping cart`);
    
    // Find the product container
    const productItem = this.page.locator('.inventory_item').filter({ hasText: productName });
    const addButton = productItem.locator('button[id*="add-to-cart"]');
    
    this.logger.info(`Clicking add to cart for: ${productName}`);
    await addButton.click();
    
    this.logger.assertion(`${productName} added to cart successfully`, true);
  }

  /**
   * Get current cart item count
   * @returns {Promise<number>} Number of items in cart
   */
  async getCartItemCount() {
    this.logger.info('Getting cart item count');
    
    try {
      const badge = this.page.locator(this.cartBadge.selector);
      const isVisible = await badge.isVisible();
      
      if (isVisible) {
        const count = await badge.textContent();
        this.logger.info(`Cart has ${count} items`);
        return parseInt(count);
      } else {
        this.logger.info('Cart is empty (no badge visible)');
        return 0;
      }
    } catch (error) {
      this.logger.info('Cart is empty (badge element not found)');
      return 0;
    }
  }
}
```

### **Step 2: Add the Page Object to Fixtures**

Update `tests/fixtures/page-fixtures.js` to include your new page:

```javascript
// Add this import at the top
import { ProductsPage } from '../../pages/products-page.js';

// Add this fixture in the test.extend() section
productsPage: async ({ page }, use) => {
  const productsPage = new ProductsPage(page);
  await use(productsPage);
},
```

### **Step 3: Create Your First Test**

Create `tests/sauce-labs/products.spec.js`:

```javascript
import { test, expect } from '../fixtures/page-fixtures.js';

test.describe('Products Page Functionality @sauce', () => {
  
  test.beforeEach(async ({ authenticatedPage }) => {
    // This fixture automatically logs you in before each test!
    // The user is already on the products page after login
  });

  test('Should display products page correctly', async ({ productsPage, logger }) => {
    logger.step('Test Start', 'Testing products page displays correctly');

    await test.step('Verify products page elements', async () => {
      await productsPage.verifyProductsPageLoaded();
    });

    await test.step('Check products are visible', async () => {
      const productNames = await productsPage.getAllProductNames();
      expect(productNames.length).toBeGreaterThan(0);
      logger.assertion(`Found ${productNames.length} products on page`, productNames.length > 0);
    });
  });

  test('Should add product to cart', async ({ productsPage, logger }) => {
    logger.step('Test Start', 'Testing add product to cart functionality');

    await test.step('Get initial cart count', async () => {
      const initialCount = await productsPage.getCartItemCount();
      expect(initialCount).toBe(0);
      logger.info(`Initial cart count: ${initialCount}`);
    });

    await test.step('Add product to cart', async () => {
      await productsPage.addProductToCart('Sauce Labs Backpack');
    });

    await test.step('Verify cart count increased', async () => {
      const newCount = await productsPage.getCartItemCount();
      expect(newCount).toBe(1);
      logger.assertion('Cart count increased to 1', newCount === 1);
    });
  });
});
```

---

## 🧪 **Tutorial 2: Understanding the Framework Components**

### **🎯 Enhanced Locator System**

Instead of repeating element names:
```javascript
// ❌ OLD WAY (repetitive)
this.submitButton = '[data-test="submit"]';
await this.click(this.submitButton, 'Submit button'); // Had to repeat name

// ✅ NEW WAY (DRY)
this.submitButton = locator('[data-test="submit"]', 'Submit button');
await this.click(this.submitButton); // Name automatically included!
```

### **🎭 Page Object Benefits**

1. **Centralized Locators**: All selectors in one place
2. **Business Methods**: `addProductToCart()` instead of raw clicks
3. **Reusability**: Use across multiple tests
4. **Maintainability**: Change UI once, updates everywhere

### **🔧 Custom Fixtures**

The framework provides these fixtures automatically:

- `loginPage` - Login page object
- `authenticatedPage` - Page that's already logged in
- `testData` - Test data from Google Sheets or fallback
- `sheetsManager` - Google Sheets integration
- `logger` - Enhanced logging system

---

## 🎯 **Tutorial 3: Advanced Test Patterns**

### **Pattern 1: Data-Driven Testing**

```javascript
test('Should handle different user types', async ({ loginPage, testData, logger }) => {
  for (const user of testData.users) {
    await test.step(`Test login for ${user.user_type}`, async () => {
      logger.step('User Test', `Testing ${user.user_type} login`);
      
      await loginPage.navigateToLogin();
      await loginPage.login(user.username, user.password);
      
      if (user.user_type === 'locked_out_user') {
        await loginPage.verifyErrorMessage('Sorry, this user has been locked out');
      } else {
        await loginPage.verifySuccessfulLogin();
      }
    });
  }
});
```

### **Pattern 2: Page Navigation**

```javascript
test('Should navigate through pages', async ({ loginPage, productsPage, logger }) => {
  logger.step('Test Start', 'Testing page navigation flow');

  await test.step('Login to application', async () => {
    await loginPage.navigateToLogin();
    await loginPage.loginWithStandardUser();
  });

  await test.step('Verify products page', async () => {
    await productsPage.verifyProductsPageLoaded();
  });

  await test.step('Add product and verify', async () => {
    await productsPage.addProductToCart('Sauce Labs Backpack');
    const count = await productsPage.getCartItemCount();
    expect(count).toBe(1);
  });
});
```

### **Pattern 3: Error Handling**

```javascript
test('Should handle error scenarios gracefully', async ({ loginPage, logger }) => {
  logger.step('Test Start', 'Testing error handling');

  await test.step('Test invalid credentials', async () => {
    await loginPage.navigateToLogin();
    await loginPage.login('invalid_user', 'wrong_password');
    await loginPage.verifyErrorMessage('Username and password do not match');
  });

  await test.step('Test empty fields', async () => {
    await loginPage.clearLoginForm();
    await loginPage.login('', '');
    await loginPage.verifyErrorMessage('Username is required');
  });
});
```

---

## 🚀 **Tutorial 4: Running and Debugging Tests**

### **Running Your Tests**

```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/sauce-labs/products.spec.js

# Run with visible browser (great for learning!)
npm run test:headed

# Run specific test by name
npx playwright test --grep "Should add product to cart"

# Run with debug mode (pauses execution)
npx playwright test --debug
```

### **Understanding the Logs**

When you run tests, you'll see detailed logs like:
```
🔸 STEP: Test Start: Testing add product to cart functionality
ℹ️  Getting cart item count
ℹ️  Cart is empty (no badge visible)
🔸 STEP: Add Product to Cart: Adding "Sauce Labs Backpack" to shopping cart
ℹ️  Clicking add to cart for: Sauce Labs Backpack
✅ PASSED: Sauce Labs Backpack added to cart successfully
ℹ️  Getting cart item count
ℹ️  Cart has 1 items
✅ PASSED: Cart count increased to 1
```

This detailed logging helps you understand exactly what's happening!

---

## 🎯 **Tutorial 5: Your Practice Exercises**

### **Exercise 1: Create Cart Page**
Create `pages/cart-page.js` with methods:
- `verifyCartPageLoaded()`
- `getCartItems()`
- `removeItemFromCart(productName)`
- `proceedToCheckout()`

### **Exercise 2: Create Cart Tests**
Create `tests/sauce-labs/cart.spec.js` with tests:
- "Should display cart page correctly"
- "Should remove items from cart"
- "Should show empty cart message"

### **Exercise 3: Create Checkout Flow**
Create `pages/checkout-page.js` and corresponding tests for:
- Form filling
- Order validation
- Checkout completion

---

## 🛠️ **Framework Tools & Helpers**

### **BasePage Methods Available**

Your page objects inherit these methods from `BasePage`:

```javascript
// Navigation
await this.goto(url)

// Element Interactions  
await this.click(locator)
await this.fill(locator, value)
await this.selectDropdown(locator, value)

// Waiting & Verification
await this.waitForElement(locator)
await this.assertElementVisible(locator)
await this.assertElementContainsText(locator, text)
await this.getText(locator)

// Utilities
await this.takeScreenshot(name)
await this.waitForPageLoad()
```

### **Logger Methods Available**

```javascript
// Step logging (shows in reports)
this.logger.step('Step Name', 'Description')

// Information logging
this.logger.info('Finding elements...')

// Assertion logging
this.logger.assertion('Login successful', true)

// Error logging
this.logger.error('Something went wrong', error)
```

---

## 🎯 **Best Practices**

### **1. Page Object Structure**
```javascript
export class YourPage extends BasePage {
  constructor(page) {
    super(page);
    
    // 🎯 Group locators logically
    // Form elements
    this.usernameInput = locator('[data-test="username"]', 'Username field');
    this.passwordInput = locator('[data-test="password"]', 'Password field');
    
    // Buttons
    this.loginButton = locator('[data-test="login-button"]', 'Login button');
    this.cancelButton = locator('[data-test="cancel-button"]', 'Cancel button');
    
    // Messages
    this.errorMessage = locator('[data-test="error"]', 'Error message');
  }

  // 🎯 Create business-focused methods
  async login(username, password) {
    // Implementation
  }

  async verifyLoginSuccess() {
    // Implementation  
  }
}
```

### **2. Test Structure**
```javascript
test('Should do something specific', async ({ pageName, logger }) => {
  logger.step('Test Start', 'Clear description of what we are testing');

  await test.step('Setup or given state', async () => {
    // Arrange
  });

  await test.step('Execute the action', async () => {
    // Act
  });

  await test.step('Verify the result', async () => {
    // Assert
  });
});
```

### **3. Use Descriptive Names**
```javascript
// ✅ Good
await this.click(this.addToCartButton);
await this.verifyProductAddedToCart(productName);

// ❌ Avoid
await this.click('.btn');
await this.checkStuff();
```

---

## 🎭 **Ready to Start!**

1. **Start with Products Page**: Follow Tutorial 1 step-by-step
2. **Run your test**: `npx playwright test tests/sauce-labs/products.spec.js --headed`
3. **Watch the logs**: See your detailed logging in action
4. **Iterate**: Add more methods and tests
5. **Ask questions**: Use the existing login tests as reference

### **Next Steps**
- Create `cart-page.js` and `checkout-page.js`
- Add more test scenarios
- Experiment with the Google Sheets integration
- Explore the advanced logging features

## 🏆 **You're Ready!**

The framework is set up for you to learn by doing. Start with the products page tutorial above, and gradually build more complex test scenarios. The enhanced locator system, detailed logging, and DRY architecture will make your tests clean, maintainable, and professional.

**Happy Testing!** 🎭✨

---

### 📚 **Reference Files**
- `pages/login-page.js` - Example page object
- `tests/sauce-labs/login.spec.js` - Example test file  
- `tests/fixtures/page-fixtures.js` - Available fixtures
- `utils/base-page.js` - Available methods
- `ENHANCED_LOCATOR_SYSTEM.md` - Locator system details
