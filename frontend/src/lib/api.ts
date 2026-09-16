export type ApiWord = {
  id: string;
  english: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  phonemes: string[];
};

export type ActivitySummary = {
  id: string;
  type: "WORDLE" | "WORD_SEARCH";
  title: string;
};

export type GeneratedActivity = {
  activity: {
    id: string;
    type: "WORDLE" | "WORD_SEARCH";
    title: string;
    showHints: boolean;
    gridRows: number | null;
    gridCols: number | null;
    maxAttempts: number | null;
  };
  words: ApiWord[];
  hints: Record<string, string>;
};

// Backend base URL. Set NEXT_PUBLIC_API_URL for Docker/deployed
// environments; defaults to the local dev port used by `npm run dev`
// in api/.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
  }
}

async function apiFetch<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  } catch {
    throw new ApiError(
      "Could not reach the backend. Make sure the API server is running.",
    );
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.error ?? `Request failed (${res.status})`, res.status);
  }
  return res.json() as Promise<T>;
}

export function fetchActivities(type?: "WORDLE" | "WORD_SEARCH") {
  const query = type ? `?type=${type}` : "";
  return apiFetch<ActivitySummary[]>(`/api/activities${query}`);
}

export function generateActivity(activityId: string) {
  return apiFetch<GeneratedActivity>(`/api/activities/${activityId}/generate`);
}
