import { BasePage } from '../utils/base-page.js';
import { locator } from '../utils/locator.js';
import * as common from '../utils/common-function.js';

export class LoginPage extends BasePage {
    constructor(page) {
        super(page);

        // Locators with human-readable names built-in
        this.usernameInput = locator('[data-test="username"]', 'Username field');
        this.passwordInput = locator('[data-test="password"]', 'Password field');
        this.loginButton = locator('[data-test="login-button"]', 'Login button');
        this.errorMessage = locator('[data-test="error"]', 'Error message');
        this.loginLogo = locator('.login_logo', 'Login logo');
        this.loginCredentials = locator('#login_credentials', 'Available usernames');
        this.passwordCredentials = locator('.login_password', 'Password information');
    }

    /**
     * Navigate to login page
     */
    async navigateToLogin() {
        await this.goto('/');
        await this.waitForElement(this.loginLogo); // No need to specify name!
        this.logger.step('Navigate to Login Page', 'Successfully loaded Sauce Demo login page');
    }

    /**
     * Perform login with credentials
     * @param {string} username - Username to login with
     * @param {string} password - Password to login with
     */
    async login(username, password) {
        this.logger.step('User Login', `Attempting to login with username: ${username}`);

        await this.fill(this.usernameInput, username); // No need to specify name!
        await this.fill(this.passwordInput, password); // No need to specify name!
        await this.click(this.loginButton); // No need to specify name!

        // Wait a moment for potential redirect or error
        await this.page.waitForTimeout(1000);
    }

    /**
     * Login with standard user
     */
    async loginWithStandardUser() {
        this.logger.step('Standard User Login', 'Using standard_user credentials');
        await this.login('standard_user', 'secret_sauce');
    }

    /**
     * Login with problem user
     */
    async loginWithProblemUser() {
        this.logger.step('Problem User Login', 'Using problem_user credentials');
        await this.login('problem_user', 'secret_sauce');
    }

    /**
     * Login with locked out user
     */
    async loginWithLockedUser() {
        this.logger.step('Locked User Login', 'Using locked_out_user credentials');
        await this.login('locked_out_user', 'secret_sauce');
    }

    /**
     * Login with performance glitch user
     */
    async loginWithPerformanceUser() {
        this.logger.step('Performance User Login', 'Using performance_glitch_user credentials');
        await this.login('performance_glitch_user', 'secret_sauce');
    }

    /**
     * Verify login page is displayed
     */
    async verifyLoginPageDisplayed() {
        this.logger.step('Verify Login Page', 'Checking if login page elements are visible');

        await this.assertElementVisible(this.loginLogo); // Clean and simple!
        await this.assertElementVisible(this.usernameInput);
        await this.assertElementVisible(this.passwordInput);
        await this.assertElementVisible(this.loginButton);

        this.logger.assertion('Login page elements are visible', true);
    }

    /**
     * Verify error message is displayed
     * @param {string} expectedMessage - Expected error message
     */
    async verifyErrorMessage(expectedMessage) {
        this.logger.step('Verify Error Message', `Checking for error: ${expectedMessage}`);

        await this.waitForElement(this.errorMessage); // Much cleaner!
        await this.assertElementContainsText(this.errorMessage, expectedMessage);

        this.logger.assertion(`Error message contains: ${expectedMessage}`, true);
    }

    /**
     * Get available usernames from the page
     * @returns {Promise<string>} Available usernames text  
     */
    async getAvailableUsernames() {
        this.logger.info('Retrieving available usernames from login page');
        const usernames = await this.getText(this.loginCredentials); // Name automatically included!
        return usernames;
    }

    /**
     * Get password information from the page
     * @returns {Promise<string>} Password information text
     */
    async getPasswordInfo() {
        this.logger.info('Retrieving password information from login page');
        const passwordInfo = await this.getText(this.passwordCredentials); // Name automatically included!
        return passwordInfo;
    }

    /**
     * Clear login form
     */
    async clearLoginForm() {
        this.logger.step('Clear Login Form', 'Clearing username and password fields');

        await this.page.locator(this.usernameInput).clear();
        await this.page.locator(this.passwordInput).clear();

        this.logger.info('Login form cleared successfully');
    }

    /**
     * Verify successful login by checking URL change
     */
    async verifySuccessfulLogin() {
        this.logger.step('Verify Successful Login', 'Checking URL changed to inventory page');

        await this.page.waitForURL('**/inventory.html');
        this.logger.assertion('Successfully redirected to inventory page', true);
    }
}

