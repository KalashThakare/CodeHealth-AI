"use client";
import { Moon, Sun, Laptop } from "lucide-react";
import * as React from "react";

export const useTheme = () => {
  function getInitialTheme(): "light" | "dark" | "system" {
    if (typeof window === "undefined") return "system";
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark" || stored === "system")
      return stored;
    return "system";
  }

  const [theme, setTheme] = React.useState<"light" | "dark" | "system">(
    getInitialTheme
  );
  const [mounted, setMounted] = React.useState(false);
  const [actualTheme, setActualTheme] = React.useState<"light" | "dark">(
    "light"
  );

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    const updateActualTheme = () => {
      if (theme === "system") {
        const systemDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setActualTheme(systemDark ? "dark" : "light");
        document.documentElement.setAttribute(
          "data-theme",
          systemDark ? "dark" : "light"
        );
      } else {
        setActualTheme(theme);
        document.documentElement.setAttribute("data-theme", theme);
      }
    };

    updateActualTheme();
    localStorage.setItem("theme", theme);
  }, [theme]);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        const systemDark = mq.matches;
        setActualTheme(systemDark ? "dark" : "light");
        document.documentElement.setAttribute(
          "data-theme",
          systemDark ? "dark" : "light"
        );
      }
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setLightTheme = () => setTheme("light");
  const setDarkTheme = () => setTheme("dark");
  const setSystemTheme = () => setTheme("system");
  const toggleTheme = () => setTheme(actualTheme === "dark" ? "light" : "dark");

  return {
    theme,
    actualTheme,
    mounted,
    setTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    toggleTheme,
    isLight: theme === "light",
    isDark: theme === "dark",
    isSystem: theme === "system",
  };
};

export const Toggle = () => {
  const { theme, mounted, setLightTheme, setDarkTheme, setSystemTheme } =
    useTheme();

  if (!mounted) return null;

  return (
    <div
      className="flex items-center rounded-lg p-1 space-x-1"
      style={{ backgroundColor: "var(--color-bg-tertiary)" }}
    >
      <button
        onClick={setSystemTheme}
        className="relative w-7 h-7 rounded-md p-1.5 transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          backgroundColor:
            theme === "system" ? "var(--color-primary)" : "transparent",
          color:
            theme === "system"
              ? "var(--color-btn-fg)"
              : "var(--color-fg-secondary)",
          transform: theme === "system" ? "scale(1.05)" : "scale(1)",
        }}
        title="System theme"
      >
        <Laptop className="w-4 h-4" />
        {theme === "system" && (
          <div
            className="absolute inset-0 rounded-md border pointer-events-none"
            style={{
              borderColor: "var(--color-primary)",
              borderWidth: "1px",
              boxShadow: `0 0 0 1px var(--color-primary)`,
            }}
          />
        )}
      </button>

      <button
        onClick={setDarkTheme}
        className="relative w-7 h-7 rounded-md p-1.5 transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          backgroundColor:
            theme === "dark" ? "var(--color-primary)" : "transparent",
          color:
            theme === "dark"
              ? "var(--color-btn-fg)"
              : "var(--color-fg-secondary)",
          transform: theme === "dark" ? "scale(1.05)" : "scale(1)",
        }}
        title="Dark theme"
      >
        <Moon className="w-4 h-4" />
        {theme === "dark" && (
          <div
            className="absolute inset-0 rounded-md border pointer-events-none"
            style={{
              borderColor: "var(--color-primary)",
              borderWidth: "1px",
              boxShadow: `0 0 0 1px var(--color-primary)`,
            }}
          />
        )}
      </button>

      <button
        onClick={setLightTheme}
        className="relative w-7 h-7 rounded-md p-1.5 transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          backgroundColor:
            theme === "light" ? "var(--color-primary)" : "transparent",
          color:
            theme === "light"
              ? "var(--color-btn-fg)"
              : "var(--color-fg-secondary)",
          transform: theme === "light" ? "scale(1.05)" : "scale(1)",
        }}
        title="Light theme"
      >
        <Sun className="w-4 h-4" />
        {theme === "light" && (
          <div
            className="absolute inset-0 rounded-md border pointer-events-none"
            style={{
              borderColor: "var(--color-primary)",
              borderWidth: "1px",
              boxShadow: `0 0 0 1px var(--color-primary)`,
            }}
          />
        )}
      </button>
    </div>
  );
};

export const SimpleToggle = () => {
  const { theme, mounted, toggleTheme, actualTheme } = useTheme();

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{
        backgroundColor:
          actualTheme === "dark"
            ? "var(--color-primary)"
            : "var(--color-border)",
      }}
    >
      <span
        className={`h-4 w-4 transform rounded-full transition-transform flex items-center justify-center ${
          actualTheme === "dark" ? "translate-x-6" : "translate-x-1"
        }`}
        style={{
          backgroundColor: "var(--color-card)",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        {actualTheme === "dark" ? (
          <Moon className="h-3 w-3" style={{ color: "var(--color-primary)" }} />
        ) : (
          <Sun className="h-3 w-3" style={{ color: "var(--color-primary)" }} />
        )}
      </span>
    </button>
  );
};