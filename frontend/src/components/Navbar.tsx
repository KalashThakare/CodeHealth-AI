"use client";
import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import "@/app/glass.css";
import "@/app/landing.css";
import Link from "next/link";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [scrolled, setScrolled] = useState(false);

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

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-nav glass-theme" : ""
      }`}
      style={{
        backgroundColor: scrolled ? undefined : "transparent",
        borderBottom: scrolled ? "1px solid var(--color-border)" : "none",
      }}
    >
      <div className="landing-container">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="shrink-0 flex items-center">
            <Link
              href="/"
              className="flex items-center"
              style={{ textDecoration: "none" }}
            >
              <h1
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: "var(--color-fg)", textDecoration: "none" }}
              >
                CodeHealth
                <span
                  className="neon-glow-subtle ml-0.5"
                  style={{ color: "var(--color-primary)", textDecoration: "none" }}
                >
                  AI
                </span>
              </h1>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="flex items-baseline space-x-6 lg:space-x-8">
              <Link
                href="#features"
                className="text-sm lg:text-base font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--color-fg-secondary)", textDecoration: "none" }}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm lg:text-base font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--color-fg-secondary)", textDecoration: "none" }}
              >
                How It Works
              </Link>
              <Link
                href="#docs"
                className="text-sm lg:text-base font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--color-fg-secondary)", textDecoration: "none" }}
              >
                Docs
              </Link>
              <Link
                href="#contact"
                className="text-sm lg:text-base font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--color-fg-secondary)", textDecoration: "none" }}
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="rounded-2xl! transition-all duration-200"
              aria-label="Toggle theme"
              style={{
                backgroundColor: "transparent",
                border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.1)",
                color: theme === "dark" ? "#ffffff" : "#18181b",
                paddingInline: "0.75rem",
                paddingBlock: "0.5rem",
              }}
            >
              {theme === "dark" ? (
                <Sun className="w-5.5 h-5.5" />
              ) : (
                <Moon className="w-5.5 h-5.5" />
              )}
            </button>

            <button
              className="landing-btn-ghost !py-2 !px-4 text-sm"
              onClick={() =>
                (window.location.href = process.env.NEXT_PUBLIC_LOGIN_URL!)
              }
            >
              Login
            </button>

            <button
              className="landing-btn-primary !py-2 !px-4 text-sm whitespace-nowrap"
              onClick={() =>
                (window.location.href = process.env.NEXT_PUBLIC_SIGNUP_URL!)
              }
            >
              Get Started
            </button>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="rounded-2xl! transition-all duration-200"
              aria-label="Toggle theme"
              style={{
                backgroundColor: "transparent",
                border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.1)",
                color: theme === "dark" ? "#ffffff" : "#18181b",
                paddingInline: "0.75rem",
                paddingBlock: "0.5rem",
              }}
            >
              {theme === "dark" ? (
                <Sun className="w-5.5 h-5.5" />
              ) : (
                <Moon className="w-5.5 h-5.5" />
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-xl! flex items-center justify-center transition-all duration-200"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              style={{
                backgroundColor: "transparent",
                border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.1)",
                color: theme === "dark" ? "#ffffff" : "#18181b",
                padding: "0.5rem 0.75rem",
              }}
            >
              <svg
                className="h-5 w-5"
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
            className="md:hidden rounded-xl mt-3 overflow-hidden"
            style={{
              backgroundColor: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border)",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div className="p-4 space-y-1">
              <Link
                href="#features"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                style={{
                  color: "var(--color-fg)",
                  textDecoration: "none",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-bg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                style={{
                  color: "var(--color-fg)",
                  textDecoration: "none",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-bg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                How It Works
              </Link>
              <Link
                href="#docs"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                style={{
                  color: "var(--color-fg)",
                  textDecoration: "none",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-bg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Docs
              </Link>
              <Link
                href="#contact"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
                style={{
                  color: "var(--color-fg)",
                  textDecoration: "none",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-bg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Contact
              </Link>

              <div
                className="flex gap-3 pt-4 mt-3"
                style={{ borderTop: "1px solid var(--color-border)" }}
              >
                <button
                  className="flex-1 landing-btn-ghost !py-3 text-base"
                  onClick={() => {
                    window.location.href = process.env.NEXT_PUBLIC_LOGIN_URL!;
                    setIsMenuOpen(false);
                  }}
                >
                  Login
                </button>
                <button
                  className="flex-1 landing-btn-primary !py-3 text-base whitespace-nowrap"
                  onClick={() => {
                    window.location.href = process.env.NEXT_PUBLIC_SIGNUP_URL!;
                    setIsMenuOpen(false);
                  }}
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
