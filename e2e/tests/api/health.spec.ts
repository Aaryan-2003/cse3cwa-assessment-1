import { test, expect } from "@playwright/test";

test.describe("Health check", () => {
  test("GET /api/health reports the API and database are both reachable", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toEqual({ status: "ok", database: "connected" });
  });
});
