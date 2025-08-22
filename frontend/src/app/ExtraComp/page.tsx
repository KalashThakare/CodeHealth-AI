"use client";
import { useState, useEffect } from "react";
import "@/app/glass.css";
import "@/app/DarkVeil.css";
import DarkVeil from "@/components/ui/DarkVeil";

function GlassNav() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    function getTheme(): "light" | "dark" {
      if (typeof window === "undefined") return "dark";
      const currentTheme = document.documentElement.getAttribute(
        "data-theme"
      ) as "light" | "dark";
      return currentTheme || "dark";
    }

    setTheme(getTheme());

    const observer = new MutationObserver(() => {
      const currentTheme = getTheme();
      setTheme(currentTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="dark-veil-container min-h-screen relative">
      {/* Fixed DarkVeil with proper className */}
      <DarkVeil
        speed={2}
      />

      <nav className="glass-nav fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-[var(--color-fg)]">Brand</h1>

            <div className="flex gap-6 items-center">
              <a href="#" className="glass-btn">
                Home
              </a>
              <a href="#" className="glass-btn">
                About
              </a>
              <a href="#" className="glass-btn-primary">
                Contact
              </a>

              {/* Theme toggle button */}
              <button
                onClick={toggleTheme}
                className="glass-btn p-2 ml-4"
                aria-label="Toggle theme"
              >
                <span className="text-lg">
                  {theme === "dark" ? "🌞" : "🌙"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content area with proper z-index and backdrop */}
      <div className="dark-veil-content pt-24 p-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="dark-veil-glass-card p-8 mb-8">
            <h2 className="text-3xl font-bold text-[var(--color-fg)] mb-4">
              Beautiful Glassmorphism
            </h2>
            <p className="text-[var(--color-fg-secondary)] text-lg leading-relaxed">
              This DarkVeil background now perfectly matches your app's theme
              colors from globals.css. It creates a soothing, professional
              atmosphere that complements your glass components beautifully.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="dark-veil-glass-card p-6">
              <h3 className="text-xl font-semibold text-[var(--color-fg)] mb-3">
                Light Theme
              </h3>
              <p className="text-[var(--color-fg-secondary)]">
                Soft purples and gentle gradients create a calming, professional
                appearance.
              </p>
            </div>

            <div className="dark-veil-glass-card p-6">
              <h3 className="text-xl font-semibold text-[var(--color-fg)] mb-3">
                Dark Theme
              </h3>
              <p className="text-[var(--color-fg-secondary)]">
                Deep blues and subtle glows provide an elegant, modern
                atmosphere.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlassNav;

