import type { PhonemeWord } from "@/lib/phonemes";

export type Cell = { row: number; col: number };

export type Placement = {
  word: PhonemeWord;
  cells: Cell[];
};

export type WordSearchPuzzle = {
  rows: number;
  cols: number;
  grid: string[][];
  placements: Placement[];
};

const DIRECTIONS: Cell[] = [
  { row: 0, col: 1 }, // right
  { row: 0, col: -1 }, // left
  { row: 1, col: 0 }, // down
  { row: -1, col: 0 }, // up
  { row: 1, col: 1 }, // down-right
  { row: 1, col: -1 }, // down-left
  { row: -1, col: 1 }, // up-right
  { row: -1, col: -1 }, // up-left
];

const FALLBACK_POOL = ["æ", "b", "d", "ɪ", "p", "s", "t"];

function canPlace(
  grid: (string | null)[][],
  units: string[],
  row: number,
  col: number,
  dir: Cell,
  rows: number,
  cols: number,
): boolean {
  const endRow = row + dir.row * (units.length - 1);
  const endCol = col + dir.col * (units.length - 1);
  if (endRow < 0 || endRow >= rows || endCol < 0 || endCol >= cols) return false;

  for (let i = 0; i < units.length; i++) {
    const r = row + dir.row * i;
    const c = col + dir.col * i;
    const existing = grid[r][c];
    if (existing && existing !== units[i]) return false;
  }
  return true;
}

/**
 * Builds a word search grid by randomly placing each word's phonemes in a
 * straight line (8 directions), then filling remaining cells from the pool
 * of phonemes actually used in the word list.
 */
export function buildWordSearch(
  words: PhonemeWord[],
  rows: number,
  cols: number,
): WordSearchPuzzle {
  const grid: (string | null)[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(null),
  );

  const pool: string[] = [];
  words.forEach((w) => {
    w.phonemes.forEach((p) => {
      if (!pool.includes(p)) pool.push(p);
    });
  });
  if (pool.length === 0) pool.push(...FALLBACK_POOL);

  const placements: Placement[] = [];

  words.forEach((word) => {
    const units = word.phonemes;
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 200) {
      attempts++;
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);

      if (canPlace(grid, units, row, col, dir, rows, cols)) {
        const cells: Cell[] = [];
        for (let i = 0; i < units.length; i++) {
          const r = row + dir.row * i;
          const c = col + dir.col * i;
          grid[r][c] = units[i];
          cells.push({ row: r, col: c });
        }
        placements.push({ word, cells });
        placed = true;
      }
    }
  });

  const finalGrid: string[][] = grid.map((r) =>
    r.map((cell) => cell ?? pool[Math.floor(Math.random() * pool.length)]),
  );

  return { rows, cols, grid: finalGrid, placements };
}

export function cellsMatchWord(cells: Cell[], grid: string[][], word: PhonemeWord): boolean {
  const forward = cells.map((c) => grid[c.row][c.col]).join("");
  const backward = [...cells].reverse().map((c) => grid[c.row][c.col]).join("");
  const target = word.phonemes.join("");
  return forward === target || backward === target;
}

/** Straight-line path (inclusive) between two cells, or null if not a line. */
export function getLinePath(a: Cell, b: Cell): Cell[] | null {
  const dr = b.row - a.row;
  const dc = b.col - a.col;
  if (dr === 0 && dc === 0) return [a];
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;

  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  const stepR = dr === 0 ? 0 : dr / steps;
  const stepC = dc === 0 ? 0 : dc / steps;
  const path: Cell[] = [];
  for (let i = 0; i <= steps; i++) {
    path.push({ row: a.row + stepR * i, col: a.col + stepC * i });
  }
  return path;
}
