import { test, expect } from "@playwright/test";

test.describe("Activity generation", () => {
  test("generating a real activity returns words and hints, and is reflected in stats", async ({
    request,
  }) => {
    const activitiesRes = await request.get("/api/activities");
    expect(activitiesRes.status()).toBe(200);
    const activities: { id: string; type: string }[] = await activitiesRes.json();
    expect(activities.length).toBeGreaterThan(0);
    const activity = activities[0];

    const statsBefore = await (await request.get("/api/stats")).json();

    const generateRes = await request.get(`/api/activities/${activity.id}/generate`);
    expect(generateRes.status()).toBe(200);
    const generated = await generateRes.json();
    expect(generated.activity.id).toBe(activity.id);
    expect(Array.isArray(generated.words)).toBe(true);
    expect(generated.words.length).toBeGreaterThan(0);
    expect(typeof generated.hints).toBe("object");

    const statsAfter = await (await request.get("/api/stats")).json();
    expect(statsAfter.generation.successCount).toBeGreaterThan(statsBefore.generation.successCount);
  });

  test("generating a nonexistent activity returns 404", async ({ request }) => {
    // Stats deltas aren't checked here (unlike the success case above):
    // /api/stats is global, shared, mutable state, and other tests run
    // concurrently against it, so a before/after equality check on it
    // would be flaky by construction rather than testing this behavior.
    // That a "not found" lookup is never logged (unlike the "pool
    // empty" failure case, which is) is a deliberate choice in the
    // route itself — see generate/route.ts.
    const res = await request.get("/api/activities/00000000-0000-0000-0000-000000000000/generate");
    expect(res.status()).toBe(404);
    expect((await res.json()).error).toBe("Activity not found");
  });
});
