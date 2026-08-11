"use client";

import { createContext, useContext, useState, useCallback } from "react";
import {
  MOTION_COOKIE,
  TEXT_SIZE_COOKIE,
  THEME_COOKIE,
  type Motion,
  type TextSize,
  type Theme,
} from "@/lib/theme";

// One year expiry so preferences survive across sessions.
const COOKIE_MAX_AGE = 31536000;

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  motion: Motion;
  setMotion: (motion: Motion) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  initialTheme,
  initialTextSize,
  initialMotion,
  children,
}: {
  initialTheme: Theme;
  initialTextSize: TextSize;
  initialMotion: Motion;
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [textSize, setTextSizeState] = useState<TextSize>(initialTextSize);
  const [motion, setMotionState] = useState<Motion>(initialMotion);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    setCookie(THEME_COOKIE, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const setTextSize = useCallback((next: TextSize) => {
    setTextSizeState(next);
    document.documentElement.classList.toggle("text-large", next === "large");
    setCookie(TEXT_SIZE_COOKIE, next);
  }, []);

  const setMotion = useCallback((next: Motion) => {
    setMotionState(next);
    document.documentElement.classList.toggle("reduce-motion", next === "reduced");
    setCookie(MOTION_COOKIE, next);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, toggleTheme, textSize, setTextSize, motion, setMotion }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
