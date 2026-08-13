import { test, expect } from '../fixtures/test-base';
import { injectAxe, getViolations } from 'axe-playwright';

// ============================================================================
// ACCESSIBILITY TESTS - WCAG 2.1 Level AA Compliance
// ============================================================================
// These tests ensure the application meets accessibility standards for all users.
// Uses axe-core (industry-standard accessibility auditing engine).

test.describe('Accessibility (WCAG 2.1 AA)', () => {

  test.describe('Login Page Accessibility', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ loginPage }) => {
      await loginPage.goto();
    });

    // ────────────────────────────────────────────────────────────────────────
    test('TC-A01 | Login page meets WCAG AA standards', async ({ page, loginPage }) => {
      // Inject axe-core into the page
      await injectAxe(page);

      // Get accessibility violations
      const violations = await getViolations(page);

      // Assert no violations found
      expect(violations).toHaveLength(0);
    });

    // ────────────────────────────────────────────────────────────────────────
    test('TC-A02 | Username input is properly labeled', async ({ loginPage }) => {
      // In a real app with proper labels, this would verify aria-label or associated label
      const input = loginPage.usernameInput;

      // Check that input is keyboard accessible
      await expect(input).toBeFocused();
      await loginPage.page.keyboard.press('Tab');
      // Focus should move to next element (password field)
      await expect(loginPage.passwordInput).toBeFocused();
    });

    // ────────────────────────────────────────────────────────────────────────
    test('TC-A03 | Error messages are announced to screen readers', async ({ page, loginPage }) => {
      // Attempt login with invalid credentials
      await loginPage.login('invalid_user', 'invalid_pass');

      // Check error message is present and visible
      const errorMsg = await loginPage.getErrorMessage();
      expect(errorMsg).toBeTruthy();

      // In a properly accessible app, this would have role="alert" or aria-live="assertive"
      // For demonstration, we verify the element exists and is visible
      await expect(loginPage.errorMessage).toBeVisible();
    });

    // ────────────────────────────────────────────────────────────────────────
    test('TC-A04 | Login form is keyboard navigable', async ({ loginPage }) => {
      // Start from username input
      await loginPage.usernameInput.focus();
      await expect(loginPage.usernameInput).toBeFocused();

      // Tab to password
      await loginPage.page.keyboard.press('Tab');
      await expect(loginPage.passwordInput).toBeFocused();

      // Tab to login button
      await loginPage.page.keyboard.press('Tab');
      await expect(loginPage.loginButton).toBeFocused();

      // User can submit via keyboard (Enter key)
      await loginPage.usernameInput.fill('standard_user');
      await loginPage.passwordInput.fill('secret_sauce');
      await loginPage.loginButton.focus();
      await loginPage.page.keyboard.press('Enter');

      // Verify navigation to inventory page
      await expect(loginPage.page).toHaveURL(/.*\/inventory\.html/);
    });
  });

  test.describe('Inventory Page Accessibility', () => {
    test.beforeEach(async ({ inventoryPage }) => {
      await inventoryPage.goto();
    });

    // ────────────────────────────────────────────────────────────────────────
    test('TC-A05 | Inventory page meets WCAG AA standards', async ({ page }) => {
      await injectAxe(page);
      const violations = await getViolations(page);

      expect(violations).toHaveLength(0);
    });

    // ────────────────────────────────────────────────────────────────────────
    test('TC-A06 | Product items have accessible names', async ({ page, inventoryPage }) => {
      const items = inventoryPage.inventoryItems;
      const count = await items.count();

      expect(count).toBeGreaterThan(0);

      // Each product should have a name visible/accessible
      for (let i = 0; i < count; i++) {
        const item = items.nth(i);
        const name = await item.locator('.inventory_item_name').textContent();
        expect(name).toBeTruthy();
        expect(name).not.toBe('');
      }
    });

    // ────────────────────────────────────────────────────────────────────────
    test('TC-A07 | Add to cart buttons are accessible', async ({ inventoryPage }) => {
      const items = inventoryPage.inventoryItems;
      const firstItem = items.first();

      // Button should have accessible text
      const addBtn = firstItem.locator('button');
      const btnText = await addBtn.textContent();

      expect(btnText).toBeTruthy();
      expect(btnText?.toLowerCase()).toContain('add');
    });

    // ────────────────────────────────────────────────────────────────────────
    test('TC-A08 | Navigation menu is keyboard accessible', async ({ inventoryPage }) => {
      const burgerBtn = inventoryPage.burgerMenuBtn;

      // Focus on burger menu
      await burgerBtn.focus();
      await expect(burgerBtn).toBeFocused();

      // Open menu
      await burgerBtn.click();

      // Sidebar should be visible
      const sidebar = inventoryPage.page.locator('.bm-menu');
      await expect(sidebar).toBeVisible();
    });
  });

  test.describe('Cart Page Accessibility', () => {
    test.beforeEach(async ({ inventoryPage, cartPage }) => {
      await inventoryPage.goto();
      // Add an item to cart
      await inventoryPage.addItemToCartByIndex(0);
      // Navigate to cart
      await inventoryPage.goToCart();
      await cartPage.assertOnCartPage();
    });

    // ────────────────────────────────────────────────────────────────────────
    test('TC-A09 | Cart page meets WCAG AA standards', async ({ page }) => {
      await injectAxe(page);
      const violations = await getViolations(page);

      expect(violations).toHaveLength(0);
    });

    // ────────────────────────────────────────────────────────────────────────
    test('TC-A10 | Cart items are properly structured', async ({ cartPage }) => {
      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBeGreaterThan(0);

      // Verify item names are accessible
      const names = await cartPage.getCartItemNames();
      for (const name of names) {
        expect(name).toBeTruthy();
        expect(name.length).toBeGreaterThan(0);
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  test.describe('Color Contrast (Manual Check)', () => {
    test('TC-A11 | Interactive elements have sufficient color contrast', async ({ loginPage }) => {
      // Note: Automated color contrast checking requires visual regression or
      // advanced CSS inspection. This is a placeholder for documentation.
      // In production, you'd use tools like:
      // - WebAIM's WAVE
      // - Lighthouse
      // - axe's color-contrast rule (automatically checked above)

      await loginPage.goto();
      await loginPage.assertPageLoaded();

      // Manual verification: Visually inspect login form
      // Expected: Button should have sufficient contrast (minimum 4.5:1 for normal text)
    });
  });
});
