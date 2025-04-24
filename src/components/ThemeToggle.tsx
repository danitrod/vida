"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      {
        /* document.documentElement.classList.add("dark"); */
      }
    } else {
      setIsDark(false);
      {
        /* document.documentElement.classList.remove("dark"); */
      }
    }
  }, []);

  useEffect(() => {
    if (isDark === null) return;

    const root = document.documentElement;
    if (isDark) {
      {
        /* root.classList.add("dark"); */
      }
      localStorage.setItem("theme", "dark");
    } else {
      {
        /* root.classList.remove("dark"); */
      }
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="px-4 py-2 rounded bg-[#DDA15E] text-[#283618] dark:bg-[#606C38] dark:text-[#FEFAE0] hover:opacity-90"
    >
      {isDark ? "Modo claro" : "Modo escuro"}
    </button>
  );
}
