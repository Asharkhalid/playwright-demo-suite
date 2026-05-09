import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

// ---------------------------------------------------------------------------
// Test data – SauceDemo exposes several built-in test accounts
// ---------------------------------------------------------------------------
const CREDENTIALS = {
  standard:       { username: 'standard_user',       password: 'secret_sauce' },
  lockedOut:      { username: 'locked_out_user',     password: 'secret_sauce' },
  problemUser:    { username: 'problem_user',         password: 'secret_sauce' },
  performanceGlitch: { username: 'performance_glitch_user', password: 'secret_sauce' },
  errorUser:      { username: 'error_user',           password: 'secret_sauce' },
  visualUser:     { username: 'visual_user',          password: 'secret_sauce' },
};

const WRONG_PASSWORD  = 'wrong_password';
const WRONG_USERNAME  = 'unknown_user';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const INVENTORY_URL_PATTERN = /.*\/inventory\.html/;

// ============================================================================
// SUITE 1 – Login Page
// ============================================================================
test.describe('Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // --------------------------------------------------------------------------
  test('TC-L01 | Login page loads with all required elements', async () => {
    await loginPage.assertPageLoaded();

    await expect(loginPage.loginLogo).toBeVisible();
    await expect(loginPage.loginLogo).toContainText('Swag Labs');
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeEnabled();
  });

  // --------------------------------------------------------------------------
  test('TC-L02 | Standard user logs in successfully', async ({ page }) => {
    await loginPage.login(
      CREDENTIALS.standard.username,
      CREDENTIALS.standard.password,
    );

    await expect(page).toHaveURL(INVENTORY_URL_PATTERN);
    await expect(page.locator('.title')).toHaveText('Products');
  });

  // --------------------------------------------------------------------------
  test('TC-L03 | Locked-out user sees descriptive error', async () => {
    await loginPage.login(
      CREDENTIALS.lockedOut.username,
      CREDENTIALS.lockedOut.password,
    );

    const error = await loginPage.getErrorMessage();
    expect(error).toContain('Sorry, this user has been locked out');
  });

  // --------------------------------------------------------------------------
  test('TC-L04 | Wrong password shows error and stays on login page', async ({ page }) => {
    await loginPage.login(CREDENTIALS.standard.username, WRONG_PASSWORD);

    await expect(loginPage.errorMessage).toBeVisible();
    const error = await loginPage.getErrorMessage();
    expect(error).toContain('Username and password do not match');
    await expect(page).toHaveURL('/');
  });

  // --------------------------------------------------------------------------
  test('TC-L05 | Unknown username shows error', async () => {
    await loginPage.login(WRONG_USERNAME, CREDENTIALS.standard.password);

    const error = await loginPage.getErrorMessage();
    expect(error).toContain('Username and password do not match');
  });

  // --------------------------------------------------------------------------
  test('TC-L06 | Empty username shows validation error', async () => {
    await loginPage.login('', CREDENTIALS.standard.password);

    const error = await loginPage.getErrorMessage();
    expect(error).toContain('Username is required');
  });

  // --------------------------------------------------------------------------
  test('TC-L07 | Empty password shows validation error', async () => {
    await loginPage.login(CREDENTIALS.standard.username, '');

    const error = await loginPage.getErrorMessage();
    expect(error).toContain('Password is required');
  });

  // --------------------------------------------------------------------------
  test('TC-L08 | Both fields empty shows validation error', async () => {
    await loginPage.login('', '');

    const error = await loginPage.getErrorMessage();
    expect(error).toContain('Username is required');
  });
});

