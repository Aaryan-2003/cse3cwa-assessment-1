-- Clean up existing rows where the irrelevant field for the
-- activity's type was left set (e.g. a WORD_SEARCH activity with a
-- stray maxAttempts from Prisma's column default), so the CHECK
-- constraint below doesn't fail against pre-existing data.
UPDATE "Activity" SET "maxAttempts" = NULL WHERE "type" = 'WORD_SEARCH' AND "maxAttempts" IS NOT NULL;
UPDATE "Activity" SET "gridRows" = NULL, "gridCols" = NULL WHERE "type" = 'WORDLE' AND ("gridRows" IS NOT NULL OR "gridCols" IS NOT NULL);

-- Enforce at the database level what the app has only enforced in
-- code until now: a WORDLE activity must carry maxAttempts and never
-- a grid size, a WORD_SEARCH activity must carry a grid size and
-- never maxAttempts.
ALTER TABLE "Activity" ADD CONSTRAINT "activity_type_fields_check" CHECK (
  ("type" = 'WORDLE' AND "maxAttempts" IS NOT NULL AND "gridRows" IS NULL AND "gridCols" IS NULL)
  OR
  ("type" = 'WORD_SEARCH' AND "gridRows" IS NOT NULL AND "gridCols" IS NOT NULL AND "maxAttempts" IS NULL)
);
