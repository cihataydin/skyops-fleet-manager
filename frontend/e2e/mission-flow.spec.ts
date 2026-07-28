import { test, expect } from '@playwright/test';

test('Full Mission Lifecycle E2E Flow', async ({ page }) => {
  // 1. Go to Drones list and open Create Modal
  await page.goto('/drones');
  await page.click('text=Register Drone');

  const rand1 = Math.random().toString(36).substring(2, 6).toUpperCase().padStart(4, '0');
  const rand2 = Math.random().toString(36).substring(2, 6).toUpperCase().padStart(4, '0');
  const serial = `SKY-${rand1}-${rand2}`;

  // Fill in the new drone form
  await page.fill('input#serialNumber', serial);
  
  // Select Model
  await page.locator('#model').click();
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
  await page.locator('#type').click();
  await page.click('div[title="Wind Turbine"]');
  
  await page.fill('input#pilotName', 'Auto Pilot');
  await page.fill('input#siteLocation', 'Test Site Alpha');
  
  // Dates (Use keyboard to type dates for maximum reliability)
  await page.locator('input[placeholder="Start date"]').click();
  await page.keyboard.type('2026-12-01 10:00:00', { delay: 50 });
  await page.keyboard.press('Tab');
  await page.keyboard.type('2026-12-01 14:00:00', { delay: 50 });
  await page.keyboard.press('Enter');
  
  // Submit Mission
  await page.click('.ant-modal-footer button:has-text("OK")');
  await expect(page.locator('text=Mission scheduled successfully!')).toBeVisible();

  // 5. Verify the mission appeared in the table and is PLANNED
  await expect(page.locator('text=E2E Test Mission')).toBeVisible();
  
  // 6. Transition Mission States
  // PLANNED -> PRE_FLIGHT_CHECK
  await page.click('button:has-text("Pre-Flight")');
  await expect(page.locator('button:has-text("Start")')).toBeVisible();

  // PRE_FLIGHT_CHECK -> IN_PROGRESS
  await page.click('button:has-text("Start")');
  await expect(page.locator('button:has-text("Complete")')).toBeVisible();

  // IN_PROGRESS -> COMPLETE
  await page.click('button:has-text("Complete")');

  // Wait for UI to update (drone status back to available)
  await page.waitForTimeout(1000);
  await expect(page.locator('.ant-descriptions-item-content:has-text("AVAILABLE")')).toBeVisible();

  // 7. Verify the dashboard reflects the changes
  await page.goto('/');
  await expect(page.locator('text=Fleet Dashboard')).toBeVisible();
  await expect(page.locator('text=Total Drones')).toBeVisible();
  await expect(page.locator('text=E2E Test Mission').first()).toBeVisible(); // Check that the recent mission is visible
});
