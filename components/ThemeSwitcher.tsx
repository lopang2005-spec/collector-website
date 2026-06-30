"use client";

import { useTheme } from "@/lib/theme-context";

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as typeof theme)}
      aria-label="Color theme"
      className="rounded border border-border bg-surface px-2 py-1 text-sm text-text"
    >
      {themes.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
    </select>
  );
}
