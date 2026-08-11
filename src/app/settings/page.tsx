import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata = {
  title: "Settings | Phoneme Activity Builder",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-12 sm:px-6">
      <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        Settings
      </h2>
      <p className="text-zinc-700 dark:text-zinc-300">
        Choose your preferred appearance. Your choice is saved in a cookie
        and remembered the next time you visit.
      </p>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Theme</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Switch between light and dark mode.
        </p>
        <div className="mt-4">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
