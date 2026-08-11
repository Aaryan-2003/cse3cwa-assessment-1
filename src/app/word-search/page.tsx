"use client";

import { useEffect, useState } from "react";
import { WordSearchGrid } from "@/components/WordSearchGrid";
import { PHONEME_HINTS, WORD_SEARCH_WORDS, phonemeHint } from "@/lib/phonemes";
import { buildWordSearch, type WordSearchPuzzle } from "@/lib/wordsearch";
import { generateWordSearchHtml } from "@/lib/exportWordSearch";
import { readDefaultGridSize, writeDefaultGridSize } from "@/lib/wordSearchPrefs";

const MIN_SIZE = 8;
const MAX_SIZE = 15;
const DEFAULT_SIZE = 10;

export default function WordSearchPage() {
  const [rows, setRows] = useState(DEFAULT_SIZE);
  const [cols, setCols] = useState(DEFAULT_SIZE);
  // Puzzle placement uses randomness, so it's generated client-side only
  // (after mount) to avoid a server/client markup mismatch.
  const [puzzle, setPuzzle] = useState<WordSearchPuzzle | null>(null);

  useEffect(() => {
    // Puzzle placement is randomised and the grid-size preference lives in
    // localStorage, so both must be read/set on the client only, after
    // mount, to avoid a server/client markup mismatch.
    const size = readDefaultGridSize({ rows: DEFAULT_SIZE, cols: DEFAULT_SIZE });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows(size.rows);
    setCols(size.cols);
    setPuzzle(buildWordSearch(WORD_SEARCH_WORDS, size.rows, size.cols));
  }, []);

  function regenerate() {
    setPuzzle(buildWordSearch(WORD_SEARCH_WORDS, rows, cols));
    writeDefaultGridSize({ rows, cols });
  }

  function handleDownload() {
    if (!puzzle) return;
    const html = generateWordSearchHtml(puzzle);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "phoneme-word-search.html";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
      <div>
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Word Search Builder
        </h2>
        <p className="mt-2 max-w-2xl text-zinc-700 dark:text-zinc-300">
          A fixed set of five phoneme-based words is used for Assessment 1.
          Drag across the grid to find each word&apos;s phoneme sequence.
          Hover any tile to see its plain-English sound.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Word list</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {WORD_SEARCH_WORDS.map((w) => (
            <li
              key={w.id}
              className="rounded-md bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            >
              {w.phonemes.join(" ")}{" "}
              <span className="text-zinc-600 dark:text-zinc-400">({w.english})</span>
            </li>
          ))}
        </ul>

        <h3 className="mt-5 font-semibold text-zinc-900 dark:text-zinc-50">
          Grid size
        </h3>
        <div className="mt-3 flex flex-wrap items-end gap-4">
          <label className="flex flex-col text-sm text-zinc-700 dark:text-zinc-300">
            Rows
            <input
              type="number"
              min={MIN_SIZE}
              max={MAX_SIZE}
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="mt-1 w-24 rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </label>
          <label className="flex flex-col text-sm text-zinc-700 dark:text-zinc-300">
            Columns
            <input
              type="number"
              min={MIN_SIZE}
              max={MAX_SIZE}
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              className="mt-1 w-24 rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </label>
          <button
            type="button"
            onClick={regenerate}
            className="rounded-full bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Regenerate puzzle
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Preview</h3>
        <div className="mt-4 overflow-x-auto">
          {puzzle ? (
            <WordSearchGrid key={`${puzzle.rows}x${puzzle.cols}-${puzzle.grid.flat().join("")}`} puzzle={puzzle} />
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Generating puzzle…</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
          Phoneme hint legend
        </h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Hover any grid tile to see this hint. Symbols used in this puzzle:
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {Array.from(new Set(WORD_SEARCH_WORDS.flatMap((w) => w.phonemes))).map(
            (symbol) => (
              <li
                key={symbol}
                title={PHONEME_HINTS[symbol]}
                className="rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="font-mono font-semibold">/{symbol}/</span>{" "}
                <span className="text-zinc-500 dark:text-zinc-400">
                  {phonemeHint(symbol)}
                </span>
              </li>
            ),
          )}
        </ul>
      </div>

      <div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!puzzle}
          className="rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Generate &amp; download HTML
        </button>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Downloads the puzzle shown above as a single standalone .html file.
        </p>
      </div>
    </div>
  );
}
