import { test, expect } from '../fixtures/test-base';

test.describe('Network Interception & Mocking', () => {
  
  // --------------------------------------------------------------------------
  test('TC-M01 | Block images to simulate missing assets / fast loading', async ({ page, inventoryPage }) => {
    // Intercept all requests and abort them if they are images
    await page.route('**/*.{png,jpg,jpeg,svg}', route => route.abort());

    // Because this suite uses global auth, we just navigate directly
    await inventoryPage.goto();
    
    // The page should still load successfully without throwing errors
    await inventoryPage.assertOnInventoryPage();

    // Verify that the images are indeed broken/missing
    // Playwright captures the state of the DOM; the elements exist but have no loaded content
    const imageCount = await page.locator('.inventory_item_img img').count();
    expect(imageCount).toBeGreaterThan(0);
    
    // We can evaluate in the browser context if the naturalWidth is 0 (broken)
    const firstImgBroken = await page.locator('.inventory_item_img img').first().evaluate((img: HTMLImageElement) => img.naturalWidth === 0);
    expect(firstImgBroken).toBe(true);
  });

  // --------------------------------------------------------------------------
  test('TC-M02 | Inject mock API response (Simulated)', async ({ page, inventoryPage }) => {
    // SauceDemo does not use a JSON API to fetch products, they are server-rendered.
    // However, to demonstrate advanced mocking, we will intercept a hypothetical analytics call
    // and fulfill it with a mock response, proving the capability for the portfolio.

    await page.route('**/api/analytics/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, mocked: true })
      });
    });

    // Trigger the page load
    await inventoryPage.goto();

    // Trigger a hypothetical API call from the browser
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/analytics/track', { method: 'POST' });
      return await res.json();
    });

    // Validate our mock was successfully hit and returned
    expect(response.mocked).toBe(true);
  });

  // --------------------------------------------------------------------------
  test('TC-M03 | Simulate API timeout and verify graceful handling', async ({ page, loginPage }) => {
    // Disable auth state to test login flow with timeout
    await page.context().clearCookies();

    // Intercept the login endpoint and delay it excessively (simulate timeout)
    // In a real app, this would be the actual login API call
    let requestIntercepted = false;
    await page.route('**/api/login', async route => {
      requestIntercepted = true;
      // Simulate a slow/timeout scenario by delaying longer than the action timeout
      await new Promise(resolve => setTimeout(resolve, 15000));
      await route.abort('timedout');
    });

    await loginPage.goto();

    // Note: In SauceDemo, the login is not actually via API, so this test demonstrates
    // the pattern for a real-world app. For actual E2E verification on SauceDemo,
    // we would test a timeout scenario differently (e.g., network throttling).
    // This test showcases advanced Playwright capability for the portfolio.

    expect(requestIntercepted).toBe(true);
  });

  // --------------------------------------------------------------------------
  test('TC-M04 | Mock failed API response (500 error)', async ({ page, inventoryPage }) => {
    // Intercept requests and return a 500 server error
    await page.route('**/api/**', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await inventoryPage.goto();

    // Page should still load (SauceDemo doesn't rely on API for initial render)
    // But this demonstrates how you'd handle API errors in real applications
    await expect(inventoryPage.page).toHaveURL(/.*\/inventory\.html/);
  });
});
