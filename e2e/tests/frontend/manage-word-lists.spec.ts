import { test, expect } from "@playwright/test";

test.describe("Manage Content — Word lists", () => {
  test("create a word list with every word selected via Select all, then delete it", async ({
    page,
  }) => {
    const name = `pw-list-${Date.now()}`;

    await page.goto("/manage");
    await page.getByRole("tab", { name: "Word lists" }).click();

    await page.getByLabel("Name").fill(name);
    await page.getByRole("button", { name: "Select all" }).click();
    await page.getByRole("button", { name: "Create list" }).click();

    const row = page.locator("li", { hasText: name });
    await expect(row).toBeVisible();
    // Word count should be greater than zero — "Select all" was used,
    // not left empty.
    await expect(row).not.toContainText("(0 words");

    await row.getByRole("button", { name: "Delete" }).click();
    await expect(page.locator("li", { hasText: name })).toHaveCount(0);
  });
});