// ============================================================================
// SUITE 2 – Inventory / Product Listing
// ============================================================================
test.describe('Inventory Page', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      CREDENTIALS.standard.username,
      CREDENTIALS.standard.password,
    );
    await expect(page).toHaveURL(INVENTORY_URL_PATTERN);
  });

  // --------------------------------------------------------------------------
  test('TC-I01 | Inventory page displays 6 products', async ({ page }) => {
    const items = page.locator('.inventory_item');
    await expect(items).toHaveCount(6);
  });

  // --------------------------------------------------------------------------
  test('TC-I02 | Every product card has a name, price and Add-to-Cart button', async ({ page }) => {
    const items = page.locator('.inventory_item');
    const count = await items.count();

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      await expect(item.locator('.inventory_item_name')).toBeVisible();
      await expect(item.locator('.inventory_item_price')).toBeVisible();
      await expect(item.locator('button')).toBeVisible();
    }
  });

  // --------------------------------------------------------------------------
  test('TC-I03 | Products can be sorted Z→A', async ({ page }) => {
    await page.locator('[data-test="product-sort-container"]').selectOption('za');

    const names  = page.locator('.inventory_item_name');
    const texts  = await names.allTextContents();
    const sorted = [...texts].sort().reverse();
    expect(texts).toEqual(sorted);
  });

  // --------------------------------------------------------------------------
  test('TC-I04 | Products can be sorted by price low→high and high→low', async ({ page }) => {
    await page.locator('[data-test="product-sort-container"]').selectOption('lohi');

    const prices = page.locator('.inventory_item_price');
    const values = (await prices.allTextContents()).map(p => parseFloat(p.replace('$', '')));
    const sorted = [...values].sort((a, b) => a - b);
    expect(values).toEqual(sorted);
    
    await page.locator('[data-test="product-sort-container"]').selectOption('hilo');

    const hiloPrices = page.locator('.inventory_item_price');
    const hiloValues = (await hiloPrices.allTextContents()).map(p => parseFloat(p.replace('$', '')));
    const hiloSorted = [...hiloValues].sort((a, b) => b - a);
    expect(hiloValues).toEqual(hiloSorted);
  });

  // --------------------------------------------------------------------------
  test('TC-I05 | Clicking a product name navigates to its detail page', async ({ page }) => {
    const firstItemName = await page.locator('.inventory_item_name').first().textContent();
    await page.locator('.inventory_item_name').first().click();

    await expect(page).toHaveURL(/.*\/inventory-item\.html/);
    await expect(page.locator('.inventory_details_name')).toHaveText(firstItemName!);
  });

  // --------------------------------------------------------------------------
  test('TC-I06 | Cart badge count increases when item is added', async ({ page }) => {
    await page.locator('.inventory_item button').first().click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  // --------------------------------------------------------------------------
  test('TC-I07 | Cart badge count reflects multiple added items', async ({ page }) => {
    const addButtons = page.locator('.inventory_item button');
    await addButtons.nth(0).click();
    await addButtons.nth(1).click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
  });

  // --------------------------------------------------------------------------
  test('TC-I08 | Add-to-Cart button toggles to Remove after click', async ({ page }) => {
    const firstBtn = page.locator('.inventory_item button').first();
    await firstBtn.click();
    await expect(firstBtn).toHaveText('Remove');
  });
});

// ============================================================================
// SUITE 3 – Shopping Cart
// ============================================================================
test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      CREDENTIALS.standard.username,
      CREDENTIALS.standard.password,
    );
    // Add first two items to the cart
    await page.locator('.inventory_item button').nth(0).click();
    await page.locator('.inventory_item button').nth(1).click();
    // Navigate to the cart
    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(/.*\/cart\.html/);
  });

  // --------------------------------------------------------------------------
  test('TC-C01 | Cart page displays exactly 2 items', async ({ page }) => {
    await expect(page.locator('.cart_item')).toHaveCount(2);
  });

  // --------------------------------------------------------------------------
  test('TC-C02 | Each cart item shows name, price, quantity and Remove button', async ({ page }) => {
    const items = page.locator('.cart_item');
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      await expect(item.locator('.inventory_item_name')).toBeVisible();
      await expect(item.locator('.inventory_item_price')).toBeVisible();
      await expect(item.locator('.cart_quantity')).toBeVisible();
      await expect(item.locator('button')).toBeVisible();
    }
  });

  // --------------------------------------------------------------------------
  test('TC-C03 | Removing an item decrements the cart badge', async ({ page }) => {
    await page.locator('.cart_item button').first().click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  // --------------------------------------------------------------------------
  test('TC-C04 | Continue Shopping navigates back to inventory', async ({ page }) => {
    await page.locator('[data-test="continue-shopping"]').click();
    await expect(page).toHaveURL(INVENTORY_URL_PATTERN);
  });

  // --------------------------------------------------------------------------
  test('TC-C05 | Checkout button navigates to step one', async ({ page }) => {
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/.*\/checkout-step-one\.html/);
  });
});

