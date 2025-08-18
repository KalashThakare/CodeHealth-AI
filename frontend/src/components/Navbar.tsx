"use client";
import React, { useState, useEffect } from "react";

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-card)]/80 border-b border-[var(--color-border)] backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex-shrink-0 justify-center items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-fg)] align-middle">
              CodeHealth<span className="text-[var(--color-fg-secondary)]">AI</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-baseline space-x-6 lg:space-x-8">
              <a
                href="#features"
                className="text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors text-sm lg:text-base"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors text-sm lg:text-base"
              >
                Pricing
              </a>
              <a
                href="#docs"
                className="text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors text-sm lg:text-base"
              >
                Docs
              </a>
              <a
                href="#contact"
                className="text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors text-sm lg:text-base"
              >
                Contact
              </a>
            </div>
          </div>

          {/* Theme Toggle & Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "🌞" : "🌙"}
            </button>
            <button
              className="text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors text-sm lg:text-base"
              onClick={() =>
                (window.location.href = process.env.NEXT_PUBLIC_LOGIN_URL!)
              }
            >
              Login
            </button>
            <button
              className="btn px-3 py-2 lg:px-4 text-sm lg:text-base"
              onClick={() =>
                (window.location.href = process.env.NEXT_PUBLIC_SIGNUP_URL!)
              }
            >
              Sign Up
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-fg-secondary)]"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "🌞" : "🌙"}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-fg-secondary)]"
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-card)]/95 backdrop-blur-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="#features"
                className="block px-3 py-2 text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block px-3 py-2 text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#docs"
                className="block px-3 py-2 text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Docs
              </a>
              <a
                href="#contact"
                className="block px-3 py-2 text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>
              <div className="flex space-x-4 px-3 py-2 border-t border-[var(--color-border)] mt-2 pt-4">
                <button
                  className="flex-1 text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors py-2"
                  onClick={() => {
                    window.location.href = process.env.NEXT_PUBLIC_LOGIN_URL!;
                    setIsMenuOpen(false);
                  }}
                >
                  Login
                </button>
                <button
                  className="flex-1 btn px-4 py-2"
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
