"use client";
import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import "@/app/glass.css";
import Link from "next/link";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    function getTheme(): "light" | "dark" {
      if (typeof window === "undefined") return "dark";
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      return systemDark ? "dark" : "light";
    }

    setTheme(getTheme());

    const observer = new MutationObserver(() => {
      const currentTheme = document.documentElement.getAttribute(
        "data-theme"
      ) as "light" | "dark";
      if (currentTheme && currentTheme !== theme) {
        setTheme(currentTheme);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav glass-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="shrink-0 flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-(--color-fg)">
              CodeHealth
              <span className="text-(--color-primary) neon-glow-subtle ml-1">
                AI
              </span>
            </h1>
          </div>

          <div className="hidden md:block">
            <div className="flex items-baseline space-x-6 lg:space-x-8">
              <Link
                href="#features"
                className="text-(--color-fg-secondary) hover:text-(--color-fg) transition-colors text-sm lg:text-base"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors text-sm lg:text-base"
              >
                Pricing
              </Link>
              <Link
                href="#docs"
                className="text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors text-sm lg:text-base"
              >
                Docs
              </Link>
              <Link
                href="#contact"
                className="text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors text-sm lg:text-base"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <button
              onClick={toggleTheme}
              className="text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors text-sm lg:text-base px-3 py-2 rounded-lg"
              aria-label="Toggle theme"
              style={{ color: "var(--color-bg)" }}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <button
              className="text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors text-sm lg:text-base px-3 py-2 rounded-lg"
              onClick={() =>
                (window.location.href = process.env.NEXT_PUBLIC_LOGIN_URL!)
              }
            >
              Login
            </button>

            <button
              className="glass-btn-primary px-3 py-2 lg:px-4 text-sm lg:text-base rounded-lg"
              onClick={() =>
                (window.location.href = process.env.NEXT_PUBLIC_SIGNUP_URL!)
              }
            >
              Sign Up
            </button>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="glass-btn p-2 rounded-lg transition-all duration-200"
              aria-label="Toggle theme"
              style={{ color: "var(--color-fg-secondary)" }}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="glass-btn p-2 rounded-lg"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden glass-card mt-2 border-t border-[var(--color-border)]/30"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="#features"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors rounded-md"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors rounded-md"
              >
                Pricing
              </Link>
              <Link
                href="#docs"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors rounded-md"
              >
                Docs
              </Link>
              <Link
                href="#contact"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors rounded-md"
              >
                Contact
              </Link>

              <div className="flex space-x-4 px-3 py-2 border-t border-[var(--color-border)] mt-2 pt-4">
                <button
                  className="flex-1 text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors py-2 rounded-md"
                  onClick={() => {
                    window.location.href = process.env.NEXT_PUBLIC_LOGIN_URL!;
                    setIsMenuOpen(false);
                  }}
                >
                  Login
                </button>
                <button
                  className="flex-1 glass-btn-primary px-4 py-2 rounded-md"
                  onClick={() => {
                    window.location.href = process.env.NEXT_PUBLIC_SIGNUP_URL!;
                    setIsMenuOpen(false);
                  }}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
