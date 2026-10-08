import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("shows live health, content, generation, and usage stats", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByText("Loading dashboard…")).toHaveCount(0, { timeout: 15_000 });
    await expect(page.getByText(/System (healthy|unhealthy)/)).toBeVisible();

    await expect(page.getByText("Words", { exact: true })).toBeVisible();
    await expect(page.getByText("Word lists", { exact: true })).toBeVisible();
    await expect(page.getByText("Successful generations")).toBeVisible();
    await expect(page.getByText("Failed generations")).toBeVisible();
    await expect(page.getByText("Average time on page")).toBeVisible();
  });
});
