"use client";

import { useEffect, useState } from "react";
import {
  ApiError,
  createWordList,
  deleteWordList,
  fetchWordList,
  fetchWordLists,
  fetchWords,
  updateWordList,
  type ApiWord,
  type WordListDetail,
  type WordListSummary,
} from "@/lib/api";

export function WordListsManager() {
  const [lists, setLists] = useState<WordListSummary[] | null>(null);
  const [allWords, setAllWords] = useState<ApiWord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedDetail, setExpandedDetail] = useState<WordListDetail | null>(null);
  const [membershipError, setMembershipError] = useState<string | null>(null);

  async function load() {
    try {
      const [listData, wordData] = await Promise.all([fetchWordLists(), fetchWords()]);
      setLists(listData);
      setAllWords(wordData);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load word lists.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setCreateError("Name is required.");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      await createWordList({
        name: name.trim(),
        description: description.trim() || undefined,
        wordIds: selectedWordIds,
      });
      setName("");
      setDescription("");
      setSelectedWordIds([]);
      await load();
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Failed to create word list.");
    } finally {
      setCreating(false);
    }
  }

  function toggleSelectedWord(wordId: string) {
    setSelectedWordIds((ids) =>
      ids.includes(wordId) ? ids.filter((id) => id !== wordId) : [...ids, wordId],
    );
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await deleteWordList(id);
      if (expandedId === id) setExpandedId(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete word list.");
    }
  }

  async function toggleExpand(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedDetail(null);
      return;
    }
    setExpandedId(id);
    setMembershipError(null);
    try {
      const detail = await fetchWordList(id);
      setExpandedDetail(detail);
    } catch (err) {
      setMembershipError(err instanceof ApiError ? err.message : "Failed to load word list.");
    }
  }

  async function toggleMembership(wordId: string, isMember: boolean) {
    if (!expandedDetail) return;
    const currentIds = expandedDetail.words.map((w) => w.id);
    const nextIds = isMember ? currentIds.filter((id) => id !== wordId) : [...currentIds, wordId];
    setMembershipError(null);
    try {
      await updateWordList(expandedDetail.id, { wordIds: nextIds });
      const detail = await fetchWordList(expandedDetail.id);
      setExpandedDetail(detail);
      await load();
    } catch (err) {
      setMembershipError(err instanceof ApiError ? err.message : "Failed to update word list.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Create a word list</h3>
        <div className="flex flex-wrap gap-4">
          <label className="flex flex-col text-sm text-zinc-700 dark:text-zinc-300">
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Term 1 - CH/J sounds"
              className="mt-1 w-64 rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </label>
          <label className="flex flex-col text-sm text-zinc-700 dark:text-zinc-300">
            Description (optional)
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-64 rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </label>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Words ({selectedWordIds.length} selected)
          </p>
          {allWords.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No words yet — add some in the Words tab first, or create this list empty and
              add words to it later.
            </p>
          ) : (
            <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
              {allWords.map((w) => {
                const isSelected = selectedWordIds.includes(w.id);
                return (
                  <label
                    key={w.id}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${
                      isSelected
                        ? "border-blue-400 bg-blue-50 text-blue-900 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        : "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectedWord(w.id)}
                      className="h-3.5 w-3.5"
                    />
                    {w.english}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {createError && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
            {createError}
          </p>
        )}
        <div>
          <button
            type="submit"
            disabled={creating}
            className="rounded-full bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Create list
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-50">
          Word lists ({lists?.length ?? "…"})
        </h3>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {!lists && !error && <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>}
        <ul className="flex flex-col gap-2">
          {lists?.map((list) => (
            <li key={list.id} className="rounded-md bg-zinc-50 dark:bg-zinc-900">
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                <button
                  type="button"
                  onClick={() => toggleExpand(list.id)}
                  className="text-left text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-100"
                >
                  {list.name}{" "}
                  <span className="font-normal text-zinc-500 dark:text-zinc-400">
                    ({list.wordCount} words, {list.activityCount} activities)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(list.id)}
                  className="text-xs font-semibold text-red-700 hover:underline dark:text-red-400"
                >
                  Delete
                </button>
              </div>

              {expandedId === list.id && (
                <div className="border-t border-zinc-200 px-3 py-3 dark:border-zinc-800">
                  {membershipError && (
                    <p className="mb-2 text-sm text-red-600 dark:text-red-400">{membershipError}</p>
                  )}
                  {!expandedDetail && <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>}
                  {expandedDetail && (
                    <>
                      <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Check words to include them in this list:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {allWords.map((w) => {
                          const isMember = expandedDetail.words.some((m) => m.id === w.id);
                          return (
                            <label
                              key={w.id}
                              className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${
                                isMember
                                  ? "border-blue-400 bg-blue-50 text-blue-900 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                  : "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isMember}
                                onChange={() => toggleMembership(w.id, isMember)}
                                className="h-3.5 w-3.5"
                              />
                              {w.english}
                            </label>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
