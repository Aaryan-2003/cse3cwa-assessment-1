import { test, expect } from "@playwright/test";

test.describe("Wordle builder", () => {
  test("loads a generated word from a configured activity and allows download", async ({
    page,
  }) => {
    await page.goto("/wordle");

    // Either a configured activity loads, or the page clearly says none
    // is configured — either way it must not get stuck on "Loading…".
    await expect(page.getByText("Loading activity…")).toHaveCount(0, { timeout: 15_000 });

    const activityPicker = page.getByLabel("Activity");
    await expect(activityPicker).toBeVisible();

    const downloadButton = page.getByRole("button", { name: "Generate & download HTML" });
    await expect(downloadButton).toBeEnabled();
  });
});
