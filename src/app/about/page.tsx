export const metadata = {
  title: "About | Phoneme Activity Builder",
};

export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-12 sm:px-6">
      <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        About this project
      </h2>

      <p className="text-zinc-700 dark:text-zinc-300">
        The Phoneme Activity Builder is the first stage of a larger project:
        a Wordle-style web application builder for Speech Pathology students
        and teachers. Teachers use it to create phoneme-based classroom
        activities that run as standalone HTML pages in any web browser.
      </p>

      <p className="text-zinc-700 dark:text-zinc-300">
        <strong>Assessment 1 is frontend only.</strong> There is no database
        or dynamic word-list management at this stage &mdash; the Wordle tool
        uses one fixed phoneme word, and the Word Search tool uses a small,
        fixed list of phoneme words. Database-driven word lists and richer
        generation options will be introduced in later assessments.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Wordle</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            A phoneme-guessing puzzle where each tile represents a single
            phoneme, e.g. /θ/, /ɪ/, /n/ for &ldquo;thin&rdquo;, instead of
            individual letters.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Word Search</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            A grid puzzle built from a small list of phoneme-based words,
            supporting a literacy and phoneme-recognition activity.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Author</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Aaryan Ram &middot; Student Number: 21256548
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
          Video walkthrough
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          A short video explaining how to use this website will be embedded
          here.
        </p>
        <div className="mt-4 flex aspect-video items-center justify-center rounded-lg border border-dashed border-zinc-300 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-500">
          Video placeholder
        </div>
      </div>
    </div>
  );
}
