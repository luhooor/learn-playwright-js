import { test, expect } from '../fixtures/page-fixtures.js';

test.describe('Sauce Labs - Login Functionality @sauce', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.navigateToLogin();
    });

    test('SL001 - Standard user successful login @smoke', async ({ loginPage, testData, logger }) => {
        logger.step('Test Start', 'Testing standard user login functionality');

        const standardUser = testData.users.find(user => user.user_type === 'standard_user');

        await test.step('Verify login page elements', async () => {
            await loginPage.verifyLoginPageDisplayed();
        });

        await test.step('Login with standard user credentials', async () => {
            await loginPage.login(standardUser.username, standardUser.password);
            await loginPage.verifySuccessfulLogin();
        });

        await test.step('Verify successful redirect to products page', async () => {
            // Just verify we're on the right page after login
            await loginPage.page.waitForURL('**/inventory.html');
            logger.assertion('Successfully redirected to products/inventory page', true);
        });
    });

    test('SL008 - Locked out user cannot login', async ({ loginPage, testData, logger }) => {
        logger.step('Test Start', 'Testing locked out user login restriction');

        const lockedUser = testData.users.find(user => user.user_type === 'locked_out_user');

        await test.step('Attempt login with locked user', async () => {
            await loginPage.login(lockedUser.username, lockedUser.password);
        });

        await test.step('Verify error message displayed', async () => {
            await loginPage.verifyErrorMessage('Epic sadface: Sorry, this user has been locked out.');
        });

        await test.step('Verify still on login page', async () => {
            await expect(loginPage.page).toHaveURL(/.*\/(index\.html)?$/);
        });
    });

    test('SL011 - Invalid credentials login attempt @smoke', async ({ loginPage, logger }) => {
        logger.step('Test Start', 'Testing login with invalid credentials');

        await test.step('Attempt login with invalid credentials', async () => {
            await loginPage.login('invalid_user', 'wrong_password');
        });

        await test.step('Verify error message displayed', async () => {
            await loginPage.verifyErrorMessage('Epic sadface: Username and password do not match any user in this service');
        });
    });

    test('SL012 - Empty credentials validation @smoke', async ({ loginPage, logger }) => {
        logger.step('Test Start', 'Testing login form validation with empty fields');

        await test.step('Attempt login with empty username', async () => {
            await loginPage.login('', 'secret_sauce');
            await loginPage.verifyErrorMessage('Epic sadface: Username is required');
        });

        await test.step('Clear form and attempt login with empty password', async () => {
            await loginPage.clearLoginForm();
            await loginPage.login('standard_user', '');
            await loginPage.verifyErrorMessage('Epic sadface: Password is required');
        });
    });

    test('SL013 - Problem user login and verification', async ({ loginPage, testData, logger }) => {
        logger.step('Test Start', 'Testing problem user login and behavior');

        const problemUser = testData.users.find(user => user.user_type === 'problem_user');

        await test.step('Login with problem user', async () => {
            await loginPage.login(problemUser.username, problemUser.password);
            await loginPage.verifySuccessfulLogin();
        });

        await test.step('Verify redirect after login (problem user may have UI issues)', async () => {
            // Just verify we're on the right page - problem user might have broken images
            await loginPage.page.waitForURL('**/inventory.html');
            logger.assertion('Problem user successfully logged in and redirected', true);
            // Note: Problem user might have broken images or other UI issues
            // This test validates that core login functionality still works
        });
    });

    test('SL014 - Performance glitch user login', async ({ loginPage, testData, logger }) => {
        logger.step('Test Start', 'Testing performance glitch user login');

        const performanceUser = testData.users.find(user => user.user_type === 'performance_glitch_user');

        await test.step('Login with performance user (expect slower response)', async () => {
            const startTime = Date.now();
            await loginPage.login(performanceUser.username, performanceUser.password);
            await loginPage.verifySuccessfulLogin();
            const loginTime = Date.now() - startTime;

            logger.info(`Login completed in ${loginTime}ms (performance user typically slower)`);
        });

        await test.step('Verify redirect after login', async () => {
            await loginPage.page.waitForURL('**/inventory.html');
            logger.assertion('Performance user successfully logged in and redirected', true);
        });
    });

    test('SL015 - Login page information display', async ({ loginPage, logger }) => {
        logger.step('Test Start', 'Verifying login page displays user information correctly');

        await test.step('Verify available usernames are displayed', async () => {
            const usernames = await loginPage.getAvailableUsernames();
            expect(usernames).toContain('standard_user');
            expect(usernames).toContain('locked_out_user');
            expect(usernames).toContain('problem_user');
            expect(usernames).toContain('performance_glitch_user');
        });

        await test.step('Verify password information is displayed', async () => {
            const passwordInfo = await loginPage.getPasswordInfo();
            expect(passwordInfo).toContain('secret_sauce');
        });
    });
});

