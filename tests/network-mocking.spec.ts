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
});
