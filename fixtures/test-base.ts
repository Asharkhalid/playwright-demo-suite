import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

// Declare the types of our fixtures
type MyFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
};

// Extend the base test to include our custom page objects
export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    // Set up the fixture
    const loginPage = new LoginPage(page);
    // Use the fixture value in the test
    await use(loginPage);
  },
  inventoryPage: async ({ page }, use) => {
    // Set up the fixture
    const inventoryPage = new InventoryPage(page);
    // Use the fixture value in the test
    await use(inventoryPage);
  },
});

export { expect } from '@playwright/test';
