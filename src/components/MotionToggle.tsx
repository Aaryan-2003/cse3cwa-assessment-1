"use client";

import { useTheme } from "@/components/ThemeProvider";

export function MotionToggle() {
  const { motion, setMotion } = useTheme();
  const isReduced = motion === "reduced";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isReduced}
      onClick={() => setMotion(isReduced ? "full" : "reduced")}
      className="flex items-center gap-3 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
    >
      <span aria-hidden="true">{isReduced ? "🐢" : "✨"}</span>
      {isReduced ? "Reduced motion" : "Full motion"}
    </button>
  );
}
