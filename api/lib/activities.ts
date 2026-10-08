import type { ActivityType } from "@/app/generated/prisma/client";

// Resolves the grid/attempts fields for an activity given its final
// type, explicitly nulling out whichever fields don't apply rather
// than leaving them untouched — the database enforces this pairing
// with a CHECK constraint, so every write must satisfy it.
export function resolveActivityTypeFields(
  type: ActivityType,
  input: { gridRows?: number | null; gridCols?: number | null; maxAttempts?: number | null },
) {
  if (type === "WORD_SEARCH") {
    return {
      gridRows: input.gridRows ?? 10,
      gridCols: input.gridCols ?? 10,
      maxAttempts: null,
    };
  }
  return {
    maxAttempts: input.maxAttempts ?? 6,
    gridRows: null,
    gridCols: null,
  };
}
