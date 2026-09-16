"use client";

import { useEffect, useState } from "react";
import { readDefaultGridSize, writeDefaultGridSize } from "@/lib/wordSearchPrefs";

const MIN_SIZE = 8;
const MAX_SIZE = 15;
const FALLBACK = { rows: 10, cols: 10 };

export function GridSizePreference() {
  const [rows, setRows] = useState(FALLBACK.rows);
  const [cols, setCols] = useState(FALLBACK.cols);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Read the saved preference on the client only, after mount, so the
    // initial render matches the server (localStorage isn't available
    // during SSR).
    const size = readDefaultGridSize(FALLBACK);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows(size.rows);
    setCols(size.cols);
  }, []);

  function handleSave() {
    writeDefaultGridSize({ rows, cols });
    setSaved(true);
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <label className="flex flex-col text-sm text-zinc-700 dark:text-zinc-300">
        Rows
        <input
          type="number"
          min={MIN_SIZE}
          max={MAX_SIZE}
          value={rows}
          onChange={(e) => {
            setRows(Number(e.target.value));
            setSaved(false);
          }}
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
          onChange={(e) => {
            setCols(Number(e.target.value));
            setSaved(false);
          }}
          className="mt-1 w-24 rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>
      <button
        type="button"
        onClick={handleSave}
        className="rounded-full bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Save as default
      </button>
      {saved && (
        <span className="text-sm font-medium text-green-700 dark:text-green-400" role="status">
          Saved
        </span>
      )}
    </div>
  );
}
