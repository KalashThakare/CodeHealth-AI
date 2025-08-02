'use client'
import { Moon, Sun } from "lucide-react";
import * as React from "react";

export const Toggle = () => {

  function getInitialTheme(): "light" | "dark" {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
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

  if (!mounted) return null;

  return (
    <button
      type="button"
      className="absolute top-4 right-4"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      style={{ background: "none", border: "none", padding: 0 }}
    >
      {theme === "dark" ? <Sun className="bg-white rounded-full p-1 h-8 w-8 text-yellow-400" /> : <Moon className="bg-black rounded-full p-1 h-8 w-8" />}
    </button>
  );
};