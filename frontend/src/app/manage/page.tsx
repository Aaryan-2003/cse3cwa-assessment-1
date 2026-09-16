"use client";

import { useState } from "react";
import { WordsManager } from "@/components/manage/WordsManager";
import { WordListsManager } from "@/components/manage/WordListsManager";
import { ActivitiesManager } from "@/components/manage/ActivitiesManager";

const TABS = [
  { id: "words", label: "Words" },
  { id: "word-lists", label: "Word lists" },
  { id: "activities", label: "Activities" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ManagePage() {
  const [tab, setTab] = useState<TabId>("words");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
      <div>
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Manage Content
        </h2>
        <p className="mt-2 max-w-2xl text-zinc-700 dark:text-zinc-300">
          Create and manage phoneme-based words, group them into word lists,
          and configure the Wordle and Word Search activities that draw from
          them. Everything here is saved to the database and used directly
          by the Wordle and Word Search pages.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Manage content sections"
        className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium ${
              tab === t.id
                ? "border-b-2 border-blue-700 text-blue-700 dark:border-blue-400 dark:text-blue-400"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "words" && <WordsManager />}
      {tab === "word-lists" && <WordListsManager />}
      {tab === "activities" && <ActivitiesManager />}
    </div>
  );
}
