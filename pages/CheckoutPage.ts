import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base/BasePage';

export class CheckoutPage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  readonly cartTitle: Locator;

  constructor(page: Page) {
    super(page);

    // Checkout form inputs (Step 1: Your Information)
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');

    // Action buttons
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');

    // Validation elements
    this.errorMessage = page.locator('[data-test="error"]');
    this.cartTitle = page.locator('.title');
  }

  async goto() {
    await this.navigateTo('/checkout-step-one.html');
  }

  /**
   * Fill in checkout information for Step 1
   */
  async fillCheckoutInfo(firstName: string, lastName: string, postalCode: string) {
    await this.waitAndFill(this.firstNameInput, firstName);
    await this.waitAndFill(this.lastNameInput, lastName);
    await this.waitAndFill(this.postalCodeInput, postalCode);
  }

  /**
   * Click Continue button to proceed to Step 2
   */
  async clickContinue() {
    await this.waitAndClick(this.continueButton);
  }

  /**
   * Click Cancel to return to cart
   */
  async clickCancel() {
    await this.waitAndClick(this.cancelButton);
  }

  /**
   * Get error message text if displayed
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return this.errorMessage.textContent();
    }
    return null;
  }

  /**
   * Complete full checkout flow with validation
   */
  async completeCheckoutStep1(firstName: string, lastName: string, postalCode: string) {
    await this.fillCheckoutInfo(firstName, lastName, postalCode);
    await this.clickContinue();
  }

  /**
   * Assert that we're on the checkout page
   */
  async assertOnCheckoutPage() {
    await expect(this.cartTitle).toContainText('Checkout');
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.lastNameInput).toBeVisible();
    await expect(this.postalCodeInput).toBeVisible();
  }

  /**
   * Assert a specific field shows validation error
   */
  async assertFieldError(fieldName: 'firstName' | 'lastName' | 'postalCode') {
    const errorMsg = await this.getErrorMessage();
    expect(errorMsg).toBeTruthy();
    expect(errorMsg).toContain(fieldName);
  }
}
