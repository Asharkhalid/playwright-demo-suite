import { Page, Locator } from '@playwright/test';
import { BasePage } from './base/BasePage';

// ---------------------------------------------------------------------------
// LoginPage – Page Object Model
// Encapsulates all selectors and actions for the SauceDemo login screen.
// ---------------------------------------------------------------------------
export class LoginPage extends BasePage {
  // ── Locators ────────────────────────────────────────────────────────────
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly errorCloseButton: Locator;
  readonly loginLogo: Locator;

  constructor(page: Page) {
    super(page);

    // Using data-test attributes where available (most stable selectors)
    this.usernameInput   = page.locator('[data-test="username"]');
    this.passwordInput   = page.locator('[data-test="password"]');
    this.loginButton     = page.locator('[data-test="login-button"]');
    this.errorMessage    = page.locator('[data-test="error"]');
    this.errorCloseButton = page.locator('.error-button');
    this.loginLogo       = page.locator('.login_logo');
  }

  // ── Navigation ──────────────────────────────────────────────────────────

  /** Navigate directly to the SauceDemo login page. */
  async goto(): Promise<void> {
    await this.navigateTo('/');
  }

  // ── Actions ─────────────────────────────────────────────────────────────

  /**
   * Fill in credentials and click Login using BasePage robust actions.
   */
  async login(username: string, password: string): Promise<void> {
    await this.waitAndFill(this.usernameInput, username);
    await this.waitAndFill(this.passwordInput, password);
    await this.waitAndClick(this.loginButton);
  }

  /**
   * Returns the text content of the visible error banner,
   * or null if no error is displayed.
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return this.errorMessage.textContent();
    }
    return null;
  }

  /** Dismiss the error banner by clicking the × button. */
  async dismissError(): Promise<void> {
    await this.waitAndClick(this.errorCloseButton);
  }

  // ── Assertions (reusable expect helpers) ────────────────────────────────

  /** Assert the login page is fully loaded and visible. */
  async assertPageLoaded(): Promise<void> {
    await this.loginLogo.waitFor({ state: 'visible' });
    await this.usernameInput.waitFor({ state: 'visible' });
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.loginButton.waitFor({ state: 'visible' });
  }
}
