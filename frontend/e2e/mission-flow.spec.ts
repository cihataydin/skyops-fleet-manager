import { test, expect } from '@playwright/test';

test('Full Mission Lifecycle E2E Flow', async ({ page }) => {
  // 1. Go to Drones list and open Create Modal
  await page.goto('/drones');
  await page.click('text=Register Drone');

  // Generate a random serial number like SKY-1111-2222
  const rand = Math.floor(Math.random() * 9000 + 1000);
  const serial = `SKY-E2E${rand}-TEST`;

  // Fill in the new drone form
  await page.fill('input#serialNumber', serial);
  
  // Select Model
  await page.click('.ant-select-selector');
  await page.click('div[title="PHANTOM_4"]');
  
  // Submit
  await page.click('button:has-text("OK")');

  // Verify success message
  await expect(page.locator('text=Drone created successfully!')).toBeVisible();

  // 2. Find the new drone in the table and click Details
  // (Assuming it might be on the first page due to sorting, or we can just filter. Since we order by DESC in backend, it should be first)
  await page.click(`text=${serial}`);

  // 3. Verify drone details page loaded
  await expect(page.locator(`text=Drone Details: ${serial}`)).toBeVisible();
  await expect(page.locator('text=AVAILABLE')).toBeVisible();

  // 4. Schedule a Mission
  await page.click('text=Schedule Mission');
  
  await page.fill('input#name', 'E2E Test Mission');
  
  // Select Type
  await page.click('.ant-modal-body .ant-select-selector');
  await page.click('div[title="Wind Turbine"]');
  
  await page.fill('input#pilotName', 'Auto Pilot');
  await page.fill('input#siteLocation', 'Test Site Alpha');
  
  // Dates (Clicking the range picker and selecting today)
  await page.click('.ant-picker');
  await page.click('.ant-picker-cell-today'); // Start date
  await page.click('.ant-picker-cell-today'); // End date
  await page.click('button:has-text("Ok")'); // Confirm time picker
  
  // Submit Mission
  await page.click('.ant-modal-footer button:has-text("OK")');
  await expect(page.locator('text=Mission scheduled successfully!')).toBeVisible();

  // 5. Verify the mission appeared in the table and is PLANNED
  await expect(page.locator('text=E2E Test Mission')).toBeVisible();
  
  // 6. Transition Mission States
  // PLANNED -> PRE_FLIGHT_CHECK
  await page.click('button:has-text("Pre-Flight")');
  await expect(page.locator('text=Mission status updated to PRE_FLIGHT_CHECK')).toBeVisible();

  // PRE_FLIGHT_CHECK -> IN_PROGRESS
  await page.click('button:has-text("Start")');
  await expect(page.locator('text=Mission status updated to IN_PROGRESS')).toBeVisible();

  // IN_PROGRESS -> COMPLETE
  await page.click('button:has-text("Complete")');
  await expect(page.locator('text=Mission status updated to COMPLETE')).toBeVisible();

  // Wait for UI to update (drone status back to available)
  await page.waitForTimeout(1000);
  await expect(page.locator('.ant-descriptions-item-content:has-text("AVAILABLE")')).toBeVisible();
});
