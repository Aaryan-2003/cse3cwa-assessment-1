"use client";

import { useRef, useState } from "react";
import { phonemeHint } from "@/lib/phonemes";
import {
  cellsMatchWord,
  getLinePath,
  type Cell,
  type WordSearchPuzzle,
} from "@/lib/wordsearch";

function cellKey(cell: Cell) {
  return `${cell.row}-${cell.col}`;
}

export function WordSearchGrid({ puzzle }: { puzzle: WordSearchPuzzle }) {
  const { cols, grid, placements } = puzzle;
  const [foundWordIds, setFoundWordIds] = useState<Set<string>>(new Set());
  const [foundCellKeys, setFoundCellKeys] = useState<Set<string>>(new Set());
  const [activePath, setActivePath] = useState<Cell[]>([]);
  const [showSolutions, setShowSolutions] = useState(false);
  const startCell = useRef<Cell | null>(null);
  const isSelecting = useRef(false);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const allFound = foundWordIds.size === placements.length;

  function cellFromPoint(x: number, y: number): Cell | null {
    const el = document.elementFromPoint(x, y);
    const row = el?.getAttribute("data-row");
    const col = el?.getAttribute("data-col");
    if (row === null || row === undefined || col === null || col === undefined) return null;
    return { row: Number(row), col: Number(col) };
  }

  function beginSelection(cell: Cell) {
    isSelecting.current = true;
    startCell.current = cell;
    setActivePath([cell]);
  }

  function updateSelection(cell: Cell) {
    if (!isSelecting.current || !startCell.current) return;
    const path = getLinePath(startCell.current, cell);
    if (path) setActivePath(path);
  }

  function endSelection() {
    if (!isSelecting.current) return;
    isSelecting.current = false;

    if (activePath.length > 1) {
      for (const placement of placements) {
        if (foundWordIds.has(placement.word.id)) continue;
        if (cellsMatchWord(activePath, grid, placement.word)) {
          setFoundWordIds((prev) => new Set(prev).add(placement.word.id));
          setFoundCellKeys((prev) => {
            const next = new Set(prev);
            placement.cells.forEach((c) => next.add(cellKey(c)));
            return next;
          });
          break;
        }
      }
    }
    setActivePath([]);
  }

  const activeKeys = new Set(activePath.map(cellKey));
  const solutionKeys = showSolutions
    ? new Set(placements.flatMap((p) => p.cells.map(cellKey)))
    : new Set<string>();

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        ref={gridRef}
        role="grid"
        aria-label="Phoneme word search grid"
        className="grid touch-none gap-0.5 rounded-xl border border-zinc-200 bg-zinc-100 p-2 select-none dark:border-zinc-800 dark:bg-zinc-900"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
        onMouseUp={endSelection}
        onMouseLeave={() => {
          if (isSelecting.current) endSelection();
        }}
        onTouchEnd={endSelection}
      >
        {grid.map((rowArr, r) =>
          rowArr.map((symbol, c) => {
            const key = cellKey({ row: r, col: c });
            const isFound = foundCellKeys.has(key);
            const isActive = activeKeys.has(key);
            const isSolution = solutionKeys.has(key);
            return (
              <div
                key={key}
                data-row={r}
                data-col={c}
                role="gridcell"
                title={phonemeHint(symbol)}
                className={`flex aspect-square w-9 items-center justify-center rounded text-sm font-bold sm:w-10 sm:text-base ${
                  isFound
                    ? "bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100"
                    : isActive
                      ? "bg-yellow-200 text-zinc-900"
                      : isSolution
                        ? "bg-pink-200 text-zinc-900 dark:bg-pink-900 dark:text-pink-100"
                        : "bg-white text-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                }`}
                onMouseDown={() => beginSelection({ row: r, col: c })}
                onMouseEnter={() => updateSelection({ row: r, col: c })}
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  const cell = cellFromPoint(touch.clientX, touch.clientY);
                  if (cell) beginSelection(cell);
                }}
                onTouchMove={(e) => {
                  const touch = e.touches[0];
                  const cell = cellFromPoint(touch.clientX, touch.clientY);
                  if (cell) updateSelection(cell);
                }}
              >
                {symbol}
              </div>
            );
          }),
        )}
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => setShowSolutions((s) => !s)}
          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          {showSolutions ? "Hide answers" : "Show answers"}
        </button>

        {allFound && (
          <p className="font-semibold text-green-700 dark:text-green-400" role="status">
            All words found! 🎉
          </p>
        )}

        <ul className="flex flex-wrap justify-center gap-2" aria-label="Word list">
          {placements.map(({ word }) => {
            const found = foundWordIds.has(word.id);
            return (
              <li
                key={word.id}
                title={found ? word.english : undefined}
                className={`rounded-md px-3 py-1 text-sm font-medium ${
                  found
                    ? "bg-green-50 text-green-700 line-through dark:bg-green-950 dark:text-green-400"
                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                }`}
              >
                {word.phonemes.join(" ")}
                {found && <span className="ml-2 no-underline">({word.english})</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
