# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mission-flow.spec.ts >> Full Mission Lifecycle E2E Flow
- Location: e2e/mission-flow.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.ant-select-selector')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]: SkyOps Control
        - menu [ref=e7]:
          - menuitem [ref=e8] [cursor=pointer]:
            - img "dashboard" [ref=e9]
            - link "Dashboard" [ref=e13]:
              - /url: /
          - menuitem [ref=e14] [cursor=pointer]:
            - img "robot" [ref=e15]
            - link "Drones" [ref=e19]:
              - /url: /drones
    - generic [ref=e20]:
      - banner [ref=e21]
      - main [ref=e22]:
        - generic [ref=e24]:
          - generic [ref=e25]:
            - heading "Drone Fleet Registry" [level=2] [ref=e26]
            - button "Register Drone" [ref=e27] [cursor=pointer]
          - generic [ref=e31]:
            - table [ref=e35]:
              - rowgroup [ref=e36]:
                - row [ref=e37]:
                  - columnheader "Serial Number" [ref=e38]
                  - columnheader "Model" [ref=e39]
                  - columnheader "Status" [ref=e40]
                  - columnheader "Total Flight Hours" [ref=e41]
                  - columnheader "Actions" [ref=e42]
              - rowgroup [ref=e43]:
                - row [ref=e44]:
                  - cell [ref=e45]:
                    - link "SKY-TEST-0008" [ref=e46] [cursor=pointer]:
                      - /url: /drones/fadf1de8-9eaa-4275-963a-22ccf82ef5be
                  - cell "PHANTOM_4" [ref=e47]
                  - cell "AVAILABLE" [ref=e48]
                  - cell "3.50" [ref=e50]
                  - cell [ref=e51]:
                    - link [ref=e54] [cursor=pointer]:
                      - /url: /drones/fadf1de8-9eaa-4275-963a-22ccf82ef5be
                      - button "Details" [ref=e55]
                - row [ref=e57]:
                  - cell [ref=e58]:
                    - link "SKY-BN82-I88F" [ref=e59] [cursor=pointer]:
                      - /url: /drones/dff4891f-934a-427f-8fcb-8a7e13c19b4d
                  - cell "PHANTOM_4" [ref=e60]
                  - cell "RETIRED" [ref=e61]
                  - cell "140.00" [ref=e63]
                  - cell [ref=e64]:
                    - link [ref=e67] [cursor=pointer]:
                      - /url: /drones/dff4891f-934a-427f-8fcb-8a7e13c19b4d
                      - button "Details" [ref=e68]
                - row [ref=e70]:
                  - cell [ref=e71]:
                    - link "SKY-B8JM-O5VO" [ref=e72] [cursor=pointer]:
                      - /url: /drones/a7314f96-11cb-4fce-91f7-5a64b4c21279
                  - cell "MAVIC_3_ENTERPRISE" [ref=e73]
                  - cell "AVAILABLE" [ref=e74]
                  - cell "125.00" [ref=e76]
                  - cell [ref=e77]:
                    - link [ref=e80] [cursor=pointer]:
                      - /url: /drones/a7314f96-11cb-4fce-91f7-5a64b4c21279
                      - button "Details" [ref=e81]
                - row [ref=e83]:
                  - cell [ref=e84]:
                    - link "SKY-KEA6-OYR2" [ref=e85] [cursor=pointer]:
                      - /url: /drones/35df6c4a-2be1-4098-ad68-65ab183d9156
                  - cell "MAVIC_3_ENTERPRISE" [ref=e86]
                  - cell "IN_MISSION" [ref=e87]
                  - cell "131.00" [ref=e89]
                  - cell [ref=e90]:
                    - link [ref=e93] [cursor=pointer]:
                      - /url: /drones/35df6c4a-2be1-4098-ad68-65ab183d9156
                      - button "Details" [ref=e94]
                - row [ref=e96]:
                  - cell [ref=e97]:
                    - link "SKY-Q22F-AZML" [ref=e98] [cursor=pointer]:
                      - /url: /drones/0b34607c-05ed-40d4-825e-141fd724d63d
                  - cell "PHANTOM_4" [ref=e99]
                  - cell "MAINTENANCE" [ref=e100]
                  - cell "2.00" [ref=e102]
                  - cell [ref=e103]:
                    - link [ref=e106] [cursor=pointer]:
                      - /url: /drones/0b34607c-05ed-40d4-825e-141fd724d63d
                      - button "Details" [ref=e107]
                - row [ref=e109]:
                  - cell [ref=e110]:
                    - link "SKY-4SVW-0KZV" [ref=e111] [cursor=pointer]:
                      - /url: /drones/f6100e5e-a606-4123-893a-d64600d70a96
                  - cell "MATRICE_300" [ref=e112]
                  - cell "RETIRED" [ref=e113]
                  - cell "58.00" [ref=e115]
                  - cell [ref=e116]:
                    - link [ref=e119] [cursor=pointer]:
                      - /url: /drones/f6100e5e-a606-4123-893a-d64600d70a96
                      - button "Details" [ref=e120]
                - row [ref=e122]:
                  - cell [ref=e123]:
                    - link "SKY-U4YZ-ZVLA" [ref=e124] [cursor=pointer]:
                      - /url: /drones/04f2d278-0b52-4290-ad9a-47a00e135cab
                  - cell "MATRICE_300" [ref=e125]
                  - cell "AVAILABLE" [ref=e126]
                  - cell "138.00" [ref=e128]
                  - cell [ref=e129]:
                    - link [ref=e132] [cursor=pointer]:
                      - /url: /drones/04f2d278-0b52-4290-ad9a-47a00e135cab
                      - button "Details" [ref=e133]
                - row [ref=e135]:
                  - cell [ref=e136]:
                    - link "SKY-1E01-8AED" [ref=e137] [cursor=pointer]:
                      - /url: /drones/0465b3c7-ee7b-4b62-97c6-4673e09e4a5d
                  - cell "PHANTOM_4" [ref=e138]
                  - cell "IN_MISSION" [ref=e139]
                  - cell "199.00" [ref=e141]
                  - cell [ref=e142]:
                    - link [ref=e145] [cursor=pointer]:
                      - /url: /drones/0465b3c7-ee7b-4b62-97c6-4673e09e4a5d
                      - button "Details" [ref=e146]
                - row [ref=e148]:
                  - cell [ref=e149]:
                    - link "SKY-93LW-EXPN" [ref=e150] [cursor=pointer]:
                      - /url: /drones/8038dd99-d05f-4782-a0f2-153c659e9c62
                  - cell "MATRICE_300" [ref=e151]
                  - cell "MAINTENANCE" [ref=e152]
                  - cell "161.00" [ref=e154]
                  - cell [ref=e155]:
                    - link [ref=e158] [cursor=pointer]:
                      - /url: /drones/8038dd99-d05f-4782-a0f2-153c659e9c62
                      - button "Details" [ref=e159]
                - row [ref=e161]:
                  - cell [ref=e162]:
                    - link "SKY-IDLL-1FWF" [ref=e163] [cursor=pointer]:
                      - /url: /drones/9fb0fc10-7e53-4b5f-80ee-b1be2331fd7e
                  - cell "MAVIC_3_ENTERPRISE" [ref=e164]
                  - cell "MAINTENANCE" [ref=e165]
                  - cell "191.00" [ref=e167]
                  - cell [ref=e168]:
                    - link [ref=e171] [cursor=pointer]:
                      - /url: /drones/9fb0fc10-7e53-4b5f-80ee-b1be2331fd7e
                      - button "Details" [ref=e172]
            - list [ref=e174]:
              - listitem "Previous Page" [ref=e175]:
                - button [disabled] [ref=e176]:
                  - img "left" [ref=e177]
              - listitem "1" [ref=e180] [cursor=pointer]
              - listitem "2" [ref=e182] [cursor=pointer]
              - listitem "3" [ref=e184] [cursor=pointer]
              - listitem "Next Page" [ref=e186] [cursor=pointer]:
                - button [ref=e187]:
                  - img "right" [ref=e188]
  - generic [ref=e191]:
    - dialog "Register New Drone":
      - generic [ref=e192]:
        - button "Close" [ref=e193] [cursor=pointer]:
          - generic "Close" [ref=e194]:
            - img "close" [ref=e195]
        - generic [ref=e198]: Register New Drone
        - generic [ref=e201]:
          - generic [ref=e203]:
            - generic "Serial Number" [ref=e205]: "* Serial Number"
            - generic [ref=e206]:
              - textbox "* Serial Number" [active] [invalid] [ref=e209]:
                - /placeholder: SKY-1234-ABCD
                - text: SKY-E2E6112-TEST
              - generic [ref=e210]: Format must be SKY-XXXX-XXXX
          - generic [ref=e214]:
            - generic "Model" [ref=e216]: "* Model"
            - generic [ref=e220] [cursor=pointer]:
              - combobox "* Model" [ref=e222]
              - img "down" [ref=e224]
        - generic [ref=e227]:
          - button "Cancel" [ref=e228] [cursor=pointer]
          - button "OK" [ref=e230] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('Full Mission Lifecycle E2E Flow', async ({ page }) => {
  4  |   // 1. Go to Drones list and open Create Modal
  5  |   await page.goto('/drones');
  6  |   await page.click('text=Register Drone');
  7  | 
  8  |   // Generate a random serial number like SKY-1111-2222
  9  |   const rand = Math.floor(Math.random() * 9000 + 1000);
  10 |   const serial = `SKY-E2E${rand}-TEST`;
  11 | 
  12 |   // Fill in the new drone form
  13 |   await page.fill('input#serialNumber', serial);
  14 |   
  15 |   // Select Model
> 16 |   await page.click('.ant-select-selector');
     |              ^ Error: page.click: Test timeout of 30000ms exceeded.
  17 |   await page.click('div[title="PHANTOM_4"]');
  18 |   
  19 |   // Submit
  20 |   await page.click('button:has-text("OK")');
  21 | 
  22 |   // Verify success message
  23 |   await expect(page.locator('text=Drone created successfully!')).toBeVisible();
  24 | 
  25 |   // 2. Find the new drone in the table and click Details
  26 |   // (Assuming it might be on the first page due to sorting, or we can just filter. Since we order by DESC in backend, it should be first)
  27 |   await page.click(`text=${serial}`);
  28 | 
  29 |   // 3. Verify drone details page loaded
  30 |   await expect(page.locator(`text=Drone Details: ${serial}`)).toBeVisible();
  31 |   await expect(page.locator('text=AVAILABLE')).toBeVisible();
  32 | 
  33 |   // 4. Schedule a Mission
  34 |   await page.click('text=Schedule Mission');
  35 |   
  36 |   await page.fill('input#name', 'E2E Test Mission');
  37 |   
  38 |   // Select Type
  39 |   await page.click('.ant-modal-body .ant-select-selector');
  40 |   await page.click('div[title="Wind Turbine"]');
  41 |   
  42 |   await page.fill('input#pilotName', 'Auto Pilot');
  43 |   await page.fill('input#siteLocation', 'Test Site Alpha');
  44 |   
  45 |   // Dates (Clicking the range picker and selecting today)
  46 |   await page.click('.ant-picker');
  47 |   await page.click('.ant-picker-cell-today'); // Start date
  48 |   await page.click('.ant-picker-cell-today'); // End date
  49 |   await page.click('button:has-text("Ok")'); // Confirm time picker
  50 |   
  51 |   // Submit Mission
  52 |   await page.click('.ant-modal-footer button:has-text("OK")');
  53 |   await expect(page.locator('text=Mission scheduled successfully!')).toBeVisible();
  54 | 
  55 |   // 5. Verify the mission appeared in the table and is PLANNED
  56 |   await expect(page.locator('text=E2E Test Mission')).toBeVisible();
  57 |   
  58 |   // 6. Transition Mission States
  59 |   // PLANNED -> PRE_FLIGHT_CHECK
  60 |   await page.click('button:has-text("Pre-Flight")');
  61 |   await expect(page.locator('text=Mission status updated to PRE_FLIGHT_CHECK')).toBeVisible();
  62 | 
  63 |   // PRE_FLIGHT_CHECK -> IN_PROGRESS
  64 |   await page.click('button:has-text("Start")');
  65 |   await expect(page.locator('text=Mission status updated to IN_PROGRESS')).toBeVisible();
  66 | 
  67 |   // IN_PROGRESS -> COMPLETE
  68 |   await page.click('button:has-text("Complete")');
  69 |   await expect(page.locator('text=Mission status updated to COMPLETE')).toBeVisible();
  70 | 
  71 |   // Wait for UI to update (drone status back to available)
  72 |   await page.waitForTimeout(1000);
  73 |   await expect(page.locator('.ant-descriptions-item-content:has-text("AVAILABLE")')).toBeVisible();
  74 | });
  75 | 
```