import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('🚀 Global Setup: Logging in to save authentication state...');
  
  // Navigate and log in
  await page.goto(baseURL!);
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();

  // Wait for the inventory page to load to ensure auth cookies are set
  await page.waitForURL(/.*\/inventory\.html/);

  // Save state to a file
  await page.context().storageState({ path: '.auth/user.json' });

  await browser.close();
  console.log('✅ Global Setup: Authentication state saved successfully!');
}

export default globalSetup;
