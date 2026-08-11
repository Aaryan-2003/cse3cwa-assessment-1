export type Theme = "light" | "dark";

export const THEME_COOKIE = "theme";
export const DEFAULT_THEME: Theme = "light";

export function isTheme(value: string | undefined): value is Theme {
  return value === "light" || value === "dark";
}
