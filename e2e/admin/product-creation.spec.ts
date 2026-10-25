import { test, expect } from "@playwright/test";

test.describe("3-Step Product Wizard & Adaptive Dimension Matrix", () => {
  test("adapts dimensions based on category blueprint_type and publishes product", async ({ page }) => {
    // 1. Navigate to New Furniture Wizard
    await page.goto("/admin/products/new");
    await expect(page).toHaveTitle(/New Furniture Wizard | Admin Studio/i);

    // 2. Step 1: Basics & Department Selection
    await expect(page.getByRole("heading", { name: /1\. Basics & Room Placement/i })).toBeVisible();

    // Fill Title
    const titleEnInput = page.getByPlaceholder(/e\.g\. The Sovereign Tri-Door Wardrobe/i);
    await titleEnInput.fill("The Titan Modular Bed");

    // Select Bedroom Department & Steel Beds Sub-Category (blueprint = bed)
    const bedroomBtn = page.getByRole("button", { name: /bedroom/i }).first();
    await bedroomBtn.click();

    const bedsSubCatBtn = page.getByRole("button", { name: /steel beds/i });
    await bedsSubCatBtn.click();

    // Advance to Step 2: 4-Photo Blueprint
    const nextToFinishesBtn = page.getByRole("button", { name: /continue to 4-photo blueprint/i });
    await nextToFinishesBtn.click();

    // 3. Step 2: Finishes Studio
    await expect(page.getByText(/4-Photo Studio Blueprint/i)).toBeVisible();

    // Select color swatch preset
    const navySwatch = page.getByRole("button", { name: /matte navy/i });
    if (await navySwatch.isVisible()) {
      await navySwatch.click();
    }

    // Advance to Step 3: Sizes & Dimensions
    const nextToSizesBtn = page.getByRole("button", { name: /continue to sizes & dimensions/i });
    await nextToSizesBtn.click();

    // 4. Step 3: Verify Adaptive Dimension Matrix for 'bed'
    await expect(page.getByText("Length (L)")).toBeVisible();
    await expect(page.getByText("Headboard (HH)")).toBeVisible();

    // 5. Test Adaptive Dimension Switch: Jump to Basics via Top Step Pill
    const basicsPill = page.getByRole("button", { name: /basics|^1$/i });
    await basicsPill.click();

    // Select Living Room & Lounge Chairs (blueprint = seating)
    const livingRoomBtn = page.getByRole("button", { name: /living room/i }).first();
    await livingRoomBtn.click();

    const chairsSubCatBtn = page.getByRole("button", { name: /lounge chairs/i });
    await chairsSubCatBtn.click();

    // Jump directly to Step 3: Sizes & Dimensions
    const sizesPill = page.getByRole("button", { name: /sizes & dimensions|^3$/i });
    await sizesPill.click();

    // Verify Dimensions adapted to Seating: "Total Height (TH)", "Seat Height (SH)"
    await expect(page.getByText("Total Height (TH)")).toBeVisible();
    await expect(page.getByText("Seat Height (SH)")).toBeVisible();

    // 6. Publish Product Blueprint
    const publishBtn = page.getByRole("button", { name: /publish master furniture/i });
    await expect(publishBtn).toBeVisible();
    await publishBtn.click();

    // Verify publication confirmation toast
    await expect(page.getByText(/published successfully/i).first()).toBeVisible({ timeout: 10000 });
  });
});
