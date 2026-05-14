import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base/BasePage';

export class InventoryPage extends BasePage {
  readonly title: Locator;
  readonly inventoryItems: Locator;
  readonly sortDropdown: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly burgerMenuBtn: Locator;
  readonly logoutSidebarLink: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('.title');
    this.inventoryItems = page.locator('.inventory_item');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
    this.burgerMenuBtn = page.locator('#react-burger-menu-btn');
    this.logoutSidebarLink = page.locator('#logout_sidebar_link');
  }

  async goto() {
    await this.navigateTo('/inventory.html');
  }

  async addItemToCartByIndex(index: number) {
    const itemButton = this.inventoryItems.nth(index).locator('button');
    await this.waitAndClick(itemButton);
  }

  async goToCart() {
    await this.waitAndClick(this.cartLink);
  }

  async logout() {
    await this.waitAndClick(this.burgerMenuBtn);
    await this.waitAndClick(this.logoutSidebarLink);
  }

  async assertOnInventoryPage() {
    await expect(this.title).toHaveText('Products');
    await expect(this.page).toHaveURL(/.*\/inventory\.html/);
  }
}
