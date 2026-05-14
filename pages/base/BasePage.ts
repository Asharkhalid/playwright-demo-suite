import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Helper to perform a robust wait and click.
   */
  async waitAndClick(locator: Locator) {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  /**
   * Helper to perform a robust wait and fill.
   */
  async waitAndFill(locator: Locator, text: string) {
    await locator.waitFor({ state: 'visible' });
    await locator.fill(text);
  }

  /**
   * Abstraction for navigating to a specific URL path.
   */
  async navigateTo(path: string) {
    await this.page.goto(path);
  }
}
