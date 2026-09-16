"use client";

import { useEffect, useState } from "react";
import { KEYBOARD_LAYOUT, phonemeShortLabel, phonemeHint } from "@/lib/phonemes";
import {
  ApiError,
  createWord,
  deleteWord,
  fetchWords,
  updateWord,
  type ApiWord,
  type Difficulty,
} from "@/lib/api";

const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

function PhonemePicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
        {selected.length === 0 && (
          <span className="text-sm text-zinc-400">Click phonemes below to build the word…</span>
        )}
        {selected.map((symbol, i) => (
          <span
            key={i}
            className="rounded bg-blue-100 px-2 py-0.5 font-mono text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-300"
          >
            {symbol}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        {KEYBOARD_LAYOUT.map((row, i) => (
          <div key={i} className="flex flex-wrap justify-center gap-1">
            {row.map((symbol) => (
              <button
                key={symbol}
                type="button"
                title={`/${symbol}/ ${phonemeHint(symbol)}`}
                onClick={() => onChange([...selected, symbol])}
                className="min-w-8 rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                {phonemeShortLabel(symbol)}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => onChange(selected.slice(0, -1))}
          disabled={selected.length === 0}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          ⌫ Remove last
        </button>
        <button
          type="button"
          onClick={() => onChange([])}
          disabled={selected.length === 0}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export function WordsManager() {
  const [words, setWords] = useState<ApiWord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [english, setEnglish] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
  const [phonemes, setPhonemes] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const data = await fetchWords();
      setWords(data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load words.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  function resetForm() {
    setEnglish("");
    setDifficulty("EASY");
    setPhonemes([]);
    setEditingId(null);
    setFormError(null);
  }

  function startEdit(word: ApiWord) {
    setEditingId(word.id);
    setEnglish(word.english);
    setDifficulty(word.difficulty);
    setPhonemes(word.phonemes);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!english.trim() || phonemes.length === 0) {
      setFormError("Enter an English word and select at least one phoneme.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        await updateWord(editingId, { english: english.trim(), difficulty, phonemes });
      } else {
        await createWord({ english: english.trim(), difficulty, phonemes });
      }
      resetForm();
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to save word.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteWord(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete word.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
          {editingId ? "Edit word" : "Add a word"}
        </h3>

        <div className="flex flex-wrap gap-4">
          <label className="flex flex-col text-sm text-zinc-700 dark:text-zinc-300">
            English spelling
            <input
              type="text"
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              placeholder="e.g. thin"
              className="mt-1 w-48 rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </label>
          <label className="flex flex-col text-sm text-zinc-700 dark:text-zinc-300">
            Difficulty
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="mt-1 rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Phonemes</p>
          <PhonemePicker selected={phonemes} onChange={setPhonemes} />
        </div>

        {formError && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
            {formError}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {editingId ? "Save changes" : "Add word"}
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
      </form>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-50">
          Words ({words?.length ?? "…"})
        </h3>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {!words && !error && <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>}
        {words && (
          <ul className="flex flex-col gap-2">
            {words.map((w) => (
              <li
                key={w.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-900"
              >
                <span className="text-sm">
                  <span className="font-mono font-semibold">{w.phonemes.join(" ")}</span>{" "}
                  <span className="text-zinc-500 dark:text-zinc-400">
                    ({w.english}, {w.difficulty})
                  </span>
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(w)}
                    className="text-xs font-semibold text-blue-700 hover:underline dark:text-blue-400"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(w.id)}
                    className="text-xs font-semibold text-red-700 hover:underline dark:text-red-400"
                  >
                    Delete
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
