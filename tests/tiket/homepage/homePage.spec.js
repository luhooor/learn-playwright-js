import { test, expect } from "../../fixtures/page-fixtures.js";
import { HomePage } from "../../../pages/tiket/homepage/homePage.js";

test.describe("Tiket Test @tiket", () => {
  test("TIK001 - Verify register new user @smoke", async ({
    testDataProperties,
    page,
    logger,
  }) => {
    const properties = await testDataProperties.getTestData("TIK001");
    logger.info(`Test Data: ${JSON.stringify(properties.getAll(), null, 2)}`);
    const homePage = new HomePage(page);
    await test.step("Navigate to Home Page", async () => {
      await homePage.setTestData(properties.getAll());
      await homePage.goToHomePage();
    });
    await test.step("Click on Login Button", async () => {
      await homePage.clickOnLoginButton();
    });
    await test.step("Click on One Field Button", async () => {
      await homePage.clickOnOneFieldButton();
    });
    await test.step("Register New User", async () => {
      await homePage.registerNewUser();
    });
  });
});
