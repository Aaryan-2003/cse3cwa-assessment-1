export type Theme = "light" | "dark";
export type TextSize = "normal" | "large";
export type Motion = "full" | "reduced";

export const THEME_COOKIE = "theme";
export const TEXT_SIZE_COOKIE = "text-size";
export const MOTION_COOKIE = "motion";

export const DEFAULT_THEME: Theme = "light";
export const DEFAULT_TEXT_SIZE: TextSize = "normal";
export const DEFAULT_MOTION: Motion = "full";

export function isTheme(value: string | undefined): value is Theme {
  return value === "light" || value === "dark";
}

export function isTextSize(value: string | undefined): value is TextSize {
  return value === "normal" || value === "large";
}

export function isMotion(value: string | undefined): value is Motion {
  return value === "full" || value === "reduced";
}
