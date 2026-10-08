import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Automated accessibility checks (WCAG 2.1 A/AA) via axe-core on the
// pages a teacher or student actually uses. Serious/critical issues
// fail the test; any remaining minor/moderate findings are attached
// to the report for review rather than silently ignored.
const PAGES = ["/", "/wordle", "/word-search", "/manage", "/dashboard"];

for (const path of PAGES) {
  test(`${path} has no serious or critical accessibility violations`, async ({ page }, testInfo) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    await testInfo.attach(`axe-results-${path.replace(/\//g, "_") || "home"}`, {
      body: JSON.stringify(results.violations, null, 2),
      contentType: "application/json",
    });

    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );

    expect(
      seriousOrCritical,
      seriousOrCritical
        .map((v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} node(s)`)
        .join("\n"),
    ).toEqual([]);
  });
}
