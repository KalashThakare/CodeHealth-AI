"use client";
import { Moon, Sun } from "lucide-react";
import * as React from "react";

export const DashboardThemeToggle = () => {
  function getInitialTheme(): "light" | "dark" {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return systemDark ? "dark" : "light";
  }

  const [theme, setTheme] = React.useState<"light" | "dark">(getInitialTheme);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 glass-card rounded-lg flex items-center justify-center">
        <div className="w-4 h-4 bg-text/20 rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="glass-btn glass-btn-secondary w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-105 group"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <div className="relative">
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
        ) : (
          <Moon className="w-5 h-5 text-slate-600 group-hover:text-slate-500 transition-colors" />
        )}
      </div>
    </button>
  );
};
