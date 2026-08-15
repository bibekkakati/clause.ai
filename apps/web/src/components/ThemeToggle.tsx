import React, { useEffect, useState } from "react";
import { IconMoon, IconSun } from "./icons/CustomIcons";

export type Theme = "dark" | "light";

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme") as Theme;
      if (saved) return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <button
      onClick={toggleTheme}
      className={`btn btn-secondary btn-sm ${className}`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-label="Toggle Color Theme"
      type="button"
      style={{
        padding: "6px 10px",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {theme === "dark" ? (
        <>
          <IconSun size={14} />
          <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>Light</span>
        </>
      ) : (
        <>
          <IconMoon size={14} />
          <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>Dark</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
