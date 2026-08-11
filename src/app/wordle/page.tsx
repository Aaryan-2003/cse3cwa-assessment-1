"use client";

import { WordleGame } from "@/components/WordleGame";
import { PHONEME_HINTS, WORDLE_WORD, phonemeHint } from "@/lib/phonemes";
import { generateWordleHtml } from "@/lib/exportWordle";

export default function WordlePage() {
  function handleDownload() {
    const html = generateWordleHtml(WORDLE_WORD);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "phoneme-wordle.html";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
      <div>
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Wordle Builder
        </h2>
        <p className="mt-2 max-w-2xl text-zinc-700 dark:text-zinc-300">
          Assessment 1 uses a single fixed phoneme word. Build guesses using
          the phoneme keyboard &mdash; each button shows a spelled letter
          equivalent, and hovering shows the phonetic symbol and sound.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <WordleGame word={WORDLE_WORD} />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
          Phoneme hint legend
        </h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Example: a keyboard button labelled TH represents{" "}
          <span className="font-mono">/θ/</span>, hovering shows{" "}
          {PHONEME_HINTS["θ"]}.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {WORDLE_WORD.phonemes.map((symbol) => (
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
          ))}
        </ul>
      </div>

      <div>
        <button
          type="button"
          onClick={handleDownload}
          className="rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
        >
          Generate &amp; download HTML
        </button>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Downloads this Wordle activity as a single standalone .html file.
        </p>
      </div>
    </div>
  );
}
