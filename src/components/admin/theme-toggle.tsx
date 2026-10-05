"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "admin-theme";

function readInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
}

// README: theme is a per-user toggle saved in localStorage (or user
// preferences), not `prefers-color-scheme` — the admin tokens in globals.css
// key off `[data-theme]` on <html>, not OS dark mode.
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      aria-label="Toggle theme"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-admin-border text-[15px] text-admin-muted transition-colors hover:text-admin-text"
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
