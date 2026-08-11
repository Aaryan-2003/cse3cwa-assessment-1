"use client";

import { useEffect, useState } from "react";
import {
  KEYBOARD_LAYOUT,
  phonemeHint,
  phonemeShortLabel,
  type PhonemeWord,
} from "@/lib/phonemes";
import { evaluateGuess, keyStatusesFromGuesses, type TileStatus } from "@/lib/wordle";

const MAX_ATTEMPTS = 6;

const STATUS_STYLES: Record<TileStatus, string> = {
  correct: "bg-green-600 text-white border-green-600",
  present: "bg-yellow-500 text-white border-yellow-500",
  absent: "bg-zinc-400 text-white border-zinc-400 dark:bg-zinc-700 dark:border-zinc-700",
};

const KEY_STATUS_STYLES: Record<TileStatus, string> = {
  correct: "bg-green-600 text-white border-green-600",
  present: "bg-yellow-500 text-white border-yellow-500",
  absent: "bg-zinc-300 text-zinc-500 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-800",
};

export function WordleGame({ word }: { word: PhonemeWord }) {
  const target = word.phonemes;
  const [guesses, setGuesses] = useState<string[][]>([]);
  const [statuses, setStatuses] = useState<TileStatus[][]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");

  function pushPhoneme(symbol: string) {
    if (status !== "playing" || currentGuess.length >= target.length) return;
    setMessage(null);
    setCurrentGuess((g) => [...g, symbol]);
  }

  function backspace() {
    if (status !== "playing") return;
    setMessage(null);
    setCurrentGuess((g) => g.slice(0, -1));
  }

  function submitGuess() {
    if (status !== "playing") return;
    if (currentGuess.length !== target.length) {
      setMessage(`Select ${target.length} phonemes before submitting.`);
      return;
    }

    const result = evaluateGuess(currentGuess, target);
    const nextGuesses = [...guesses, currentGuess];
    const nextStatuses = [...statuses, result];
    setGuesses(nextGuesses);
    setStatuses(nextStatuses);
    setCurrentGuess([]);

    if (result.every((s) => s === "correct")) {
      setStatus("won");
    } else if (nextGuesses.length >= MAX_ATTEMPTS) {
      setStatus("lost");
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter") submitGuess();
      if (e.key === "Backspace") backspace();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGuess, status, guesses, statuses]);

  const keyStatuses = keyStatusesFromGuesses(guesses, statuses);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        This word has <strong>{target.length} phonemes</strong>. Build your
        guess using the keyboard below.
      </p>

      <div className="flex flex-col gap-1.5" role="grid" aria-label="Wordle guesses">
        {Array.from({ length: MAX_ATTEMPTS }).map((_, row) => {
          const submitted = guesses[row];
          const rowStatuses = statuses[row];
          const isCurrentRow = row === guesses.length && status === "playing";

          return (
            <div key={row} className="flex gap-1.5">
              {Array.from({ length: target.length }).map((_, col) => {
                const symbol = submitted ? submitted[col] : isCurrentRow ? currentGuess[col] : undefined;
                const tileStatus = rowStatuses?.[col];
                return (
                  <div
                    key={col}
                    title={symbol ? phonemeHint(symbol) : undefined}
                    className={`flex h-12 w-12 items-center justify-center rounded-md border-2 text-lg font-bold sm:h-14 sm:w-14 sm:text-xl ${
                      tileStatus
                        ? STATUS_STYLES[tileStatus]
                        : symbol
                          ? "border-zinc-400 text-zinc-900 dark:border-zinc-500 dark:text-zinc-100"
                          : "border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    {symbol ?? ""}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {message && (
        <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
          {message}
        </p>
      )}

      {status === "won" && (
        <div
          className="rounded-xl border border-green-200 bg-green-50 px-6 py-4 text-center dark:border-green-900 dark:bg-green-950"
          role="status"
        >
          <p className="font-semibold text-green-800 dark:text-green-300">
            Correct! 🎉
          </p>
          <p className="mt-1 text-green-700 dark:text-green-400">
            {target.join(" ")} &rarr; <strong>{word.english}</strong>
          </p>
        </div>
      )}

      {status === "lost" && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-center dark:border-red-900 dark:bg-red-950"
          role="status"
        >
          <p className="font-semibold text-red-800 dark:text-red-300">
            Out of guesses.
          </p>
          <p className="mt-1 text-red-700 dark:text-red-400">
            The word was {target.join(" ")} &rarr; <strong>{word.english}</strong>
          </p>
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        {KEYBOARD_LAYOUT.map((row, i) => (
          <div key={i} className="flex flex-wrap justify-center gap-1.5">
            {row.map((symbol) => {
              const keyStatus = keyStatuses[symbol];
              return (
                <button
                  key={symbol}
                  type="button"
                  title={`/${symbol}/ ${phonemeHint(symbol)}`}
                  disabled={status !== "playing"}
                  onClick={() => pushPhoneme(symbol)}
                  className={`min-h-10 min-w-10 rounded-md border px-2.5 py-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    keyStatus
                      ? KEY_STATUS_STYLES[keyStatus]
                      : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {phonemeShortLabel(symbol)}
                </button>
              );
            })}
          </div>
        ))}

        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={backspace}
            disabled={status !== "playing"}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            ⌫ Backspace
          </button>
          <button
            type="button"
            onClick={submitGuess}
            disabled={status !== "playing"}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Submit guess
          </button>
        </div>
      </div>
    </div>
  );
}
