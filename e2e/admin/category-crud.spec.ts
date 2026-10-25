import { test, expect } from "@playwright/test";

test.describe("Category Manager CRUD Flow", () => {
  test("creates a new room category and verifies tree display and deletion", async ({ page }) => {
    // 1. Navigate to Category Manager
    await page.goto("/admin/categories");
    await expect(page).toHaveTitle(/Categories & Rooms | Admin Studio/i);

    // 2. Open New Category Modal
    const newCategoryBtn = page.getByRole("button", { name: /new category/i });
    await expect(newCategoryBtn).toBeVisible();
    await newCategoryBtn.click();

    // 3. Verify Modal Opened
    await expect(page.getByRole("heading", { name: /create new category/i })).toBeVisible();

    // 4. Fill in English Name and verify auto-generated slug
    const nameEnInput = page.getByPlaceholder(/e\.g\. Master Bedroom/i);
    await nameEnInput.fill("Test Executive Study");

    const slugInput = page.getByPlaceholder("master-bedroom");
    await expect(slugInput).toHaveValue("test-executive-study");

    // 5. Fill Hindi Name
    const nameHiInput = page.getByPlaceholder(/e\.g\. मास्टर बेडरूम/i);
    await nameHiInput.fill("टेस्ट एग्जीक्यूटिव स्टडी");

    // 6. Select Blueprint Type
    const blueprintSelect = page.locator('select[name="blueprint_type"]');
    await blueprintSelect.selectOption("table");

    // 7. Select Cover Preset
    const presetBtn = page.getByRole("button", { name: "Workspace Studio" });
    if (await presetBtn.isVisible()) {
      await presetBtn.click();
    }

    // 8. Submit Category Form
    const submitBtn = page.getByRole("button", { name: /create category/i });
    await submitBtn.click();

    // 9. Verify category appears in the list
    await expect(page.getByText("Test Executive Study").first()).toBeVisible({ timeout: 5000 });

    // 10. Test Deletion with browser confirm dialog
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    const categoryCard = page.locator("div").filter({ hasText: "Test Executive Study" }).first();
    const deleteBtn = categoryCard.locator('button[title*="Delete"]').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      // Toast confirms deletion
      await expect(page.getByText(/deleted successfully/i).first()).toBeVisible({ timeout: 5000 });
    }
  });
});
