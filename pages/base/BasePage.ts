import { Page, Locator, expect } from '@playwright/test';

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

  // ─────────────────────────────────────────────────────────────────────────
  // Reusable Assertion Helpers (DRY principle)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Assert multiple locators are visible.
   */
  async assertVisible(...locators: Locator[]) {
    for (const locator of locators) {
      await expect(locator).toBeVisible();
    }
  }

  /**
   * Assert multiple locators are NOT visible.
   */
  async assertNotVisible(...locators: Locator[]) {
    for (const locator of locators) {
      await expect(locator).not.toBeVisible();
    }
  }

  /**
   * Assert multiple locators are enabled.
   */
  async assertEnabled(...locators: Locator[]) {
    for (const locator of locators) {
      await expect(locator).toBeEnabled();
    }
  }

  /**
   * Assert multiple locators are disabled.
   */
  async assertDisabled(...locators: Locator[]) {
    for (const locator of locators) {
      await expect(locator).toBeDisabled();
    }
  }

  /**
   * Assert a locator contains text (substring match).
   */
  async assertTextContains(locator: Locator, expectedText: string) {
    await expect(locator).toContainText(expectedText);
  }

  /**
   * Assert a locator has exact text match.
   */
  async assertExactText(locator: Locator, expectedText: string) {
    await expect(locator).toHaveText(expectedText);
  }

  /**
   * Assert all elements matching a selector contain expected text.
   */
  async assertAllContainText(selector: string, expectedText: string) {
    const items = this.page.locator(selector);
    const count = await items.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      expect(text).toContain(expectedText);
    }
  }

  /**
   * Assert URL matches a pattern.
   */
  async assertUrlMatches(pattern: RegExp) {
    await expect(this.page).toHaveURL(pattern);
  }

  /**
   * Assert element has a specific attribute value.
   */
  async assertAttribute(locator: Locator, attrName: string, expectedValue: string) {
    const value = await locator.getAttribute(attrName);
    expect(value).toBe(expectedValue);
  }

  /**
   * Assert element count matches expectation.
   */
  async assertElementCount(selector: string, expectedCount: number) {
    const count = await this.page.locator(selector).count();
    expect(count).toBe(expectedCount);
  }
}
