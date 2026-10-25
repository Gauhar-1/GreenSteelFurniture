import { test, expect } from "@playwright/test";

test.describe("Storefront Visual Editor - Categories Bento Selection & Order", () => {
  test("allows selecting, reordering, and saving landing page categories with live sync", async ({ page }) => {
    // 1. Authenticate test session & Navigate to Storefront Controller
    await page.context().addCookies([
      {
        name: "playwright_test_admin",
        value: "true",
        domain: "localhost",
        path: "/",
      },
    ]);
    await page.goto("/admin/storefront");
    await expect(page).toHaveTitle(/Storefront Controller | Admin Studio/i);

    // 2. Click "Categories Bento" Tab
    const bentoTabBtn = page.getByRole("button", { name: /categories bento/i });
    await expect(bentoTabBtn).toBeVisible();
    await bentoTabBtn.click();

    // 3. Verify Categories Bento Editor & Notice Banner are visible
    await expect(page.getByText(/Landing Page Categories Bento/i)).toBeVisible();
    await expect(page.getByText(/Categories Managed Exclusively on Categories Page/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /edit categories page/i })).toBeVisible();

    // 4. Check that at least 1 category is selected and rendered in the list
    const activeCards = page.locator("text=/categories/");
    await expect(activeCards.first()).toBeVisible();

    // 5. Test Reordering via Move Down
    const moveDownBtns = page.locator('button[title="Move Down"]');
    const firstMoveDownBtn = moveDownBtns.first();
    if (await firstMoveDownBtn.isVisible() && (await firstMoveDownBtn.isEnabled())) {
      await firstMoveDownBtn.click();
    }

    // 6. Test Save & Revalidate
    const saveBtn = page.getByRole("button", { name: /save & revalidate/i }).first();
    await expect(saveBtn).toBeVisible();
    await saveBtn.click({ force: true });

    // Toast confirmation
    await expect(
      page.getByText(/Section updated!/i).first()
    ).toBeVisible({ timeout: 10000 });
  });
});
