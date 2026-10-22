import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page.js';

import 'dotenv/config';

test.describe('Reaixo Login | Regression Suite', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // LOGIN-001
  // Type: Functional / UI
  // Priority: High
  // Precondition: Application accessible.
  // Expected: Correct login URL and required controls visible.
  test('LOGIN-001: Login page loads successfully', async () => {
    await loginPage.expectLoginPageLoaded();
  });

  // LOGIN-002
  // Type: Negative / Validation
  // Priority: High
  // Test data: Email = empty, Password = empty.
  // Expected: Empty submission rejected according to requirements.
  test('LOGIN-002: Submit empty login form', async ({ page }) => {
    await loginPage.submit();

    const email = loginPage.emailInput;
    const password = loginPage.passwordInput;

    // Browser-level required-field validation.
    const emailMissing = await email.evaluate((el) => el.validity.valueMissing);

    const passwordMissing = await password.evaluate(
      (el) => el.validity.valueMissing,
    );

    // The form must not navigate away to an authenticated page.
    await expect(page).toHaveURL(/\/login\/?$/);

    expect(
      emailMissing || passwordMissing,
      'At least one required field should trigger native validation',
    ).toBeTruthy();
  });

  // LOGIN-003
  // Type: Negative / Security
  // Priority: High
  // Precondition: Authorized test email available.
  // Test data: Registered email + deliberately incorrect password.
  // Expected: Authentication rejected; protected page inaccessible.
  test('LOGIN-003: Reject incorrect password', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL;

    test.skip(!email, 'Set TEST_USER_EMAIL in local .env');

    await loginPage.login(email, 'DefinitelyWrong-Password-123!');

    // Verify the user was not redirected to an authenticated route.
    await expect(page).toHaveURL(/\/login\/?$/);
  });

  // LOGIN-004
  // Type: Positive / Functional
  // Priority: Critical
  // Precondition: Valid authorized test account configured.
  // Expected: Successful authentication and protected-page access.
  // // LOGIN-004
  test('LOGIN-004: Login with valid credentials', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    test.skip(
      !email || !password,
      'Configure TEST_USER_EMAIL and TEST_USER_PASSWORD',
    );

    await loginPage.login(email, password);

    // Verify successful login redirects to the client home page.
    await expect(page).toHaveURL('https://reaixo.com/client/home', {
      timeout: 15000,
    });
  });

  // LOGIN-005
  // Type: UI / Security
  // Priority: Medium
  // Test data: Non-sensitive dummy password.
  // Expected: Password field is masked by default.
  test('LOGIN-005: Verify password masking', async () => {
    await loginPage.passwordInput.fill('DummyPassword123!');

    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  // LOGIN-006
  // Type: Negative / Validation
  // Priority: High
  // Test data: atif, atif@, atif.example.com
  // Expected: Invalid email format rejected before authentication.
  test('LOGIN-006: Reject invalid email format', async () => {
    const invalidEmails = ['atif', 'atif@', 'atif.example.com'];

    for (const email of invalidEmails) {
      await loginPage.emailInput.fill(email);
      await loginPage.passwordInput.fill('DummyPassword123!');

      const validity = await loginPage.emailInput.evaluate((el) => ({
        typeMismatch: el.validity.typeMismatch,
        valueMissing: el.validity.valueMissing,
      }));

      expect(
        validity.typeMismatch || validity.valueMissing,
        `Expected browser validation for: ${email}`,
      ).toBeTruthy();
    }
  });
});
