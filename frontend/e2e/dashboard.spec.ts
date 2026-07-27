import { test, expect } from '@playwright/test';

test('Dashboard loads correctly and displays fleet data', async ({ page }) => {
  // Navigate to the dashboard
  await page.goto('http://localhost:5173/');

  // Check if the title is present
  await expect(page.locator('text=Fleet Dashboard')).toBeVisible();

  // Check if the Statistics cards are rendered (Total Drones, Available Drones)
  await expect(page.locator('text=Total Drones')).toBeVisible();
  await expect(page.locator('text=Available Drones')).toBeVisible();

  // Check if the Recent Missions table is rendered
  await expect(page.locator('text=Recent Missions')).toBeVisible();

  // Navigate to Drones list using the sidebar
  await page.click('text=Drones');
  
  // Verify that the Drones list page loaded
  await expect(page.locator('text=Drone Fleet Registry')).toBeVisible();
});
