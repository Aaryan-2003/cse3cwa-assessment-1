import { z } from "zod";

export const difficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);
export const activityTypeSchema = z.enum(["WORDLE", "WORD_SEARCH"]);

export const phonemeCreateSchema = z.object({
  symbol: z.string().trim().min(1).max(8),
  hint: z.string().trim().min(1).max(200),
});
export const phonemeUpdateSchema = phonemeCreateSchema.partial();

export const wordCreateSchema = z.object({
  english: z.string().trim().min(1).max(100),
  difficulty: difficultySchema,
  // Ordered list of phoneme symbols, e.g. ["tʃ", "ɪ", "n"]. Each symbol
  // must already exist as a Phoneme row.
  phonemes: z.array(z.string().trim().min(1)).min(1).max(12),
});
export const wordUpdateSchema = wordCreateSchema.partial();

export const wordListCreateSchema = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(500).optional(),
  wordIds: z.array(z.string()).optional(),
});
export const wordListUpdateSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  wordIds: z.array(z.string()).optional(),
});

export const activityCreateSchema = z.object({
  type: activityTypeSchema,
  title: z.string().trim().min(1).max(150),
  wordListId: z.string().min(1),
  wordCount: z.number().int().min(1).max(30).optional(),
  difficulty: difficultySchema.optional(),
  showHints: z.boolean().optional(),
  gridRows: z.number().int().min(4).max(30).optional(),
  gridCols: z.number().int().min(4).max(30).optional(),
  maxAttempts: z.number().int().min(1).max(20).optional(),
});
export const activityUpdateSchema = activityCreateSchema.partial();
