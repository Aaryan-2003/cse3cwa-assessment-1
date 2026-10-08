import { test, expect } from "@playwright/test";

test.describe("Words CRUD", () => {
  test("create, read, update, and delete a word", async ({ request }) => {
    const phonemesRes = await request.get("/api/phonemes");
    expect(phonemesRes.status()).toBe(200);
    const phonemes: { symbol: string }[] = await phonemesRes.json();
    expect(phonemes.length).toBeGreaterThan(0);
    const symbol = phonemes[0].symbol;

    // Create
    const createRes = await request.post("/api/words", {
      data: { english: "playwright-test-word", difficulty: "EASY", phonemes: [symbol] },
    });
    expect(createRes.status()).toBe(201);
    const created = await createRes.json();
    expect(created.english).toBe("playwright-test-word");
    expect(created.difficulty).toBe("EASY");
    expect(created.phonemes).toEqual([symbol]);

    // Read
    const getRes = await request.get(`/api/words/${created.id}`);
    expect(getRes.status()).toBe(200);
    expect((await getRes.json()).id).toBe(created.id);

    // Update
    const patchRes = await request.patch(`/api/words/${created.id}`, {
      data: { difficulty: "HARD" },
    });
    expect(patchRes.status()).toBe(200);
    expect((await patchRes.json()).difficulty).toBe("HARD");

    // Delete
    const deleteRes = await request.delete(`/api/words/${created.id}`);
    expect(deleteRes.status()).toBe(204);

    // Confirm gone
    const getAfterDeleteRes = await request.get(`/api/words/${created.id}`);
    expect(getAfterDeleteRes.status()).toBe(404);
  });

  test("rejects a word with no phonemes selected", async ({ request }) => {
    const res = await request.post("/api/words", {
      data: { english: "bad-word", difficulty: "EASY", phonemes: [] },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid request body");
  });

  test("rejects a word referencing a phoneme symbol that doesn't exist", async ({ request }) => {
    const res = await request.post("/api/words", {
      data: { english: "bad-word", difficulty: "EASY", phonemes: ["__not_a_real_symbol__"] },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.details?.symbols).toContain("__not_a_real_symbol__");
  });
});
