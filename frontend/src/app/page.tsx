import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Build phoneme-based classroom activities
        </h2>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          This tool helps Speech Pathology teachers create Wordle-style
          puzzles and word searches built from phonemes rather than standard
          spelling. Configure an activity, preview it, then generate a single
          HTML file students can play in any web browser.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Link
          href="/wordle"
          className="rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:border-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-blue-500"
        >
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Wordle
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Create a phoneme-guessing puzzle from a single target word.
          </p>
        </Link>

        <Link
          href="/word-search"
          className="rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:border-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-blue-500"
        >
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Word Search
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Generate a word search grid from a small list of phoneme-based
            words.
          </p>
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        Want to know more about the project, or need help using it? See the{" "}
        <Link href="/about" className="font-medium text-blue-700 underline dark:text-blue-400">
          About
        </Link>{" "}
        page, or adjust your theme in{" "}
        <Link href="/settings" className="font-medium text-blue-700 underline dark:text-blue-400">
          Settings
        </Link>
        .
      </div>
    </div>
  );
}
