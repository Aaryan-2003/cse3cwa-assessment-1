import { ThemeToggle } from "@/components/ThemeToggle";
import { TextSizeToggle } from "@/components/TextSizeToggle";
import { MotionToggle } from "@/components/MotionToggle";
import { GridSizePreference } from "@/components/GridSizePreference";

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
        Interface and accessibility preferences. Theme, text size, and
        motion are saved in cookies and remembered site-wide; the Word
        Search grid size is an optional layout preference saved on this
        device.
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

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Text size</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Increase text and control size across the whole site for easier
          reading.
        </p>
        <div className="mt-4">
          <TextSizeToggle />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Motion</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Reduce animations and transitions across the site.
        </p>
        <div className="mt-4">
          <MotionToggle />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
          Word Search default grid size
        </h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Sets the grid size the Word Search builder starts with. You can
          still change it per-puzzle on that page.
        </p>
        <div className="mt-4">
          <GridSizePreference />
        </div>
      </div>
    </div>
  );
}
