import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base/BasePage';

export class CartPage extends BasePage {
  readonly cartTitle: Locator;
  readonly cartItems: Locator;
  readonly cartItemQuantities: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;
  readonly cartBadge: Locator;
  readonly removeButtons: Locator;

  constructor(page: Page) {
    super(page);

    this.cartTitle = page.locator('.title');
    this.cartItems = page.locator('.cart_item');
    this.cartItemQuantities = page.locator('.cart_quantity');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.removeButtons = page.locator('button:has-text("Remove")');
  }

  async goto() {
    await this.navigateTo('/cart.html');
  }

  /**
   * Get the number of items currently in the cart
   */
  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * Get the cart badge count (e.g., "2" in the badge)
   */
  async getCartBadgeCount(): Promise<string | null> {
    if (await this.cartBadge.isVisible()) {
      return await this.cartBadge.textContent();
    }
    return null;
  }

  /**
   * Remove an item from the cart by index
   */
  async removeItemByIndex(index: number) {
    const removeBtn = this.cartItems.nth(index).locator('button:has-text("Remove")');
    await this.waitAndClick(removeBtn);
  }

  /**
   * Click Continue Shopping to return to inventory
   */
  async clickContinueShopping() {
    await this.waitAndClick(this.continueShoppingButton);
  }

  /**
   * Click Checkout to proceed to checkout
   */
  async clickCheckout() {
    await this.waitAndClick(this.checkoutButton);
  }

  /**
   * Get item names/descriptions from the cart
   */
  async getCartItemNames(): Promise<string[]> {
    const items = this.page.locator('.cart_item_label');
    const count = await items.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const name = await items.nth(i).locator('.inventory_item_name').textContent();
      if (name) names.push(name.trim());
    }
    return names;
  }

  /**
   * Assert cart page is loaded
   */
  async assertOnCartPage() {
    await expect(this.cartTitle).toContainText('Cart');
    await expect(this.continueShoppingButton).toBeVisible();
    await expect(this.checkoutButton).toBeVisible();
  }

  /**
   * Assert cart is empty
   */
  async assertCartEmpty() {
    const itemCount = await this.getCartItemCount();
    expect(itemCount).toBe(0);
  }

  /**
   * Assert specific number of items in cart
   */
  async assertCartItemCount(expectedCount: number) {
    const itemCount = await this.getCartItemCount();
    expect(itemCount).toBe(expectedCount);
  }
}
