"use client";

import { useEffect, useState } from "react";
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";

export type Theme = "light" | "dark";

type ThemeToggleProps = {
  initialTheme?: Theme;
};

const ThemeToggle = ({ initialTheme }: ThemeToggleProps) => {
  console.log("Initial theme:", initialTheme);
  const [theme, setTheme] = useState<Theme | undefined>(initialTheme);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  useEffect(() => {
    document.cookie = `theme=${theme}; path=/; max-age=31536000`;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <button onClick={toggleTheme} aria-label="Toggle theme">
      {theme === "dark" ? (
        <MdOutlineDarkMode className="text-foreground" />
      ) : (
        <MdOutlineLightMode className="text-foreground" />
      )}
    </button>
  );
};

export default ThemeToggle;
