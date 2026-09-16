export type TileStatus = "correct" | "present" | "absent";

/**
 * Standard Wordle-style evaluation: exact-position matches first, then
 * remaining phonemes are checked for presence elsewhere in the target
 * (each target phoneme can only satisfy one guess phoneme).
 */
export function evaluateGuess(guess: string[], target: string[]): TileStatus[] {
  const n = target.length;
  const result: TileStatus[] = new Array(n).fill("absent");
  const usedTarget = new Array(n).fill(false);

  for (let i = 0; i < n; i++) {
    if (guess[i] === target[i]) {
      result[i] = "correct";
      usedTarget[i] = true;
    }
  }

  for (let i = 0; i < n; i++) {
    if (result[i] === "correct") continue;
    const idx = target.findIndex((t, j) => t === guess[i] && !usedTarget[j]);
    if (idx !== -1) {
      result[i] = "present";
      usedTarget[idx] = true;
    }
  }

  return result;
}

const STATUS_RANK: Record<TileStatus, number> = { absent: 0, present: 1, correct: 2 };

/** Best status seen so far for each phoneme, used to colour the keyboard. */
export function keyStatusesFromGuesses(
  guesses: string[][],
  statuses: TileStatus[][],
): Record<string, TileStatus> {
  const best: Record<string, TileStatus> = {};
  guesses.forEach((guess, gi) => {
    guess.forEach((phoneme, pi) => {
      const status = statuses[gi][pi];
      if (!best[phoneme] || STATUS_RANK[status] > STATUS_RANK[best[phoneme]]) {
        best[phoneme] = status;
      }
    });
  });
  return best;
}
