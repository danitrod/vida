"use client";

import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";

export type Theme = "light" | "dark";

const isDarkNow = () => {
  const root = document.documentElement;
  if (root.classList.contains("dark")) return true;
  if (root.classList.contains("light")) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

// Until the reader toggles, the theme follows the device preference (CSS
// only, see globals.css). Toggling stores an explicit choice in the `theme`
// cookie, which the root layout server-renders as a class on <html>.
const ThemeToggle = () => {
  const toggleTheme = () => {
    const next: Theme = isDarkNow() ? "light" : "dark";
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(next);
    document.cookie = `theme=${next}; path=/; max-age=31536000; samesite=lax`;
  };

  // Both icons are rendered; CSS shows the one matching the active theme, so
  // it is right from the first paint without knowing the theme in JS.
  return (
    <button onClick={toggleTheme} aria-label="alternar tema">
      <MdOutlineLightMode className="text-foreground dark:hidden" />
      <MdOutlineDarkMode className="hidden text-foreground dark:block" />
    </button>
  );
};

export default ThemeToggle;
