import { expect } from '@playwright/test';

export class LoginPage {
  constructor(page) {
    this.page = page;

    // In selectors ko actual website ke mutabiq verify karein.
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');

    this.loginButton = page.getByRole('button', {
      name: /log in|login|sign in/i,
    });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async expectLoginPageLoaded() {
    await expect(this.page).toHaveURL(/\/login\/?$/);
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async enterCredentials(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.loginButton.click();
  }

  async login(email, password) {
    await this.enterCredentials(email, password);
    await this.submit();
  }
}
