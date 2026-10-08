import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("shows the builder intro and links to the main sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Build phoneme-based classroom activities" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Wordle", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Word Search", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Manage Content" })).toBeVisible();
  });

  test("main navigation reaches every page", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main navigation" });

    for (const [label, path] of [
      ["Wordle", "/wordle"],
      ["Word Search", "/word-search"],
      ["Manage", "/manage"],
      ["Dashboard", "/dashboard"],
      ["About", "/about"],
    ] as const) {
      await nav.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
    }
  });
});
