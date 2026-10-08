import { test, expect } from "@playwright/test";

test.describe("Manage Content — Words CRUD", () => {
  test("add, edit, and delete a word", async ({ page }) => {
    const english = `pw-word-${Date.now()}`;

    await page.goto("/manage");
    await page.getByRole("tab", { name: "Words" }).click();

    await page.getByLabel("English spelling").fill(english);
    await page.getByLabel("Difficulty").selectOption("EASY");
    // Phoneme buttons carry a title like "/symbol/ hint" — click two to
    // build a minimal valid sequence without depending on which exact
    // symbols are configured.
    const phonemeButtons = page.locator('form button[title^="/"]');
    await phonemeButtons.first().click();
    await phonemeButtons.nth(1).click();

    await page.getByRole("button", { name: "Add word" }).click();

    const row = page.locator("li", { hasText: english });
    await expect(row).toBeVisible();
    await expect(row).toContainText("EASY");

    // Edit: switch difficulty to HARD
    await row.getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("Difficulty").selectOption("HARD");
    await page.getByRole("button", { name: "Save changes" }).click();

    const updatedRow = page.locator("li", { hasText: english });
    await expect(updatedRow).toContainText("HARD");

    // Delete
    await updatedRow.getByRole("button", { name: "Delete" }).click();
    await expect(page.locator("li", { hasText: english })).toHaveCount(0);
  });
});
