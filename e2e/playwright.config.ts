import { defineConfig, devices } from "@playwright/test";

// Chromium is pre-installed outside node_modules in some environments
// (e.g. this one); fall back to the default Playwright-managed binary
// when that path doesn't exist so the config still works elsewhere.
import { existsSync } from "node:fs";
const PINNED_CHROMIUM = "/opt/pw-browsers/chromium";
const chromiumExecutablePath = existsSync(PINNED_CHROMIUM) ? PINNED_CHROMIUM : undefined;

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";
const API_URL = process.env.API_URL ?? "http://localhost:4000";

// Assumes the app is already running (via `docker compose up` from the
// repo root, or the frontend/api dev servers) — see e2e/README.md.
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["html", { open: "never" }], ["list"]],
  timeout: 30_000,
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "frontend",
      testDir: "./tests/frontend",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: { executablePath: chromiumExecutablePath },
        baseURL: FRONTEND_URL,
      },
    },
    {
      name: "accessibility",
      testDir: "./tests/accessibility",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: { executablePath: chromiumExecutablePath },
        baseURL: FRONTEND_URL,
      },
    },
    {
      name: "api",
      testDir: "./tests/api",
      use: {
        baseURL: API_URL,
      },
    },
  ],
});
