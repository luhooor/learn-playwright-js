import { BasePage } from '../../../utils/base-page.js';
import { locator } from '../../../utils/locator.js';
import * as common from '../../../utils/common-function.js';

export class HomePage extends BasePage {
    constructor(page) {
        super(page);

        // Create locators with page reference for automatic resolution
        // this.CONTINUE_WITHOUT_PROMO = locator("//button[contains(@class, 'Button-module__variant_secondary')]", 'CONTINUE WITHOUT PROMO BTN', page);
        this.CONTINUE_WITHOUT_PROMO = locator(page.getByRole('button', { name: 'Lanjut tanpa promo' }), 'CONTINUE WITHOUT PROMO BTN', page);
        this.LOGIN_BUTTON = locator(page.getByRole('link', { name: 'Masuk', exact: true }), "LOGIN BTN");
        this.ONE_FIELD_BTN = locator(page.getByRole('button', { name: 'Lanjut dengan nomor HP atau' }), 'ONE FIELD BTN');
        this.ONE_FIELD_INPUT = locator(page.getByRole('textbox', { name: 'Nomor HP atau email' }), 'ONE FIELD INPUT');
        this.CONTINUE_BTN = locator('//button[contains(@class, "Button_variant_primary")]', 'CONTINUE BTN', page);
        this.FULLNAME_INPUT = locator('[data-testid="txtFullname"]', 'FULLNAME INPUT', page);
        this.EMAIL_INPUT = locator('[data-testid="txtEmail"]', 'EMAIL INPUT', page);
        this.PHONE_INPUT = locator(page.getByRole('textbox', { name: 'Nomor HP*' }), 'PHONE INPUT', page);
        this.PASSWORD_INPUT = locator('[data-testid="txtPassword"]', 'PASSWORD INPUT', page);
        this.SUBMIT_BTN = locator('[data-testid="btnSubmit"]', 'SUBMIT BTN', page);
        this.OTP_INPUT_1 = locator('[data-testid="otp-input-1"]', 'OTP INPUT 1', page);
        this.OTP_INPUT_2 = locator('[data-testid="otp-input-2"]', 'OTP INPUT 2', page);
        this.OTP_INPUT_3 = locator('[data-testid="otp-input-3"]', 'OTP INPUT 3', page);
        this.OTP_INPUT_4 = locator('[data-testid="otp-input-4"]', 'OTP INPUT 4', page);
        this.OTP_INPUT_5 = locator('[data-testid="otp-input-5"]', 'OTP INPUT 5', page);
        this.OTP_INPUT_6 = locator('[data-testid="otp-input-6"]', 'OTP INPUT 6', page);
        this.OKAY_BTN = locator('//button[contains(@class, "Button_variant_primary") and contains(., "Oke")]', 'OKAY BTN', page);
        this.NANTI_AJA_BTN = locator("//span[contains(@class, 'Setup_skip_cta')]", 'NANTI AJA BTN', page);
        this.testData;
    }

    async goToHomePage() {
        await this.goto('/');
        this.logger.info('Opening Tiket Home Page...');
        await this.waitForElement(this.CONTINUE_WITHOUT_PROMO);
        const isPromoVisible = await this.isElementVisible(this.CONTINUE_WITHOUT_PROMO);
        if (isPromoVisible) {
            await this.click(this.CONTINUE_WITHOUT_PROMO);
        }
        this.logger.info('Tiket Home Page opened successfully');
    }

    async setTestData(testData) {
        this.testData = testData;
        this.logger.info(`Test Data From Page Object: ${JSON.stringify(this.testData, null, 2)}`);
    }

    async clickOnLoginButton() {
        await this.click(this.LOGIN_BUTTON);
    }

    async clickOnOneFieldButton() {
        await this.click(this.ONE_FIELD_BTN);
    }

    async registerNewUser() {
        const phonePrefix = this.testData.phonePrefix;
        const emailDomain = this.testData.emailDomain;

        const firstName = common.generateRandomFirstName();
        const lastName = common.generateRandomLastName();
        const fullName = `${firstName} ${lastName}`;
        const email = `${firstName}.${lastName}@${emailDomain}`;
        const phoneNumber = `${phonePrefix}${common.generateRandomNumber(7)}`;

        this.testData.fullName = fullName;
        this.testData.email = email;
        this.testData.phoneNumber = `+62${phoneNumber}`;

        await this.fill(this.ONE_FIELD_INPUT, email);
        await this.click(this.CONTINUE_BTN);
        await this.fill(this.FULLNAME_INPUT, fullName);
        await this.click(this.PHONE_INPUT);
        await this.fill(this.PHONE_INPUT, phoneNumber);
        await this.fill(this.PASSWORD_INPUT, 'Testing123');
        await this.click(this.SUBMIT_BTN);
        await this.waitForElement(this.OTP_INPUT_1);
        await this.fill(this.OTP_INPUT_1, '1');
        await this.fill(this.OTP_INPUT_2, '2');
        await this.fill(this.OTP_INPUT_3, '3');
        await this.fill(this.OTP_INPUT_4, '4');
        await this.fill(this.OTP_INPUT_5, '5');
        await this.fill(this.OTP_INPUT_6, '6');
        await this.waitForElement(this.OKAY_BTN);
        await this.click(this.OKAY_BTN);
        await this.waitForElement(this.NANTI_AJA_BTN);
        await this.click(this.NANTI_AJA_BTN);

        this.logger.info(`New User Registered Successfully: ${JSON.stringify(this.testData, null, 2)}`);
    }
}