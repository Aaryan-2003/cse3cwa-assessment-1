"use client";

import { useEffect, useState } from "react";
import { ApiError, fetchStats, type DashboardStats } from "@/lib/api";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; stats: DashboardStats };

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
      {sub && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{sub}</p>}
    </div>
  );
}

function formatDuration(ms: number | null) {
  if (ms === null) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function formatPath(path: string) {
  if (path === "/") return "Home";
  return path
    .slice(1)
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export default function DashboardPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function load() {
    setState({ status: "loading" });
    try {
      const stats = await fetchStats();
      setState({ status: "ready", stats });
      setLastUpdated(new Date());
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof ApiError ? err.message : "Failed to load dashboard stats.",
      });
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard</h2>
          <p className="mt-2 max-w-2xl text-zinc-700 dark:text-zinc-300">
            Live operational statistics for the Phoneme Activity Builder, read directly from the
            database: stored content, activity generation volume, and usage over time.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={load}
            disabled={state.status === "loading"}
            className="rounded-full bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state.status === "loading" ? "Refreshing…" : "Refresh"}
          </button>
          {lastUpdated && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {state.status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          <p>{state.message}</p>
          <button
            type="button"
            onClick={load}
            className="mt-3 rounded-full border border-red-300 bg-white px-4 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
          >
            Try again
          </button>
        </div>
      )}

      {state.status === "loading" && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading dashboard…</p>
      )}

      {state.status === "ready" && (
        <>
          {/* Health */}
          <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`h-3 w-3 rounded-full ${
                  state.stats.health.status === "ok" ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                System {state.stats.health.status === "ok" ? "healthy" : "unhealthy"}
              </h3>
            </div>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Database: {state.stats.health.database} — backed by{" "}
              <code className="font-mono text-xs">GET /api/health</code>
            </p>
          </section>

          {/* Content counts */}
          <section>
            <h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-50">Stored content</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <StatCard label="Words" value={state.stats.counts.words} />
              <StatCard label="Word lists" value={state.stats.counts.wordLists} />
              <StatCard
                label="Activities"
                value={state.stats.counts.activities}
                sub={`${state.stats.counts.activitiesByType.WORDLE} Wordle · ${state.stats.counts.activitiesByType.WORD_SEARCH} Word Search`}
              />
            </div>
          </section>

          {/* Generation */}
          <section>
            <h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-50">
              Activity generation
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <StatCard label="Successful generations" value={state.stats.generation.successCount} />
              <StatCard label="Failed generations" value={state.stats.generation.failureCount} />
              <StatCard
                label="Most-used activity type"
                value={
                  state.stats.generation.mostUsedActivityType === "WORDLE"
                    ? "Wordle"
                    : state.stats.generation.mostUsedActivityType === "WORD_SEARCH"
                      ? "Word Search"
                      : "—"
                }
              />
            </div>
          </section>

          {/* Page views */}
          <section>
            <h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-50">
              Usage: time on page
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <StatCard label="Page views recorded" value={state.stats.pageViews.count} />
              <StatCard
                label="Average time on page"
                value={formatDuration(state.stats.pageViews.averageDurationMs)}
              />
            </div>

            {Object.keys(state.stats.pageViews.byPath).length > 0 && (
              <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                    <tr>
                      <th className="px-4 py-2">Page</th>
                      <th className="px-4 py-2">Views</th>
                      <th className="px-4 py-2">Avg. time on page</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {Object.entries(state.stats.pageViews.byPath)
                      .sort((a, b) => b[1].count - a[1].count)
                      .map(([path, data]) => (
                        <tr key={path}>
                          <td className="px-4 py-2 font-medium text-zinc-900 dark:text-zinc-100">
                            {formatPath(path)}
                          </td>
                          <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">{data.count}</td>
                          <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                            {formatDuration(data.averageDurationMs)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
