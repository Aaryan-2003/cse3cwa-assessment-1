export const metadata = {
  title: "Wordle | Phoneme Activity Builder",
};

export default function WordlePage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-12 sm:px-6">
      <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        Wordle Builder
      </h2>
      <p className="text-zinc-700 dark:text-zinc-300">
        Configure and preview a phoneme-based Wordle activity. Coming soon.
      </p>
    </div>
  );
}
