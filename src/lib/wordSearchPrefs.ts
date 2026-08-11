const STORAGE_KEY = "ws-default-grid-size";

export type GridSize = { rows: number; cols: number };

export function readDefaultGridSize(fallback: GridSize): GridSize {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<GridSize>;
    if (typeof parsed.rows === "number" && typeof parsed.cols === "number") {
      return { rows: parsed.rows, cols: parsed.cols };
    }
  } catch {
    // Ignore malformed storage and fall back to the default.
  }
  return fallback;
}

export function writeDefaultGridSize(size: GridSize) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(size));
}
