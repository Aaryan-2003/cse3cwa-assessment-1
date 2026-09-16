export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type ActivityType = "WORDLE" | "WORD_SEARCH";

export type ApiPhoneme = {
  id: string;
  symbol: string;
  hint: string;
};

export type ApiWord = {
  id: string;
  english: string;
  difficulty: Difficulty;
  phonemes: string[];
};

export type WordListSummary = {
  id: string;
  name: string;
  description: string | null;
  wordCount: number;
  activityCount: number;
};

export type WordListDetail = {
  id: string;
  name: string;
  description: string | null;
  words: ApiWord[];
};

export type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  wordListId: string;
  wordCount: number;
  difficulty: Difficulty | null;
  showHints: boolean;
  gridRows: number | null;
  gridCols: number | null;
  maxAttempts: number | null;
  wordList: { id: string; name: string };
};

export type ActivitySummary = {
  id: string;
  type: ActivityType;
  title: string;
};

export type GeneratedActivity = {
  activity: {
    id: string;
    type: ActivityType;
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
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

async function apiFetch<T>(
  path: string,
  options?: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown },
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: options?.method ?? "GET",
      cache: "no-store",
      headers: options?.body ? { "Content-Type": "application/json" } : undefined,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Could not reach the backend. Make sure the API server is running.",
    );
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.error ?? `Request failed (${res.status})`, res.status, body?.details);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Phonemes

export function fetchPhonemes() {
  return apiFetch<ApiPhoneme[]>("/api/phonemes");
}

// Words

export function fetchWords() {
  return apiFetch<ApiWord[]>("/api/words");
}

export function createWord(data: { english: string; difficulty: Difficulty; phonemes: string[] }) {
  return apiFetch<ApiWord>("/api/words", { method: "POST", body: data });
}

export function updateWord(
  id: string,
  data: Partial<{ english: string; difficulty: Difficulty; phonemes: string[] }>,
) {
  return apiFetch<ApiWord>(`/api/words/${id}`, { method: "PATCH", body: data });
}

export function deleteWord(id: string) {
  return apiFetch<void>(`/api/words/${id}`, { method: "DELETE" });
}

// Word lists

export function fetchWordLists() {
  return apiFetch<WordListSummary[]>("/api/word-lists");
}

export function fetchWordList(id: string) {
  return apiFetch<WordListDetail>(`/api/word-lists/${id}`);
}

export function createWordList(data: { name: string; description?: string; wordIds?: string[] }) {
  return apiFetch<WordListSummary>("/api/word-lists", { method: "POST", body: data });
}

export function updateWordList(
  id: string,
  data: Partial<{ name: string; description: string | null; wordIds: string[] }>,
) {
  return apiFetch<WordListSummary>(`/api/word-lists/${id}`, { method: "PATCH", body: data });
}

export function deleteWordList(id: string) {
  return apiFetch<void>(`/api/word-lists/${id}`, { method: "DELETE" });
}

// Activities

export function fetchActivities(type?: ActivityType) {
  const query = type ? `?type=${type}` : "";
  return apiFetch<ActivitySummary[]>(`/api/activities${query}`);
}

export function fetchAllActivities() {
  return apiFetch<Activity[]>("/api/activities");
}

export function createActivity(data: {
  type: ActivityType;
  title: string;
  wordListId: string;
  wordCount?: number;
  difficulty?: Difficulty;
  showHints?: boolean;
  gridRows?: number;
  gridCols?: number;
  maxAttempts?: number;
}) {
  return apiFetch<Activity>("/api/activities", { method: "POST", body: data });
}

export function updateActivity(id: string, data: Partial<Parameters<typeof createActivity>[0]>) {
  return apiFetch<Activity>(`/api/activities/${id}`, { method: "PATCH", body: data });
}

export function deleteActivity(id: string) {
  return apiFetch<void>(`/api/activities/${id}`, { method: "DELETE" });
}

export function generateActivity(activityId: string) {
  return apiFetch<GeneratedActivity>(`/api/activities/${activityId}/generate`);
}