// ============================================================================
// SUITE 4 – Checkout Flow (Happy Path)
// ============================================================================
test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      CREDENTIALS.standard.username,
      CREDENTIALS.standard.password,
    );
    await page.locator('.inventory_item button').first().click();
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/.*\/checkout-step-one\.html/);
  });

  // --------------------------------------------------------------------------
  test('TC-CH01 | Step 1: empty form submission shows validation error', async ({ page }) => {
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toBeVisible();
  });

  // --------------------------------------------------------------------------
  test('TC-CH02 | Step 1: missing last name shows error', async ({ page }) => {
    await page.locator('[data-test="firstName"]').fill('John');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    const error = await page.locator('[data-test="error"]').textContent();
    expect(error).toContain('Last Name is required');
  });

  // --------------------------------------------------------------------------
  test('TC-CH03 | Step 1: valid data proceeds to step 2', async ({ page }) => {
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('SW1A 1AA');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/.*\/checkout-step-two\.html/);
  });

  // --------------------------------------------------------------------------
  test('TC-CH04 | Step 2: order summary displays item and totals', async ({ page }) => {
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('SW1A 1AA');
    await page.locator('[data-test="continue"]').click();

    await expect(page.locator('.cart_item')).toHaveCount(1);
    await expect(page.locator('.summary_subtotal_label')).toBeVisible();
    await expect(page.locator('.summary_tax_label')).toBeVisible();
    await expect(page.locator('.summary_total_label')).toBeVisible();
  });

  // --------------------------------------------------------------------------
  test('TC-CH05 | Step 2: finishing order shows confirmation', async ({ page }) => {
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('SW1A 1AA');
    await page.locator('[data-test="continue"]').click();
    await page.locator('[data-test="finish"]').click();

    await expect(page).toHaveURL(/.*\/checkout-complete\.html/);
    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
  });

  // --------------------------------------------------------------------------
  test('TC-CH06 | Confirmation page: Back Home returns to inventory', async ({ page }) => {
    await page.locator('[data-test="firstName"]').fill('Jane');
    await page.locator('[data-test="lastName"]').fill('Doe');
    await page.locator('[data-test="postalCode"]').fill('SW1A 1AA');
    await page.locator('[data-test="continue"]').click();
    await page.locator('[data-test="finish"]').click();
    await page.locator('[data-test="back-to-products"]').click();

    await expect(page).toHaveURL(INVENTORY_URL_PATTERN);
  });
});

// ============================================================================
// SUITE 5 – Burger Menu & Navigation
// ============================================================================
test.describe('Burger Menu & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      CREDENTIALS.standard.username,
      CREDENTIALS.standard.password,
    );
  });

  // --------------------------------------------------------------------------
  test('TC-N01 | Burger menu opens with all four links', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();

    await expect(page.locator('#inventory_sidebar_link')).toBeVisible();
    await expect(page.locator('#about_sidebar_link')).toBeVisible();
    await expect(page.locator('#logout_sidebar_link')).toBeVisible();
    await expect(page.locator('#reset_sidebar_link')).toBeVisible();
  });

  // --------------------------------------------------------------------------
  test('TC-N02 | Logout via burger menu returns user to login', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('#logout_sidebar_link').click();

    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  // --------------------------------------------------------------------------
  test('TC-N03 | Reset App State clears cart badge', async ({ page }) => {
    // Add an item first
    await page.locator('.inventory_item button').first().click();
    await expect(page.locator('.shopping_cart_badge')).toBeVisible();

    // Reset
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('#reset_sidebar_link').click();

    await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  });
});

// ============================================================================
// SUITE 6 – Session / Security
// ============================================================================
test.describe('Session & Security', () => {
  // --------------------------------------------------------------------------
  test('TC-S01 | Unauthenticated access to inventory redirects to login', async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(page).toHaveURL('/');
    const error = await page.locator('[data-test="error"]').textContent();
    expect(error).toContain("You can only access");
  });

  // --------------------------------------------------------------------------
  test('TC-S02 | Unauthenticated access to cart redirects to login', async ({ page }) => {
    await page.goto('/cart.html');
    await expect(page).toHaveURL('/');
  });

  // --------------------------------------------------------------------------
  test('TC-S03 | After logout, back button does not restore session', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      CREDENTIALS.standard.username,
      CREDENTIALS.standard.password,
    );
    await expect(page).toHaveURL(INVENTORY_URL_PATTERN);

    // Logout
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('#logout_sidebar_link').click();
    await expect(page).toHaveURL('/');

    // Attempt to go back
    await page.goBack();
    await expect(page).toHaveURL('/');
  });
});
