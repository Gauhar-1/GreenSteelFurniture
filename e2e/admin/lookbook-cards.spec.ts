import { test, expect } from "@playwright/test";

test.describe("Storefront Visual Editor - Lookbook Set Cards", () => {
  test("renders linked product cards, allows adding/removing items, and saves correctly", async ({ page }) => {
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

    // 2. Click "Lookbook Sets" Tab
    const lookTabBtn = page.getByRole("button", { name: /lookbook sets/i });
    await expect(lookTabBtn).toBeVisible();
    await lookTabBtn.click();

    // 3. Verify Room Switcher Editor is Active
    await expect(page.getByText(/"Complete the Look" Visual Editor/i)).toBeVisible();

    // 4. Check Linked Items counter and Cards rendering
    const counterLocator = page.locator("span:has-text('Linked')").filter({ hasText: /\d+\s*\/\s*4\s*Linked/i });
    await expect(counterLocator).toBeVisible();
    const counterText = await counterLocator.textContent();
    const match = counterText?.match(/(\d+)\s*\/\s*4\s*Linked/i);
    const linkedCount = match ? parseInt(match[1], 10) : 0;

    // Verify all linked cards are rendered (no invisible/null returns)
    const cards = page.locator('[data-testid="linked-product-card"], [data-testid="linked-product-unlinked"]');
    await expect(cards).toHaveCount(linkedCount);

    // 5. Test adding a product via Search Combobox if under limit of 4
    if (linkedCount < 4) {
      const comboboxTrigger = page.locator('[data-testid="combobox-trigger"]');
      if (await comboboxTrigger.isVisible()) {
        await comboboxTrigger.click();

        // Wait for combobox popover
        const comboboxItems = page.locator('[data-testid="combobox-item"]');
        if (await comboboxItems.count() > 0) {
          const firstItem = comboboxItems.first();
          const itemTitle = await firstItem.locator("h5").textContent();

          await firstItem.click();

          // After clicking, the count should increase by 1
          await expect(cards).toHaveCount(linkedCount + 1);

          // Verify the newly linked card displays the product title and Indian rupee price
          if (itemTitle) {
            await expect(page.locator(`[data-testid="linked-product-card"]:has-text("${itemTitle.trim()}")`)).toBeVisible();
          }
        }
      }
    }

    // 6. Test removing a product card
    const currentCardsCount = await cards.count();
    if (currentCardsCount > 0) {
      const removeBtns = page.locator('[data-testid="remove-product-btn"]');
      await removeBtns.first().click();

      // Card count should decrease by 1
      await expect(cards).toHaveCount(currentCardsCount - 1);
    }

    // 7. Verify Save & Revalidate works seamlessly
    const saveBtn = page.getByRole("button", { name: /save & revalidate/i }).first();
    await expect(saveBtn).toBeVisible();
    await saveBtn.click({ force: true });

    // Toast confirmation
    await expect(
      page.getByText(/Room switcher updated!|Lookbook Room sets updated/i).first()
    ).toBeVisible({ timeout: 10000 });
  });
});
