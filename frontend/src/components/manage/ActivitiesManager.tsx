"use client";

import { useEffect, useState } from "react";
import {
  ApiError,
  createActivity,
  deleteActivity,
  fetchAllActivities,
  fetchWordLists,
  updateActivity,
  type Activity,
  type ActivityType,
  type Difficulty,
  type WordListSummary,
} from "@/lib/api";

const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

const EMPTY_FORM = {
  type: "WORDLE" as ActivityType,
  title: "",
  wordListId: "",
  wordCount: 5,
  difficulty: "" as Difficulty | "",
  showHints: true,
  gridRows: 10,
  gridCols: 10,
  maxAttempts: 6,
};

export function ActivitiesManager() {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [wordLists, setWordLists] = useState<WordListSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function load() {
    try {
      const [activityData, listData] = await Promise.all([fetchAllActivities(), fetchWordLists()]);
      setActivities(activityData);
      setWordLists(listData);
      if (!form.wordListId && listData.length > 0) {
        setForm((f) => ({ ...f, wordListId: listData[0].id }));
      }
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load activities.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setForm({ ...EMPTY_FORM, wordListId: wordLists[0]?.id ?? "" });
    setEditingId(null);
    setFormError(null);
  }

  function startEdit(activity: Activity) {
    setEditingId(activity.id);
    setForm({
      type: activity.type,
      title: activity.title,
      wordListId: activity.wordListId,
      wordCount: activity.wordCount,
      difficulty: activity.difficulty ?? "",
      showHints: activity.showHints,
      gridRows: activity.gridRows ?? 10,
      gridCols: activity.gridCols ?? 10,
      maxAttempts: activity.maxAttempts ?? 6,
    });
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.wordListId) {
      setFormError("Title and word list are required.");
      return;
    }
    setSaving(true);
    setFormError(null);

    const payload = {
      type: form.type,
      title: form.title.trim(),
      wordListId: form.wordListId,
      wordCount: form.wordCount,
      showHints: form.showHints,
      ...(form.difficulty ? { difficulty: form.difficulty } : {}),
      ...(form.type === "WORD_SEARCH"
        ? { gridRows: form.gridRows, gridCols: form.gridCols }
        : { maxAttempts: form.maxAttempts }),
    };

    try {
      if (editingId) {
        await updateActivity(editingId, payload);
      } else {
        await createActivity(payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to save activity.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await deleteActivity(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete activity.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
          {editingId ? "Edit activity" : "Create an activity"}
        </h3>

        <div className="flex flex-wrap gap-4">
          <label className="flex flex-col text-sm text-zinc-700 dark:text-zinc-300">
            Type
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ActivityType }))}
              className="mt-1 rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="WORDLE">Wordle</option>
              <option value="WORD_SEARCH">Word Search</option>
            </select>
          </label>

          <label className="flex flex-col text-sm text-zinc-700 dark:text-zinc-300">
            Title
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Term 1 Wordle"
              className="mt-1 w-56 rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </label>

          <label className="flex flex-col text-sm text-zinc-700 dark:text-zinc-300">
            Word list
            <select
              value={form.wordListId}
              onChange={(e) => setForm((f) => ({ ...f, wordListId: e.target.value }))}
              className="mt-1 w-56 rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              {wordLists.map((wl) => (
                <option key={wl.id} value={wl.id}>
                  {wl.name} ({wl.wordCount} words)
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-sm text-zinc-700 dark:text-zinc-300">
            Difficulty filter (optional)
            <select
              value={form.difficulty}
              onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as Difficulty | "" }))}
              className="mt-1 rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">Any</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          {form.type === "WORD_SEARCH" && (
            <>
              <label className="flex flex-col text-sm text-zinc-700 dark:text-zinc-300">
                Word count
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={form.wordCount}
                  onChange={(e) => setForm((f) => ({ ...f, wordCount: Number(e.target.value) }))}
                  className="mt-1 w-24 rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </label>
              <label className="flex flex-col text-sm text-zinc-700 dark:text-zinc-300">
                Grid rows
                <input
                  type="number"
                  min={4}
                  max={30}
                  value={form.gridRows}
                  onChange={(e) => setForm((f) => ({ ...f, gridRows: Number(e.target.value) }))}
                  className="mt-1 w-24 rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </label>
              <label className="flex flex-col text-sm text-zinc-700 dark:text-zinc-300">
                Grid columns
                <input
                  type="number"
                  min={4}
                  max={30}
                  value={form.gridCols}
                  onChange={(e) => setForm((f) => ({ ...f, gridCols: Number(e.target.value) }))}
                  className="mt-1 w-24 rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </label>
            </>
          )}

          {form.type === "WORDLE" && (
            <label className="flex flex-col text-sm text-zinc-700 dark:text-zinc-300">
              Max attempts
              <input
                type="number"
                min={1}
                max={20}
                value={form.maxAttempts}
                onChange={(e) => setForm((f) => ({ ...f, maxAttempts: Number(e.target.value) }))}
                className="mt-1 w-24 rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
          )}

          <label className="flex items-center gap-2 self-end pb-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={form.showHints}
              onChange={(e) => setForm((f) => ({ ...f, showHints: e.target.checked }))}
              className="h-4 w-4"
            />
            Show phoneme hints
          </label>
        </div>

        {formError && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
            {formError}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving || wordLists.length === 0}
            className="rounded-full bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {editingId ? "Save changes" : "Create activity"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          )}
        </div>
        {wordLists.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Create a word list first before adding an activity.
          </p>
        )}
      </form>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-50">
          Activities ({activities?.length ?? "…"})
        </h3>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {!activities && !error && <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>}
        <ul className="flex flex-col gap-2">
          {activities?.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-900"
            >
              <span className="text-sm">
                <span className="font-semibold">{a.title}</span>{" "}
                <span className="text-zinc-500 dark:text-zinc-400">
                  ({a.type === "WORDLE" ? "Wordle" : "Word Search"} · {a.wordList.name}
                  {a.difficulty ? ` · ${a.difficulty}` : ""})
                </span>
              </span>
              <span className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(a)}
                  className="text-xs font-semibold text-blue-700 hover:underline dark:text-blue-400"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(a.id)}
                  className="text-xs font-semibold text-red-700 hover:underline dark:text-red-400"
                >
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
