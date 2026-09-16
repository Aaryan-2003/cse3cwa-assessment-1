import type { Prisma } from "@/app/generated/prisma/client";

type WordWithPhonemes = Prisma.WordGetPayload<{
  include: { phonemes: { include: { phoneme: true } } };
}>;

/** Flattens the WordPhoneme join rows into a simple, ordered symbol array. */
export function serializeWord(word: WordWithPhonemes) {
  const phonemes = [...word.phonemes]
    .sort((a, b) => a.position - b.position)
    .map((wp) => wp.phoneme.symbol);

  return {
    id: word.id,
    english: word.english,
    difficulty: word.difficulty,
    phonemes,
    createdAt: word.createdAt,
    updatedAt: word.updatedAt,
  };
}
