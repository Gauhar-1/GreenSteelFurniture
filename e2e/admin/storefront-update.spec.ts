import { test, expect } from "@playwright/test";

test.describe("Storefront Visual Editor - Complete the Look Block", () => {
  test("updates Complete the Look room switcher, reorders items, and saves section", async ({ page }) => {
    // 1. Navigate to Storefront Controller
    await page.goto("/admin/storefront");
    await expect(page).toHaveTitle(/Storefront Controller | Admin Studio/i);

    // 2. Click "Complete the Look" Tab
    const lookTabBtn = page.getByRole("button", { name: /complete the look/i });
    await expect(lookTabBtn).toBeVisible();
    await lookTabBtn.click();

    // 3. Verify Room Switcher Editor is Active
    await expect(page.getByText(/"Complete the Look" Visual Editor/i)).toBeVisible();

    // 4. Update the Overlaid Badge Label
    const badgeInput = page.getByPlaceholder(/e\.g\. Master Suite Set/i);
    await expect(badgeInput).toBeVisible();
    await badgeInput.fill("Master Penthouse Suite");
    await expect(badgeInput).toHaveValue("Master Penthouse Suite");

    // 5. Test Switching Room Tabs (Home Office / Living Room)
    const officeTab = page.getByRole("button", { name: /home office/i }).first();
    if (await officeTab.isVisible()) {
      await officeTab.click();
      await expect(page.getByText(/Executive|Office/i).first()).toBeVisible();
    }

    // Switch back to Bedroom
    const bedroomTab = page.getByRole("button", { name: /bedroom/i }).first();
    await bedroomTab.click();

    // 6. Test Reordering Items via Up/Down Arrow
    const moveDownButtons = page.locator('button[title="Move Down"]');
    const firstMoveDownBtn = moveDownButtons.first();
    if (await firstMoveDownBtn.isVisible() && (await firstMoveDownBtn.isEnabled())) {
      await firstMoveDownBtn.click({ force: true });
    }

    // 7. Save & Revalidate Storefront Section
    const saveBtn = page.getByRole("button", { name: /save & revalidate/i }).first();
    await expect(saveBtn).toBeVisible();
    await saveBtn.click({ force: true });

    // 8. Verify Mutation & Cache Revalidation Feedback Toast
    await expect(
      page.getByText(/Room switcher updated! Instant cache revalidation/i).first()
    ).toBeVisible({ timeout: 10000 });
  });
});
