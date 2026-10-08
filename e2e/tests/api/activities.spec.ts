import { test, expect } from "@playwright/test";

test.describe("Activities CRUD and type-field rules", () => {
  async function firstWordListId(request: import("@playwright/test").APIRequestContext) {
    const res = await request.get("/api/word-lists");
    const lists: { id: string }[] = await res.json();
    expect(lists.length).toBeGreaterThan(0);
    return lists[0].id;
  }

  test("creating a Word Search activity defaults its grid and leaves maxAttempts unset", async ({
    request,
  }) => {
    const wordListId = await firstWordListId(request);

    const createRes = await request.post("/api/activities", {
      data: { type: "WORD_SEARCH", title: "Playwright Test Search", wordListId },
    });
    expect(createRes.status()).toBe(201);
    const activity = await createRes.json();
    expect(activity.gridRows).toBe(10);
    expect(activity.gridCols).toBe(10);
    expect(activity.maxAttempts).toBeNull();

    await request.delete(`/api/activities/${activity.id}`);
  });

  test("switching an activity's type on PATCH re-resolves its fields consistently", async ({
    request,
  }) => {
    const wordListId = await firstWordListId(request);

    const createRes = await request.post("/api/activities", {
      data: { type: "WORD_SEARCH", title: "Playwright Test Switch", wordListId },
    });
    const activity = await createRes.json();

    const patchRes = await request.patch(`/api/activities/${activity.id}`, {
      data: { type: "WORDLE" },
    });
    expect(patchRes.status()).toBe(200);
    const updated = await patchRes.json();
    expect(updated.type).toBe("WORDLE");
    expect(updated.maxAttempts).toBe(6);
    expect(updated.gridRows).toBeNull();
    expect(updated.gridCols).toBeNull();

    await request.delete(`/api/activities/${activity.id}`);
  });
});
