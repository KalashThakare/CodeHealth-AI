"use client";
import React, { useState, useEffect } from "react";
import "@/app/glass.css";

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
    // <nav className="fixed top-0 left-0 right-0 z-50 glassmorphism-navbar">
    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    //     <div className="flex justify-between items-center h-16 sm:h-18">

    //       <div className="flex-shrink-0 justify-center items-center">
    //         <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-fg)] align-middle">
    //           CodeHealth
    //           <span className="text-[var(--color-primary)] neon-glow-subtle">
    //             AI
    //           </span>
    //         </h1>
    //       </div>

    //       <div className="hidden md:block">
    //         <div className="flex items-baseline space-x-8 lg:space-x-10">
    //           <a
    //             href="#features"
    //             className="nav-link text-[var(--color-fg-secondary)] hover:text-[var(--color-primary)] transition-all duration-300 text-sm lg:text-base font-medium"
    //           >
    //             Features
    //           </a>
    //           <a
    //             href="#pricing"
    //             className="nav-link text-[var(--color-fg-secondary)] hover:text-[var(--color-primary)] transition-all duration-300 text-sm lg:text-base font-medium"
    //           >
    //             Pricing
    //           </a>
    //           <a
    //             href="#docs"
    //             className="nav-link text-[var(--color-fg-secondary)] hover:text-[var(--color-primary)] transition-all duration-300 text-sm lg:text-base font-medium"
    //           >
    //             Docs
    //           </a>
    //           <a
    //             href="#contact"
    //             className="nav-link text-[var(--color-fg-secondary)] hover:text-[var(--color-primary)] transition-all duration-300 text-sm lg:text-base font-medium"
    //           >
    //             Contact
    //           </a>
    //         </div>
    //       </div>

    //       <div className="hidden md:flex items-center space-x-4">
    //         <button
    //           onClick={toggleTheme}
    //           className="glassmorphism-button p-2.5 rounded-xl transition-all duration-300 hover:scale-105"
    //           aria-label="Toggle theme"
    //         >
    //           <span className="text-lg">{theme === "dark" ? "🌞" : "🌙"}</span>
    //         </button>
    //         <button
    //           className="nav-link text-[var(--color-fg-secondary)] hover:text-[var(--color-primary)] transition-all duration-300 text-sm lg:text-base font-medium px-3 py-2 rounded-lg hover:bg-[var(--color-bg-secondary)]/30"
    //           onClick={() =>
    //             (window.location.href = process.env.NEXT_PUBLIC_LOGIN_URL!)
    //           }
    //         >
    //           Login
    //         </button>
    //         <button
    //           className="glassmorphism-button-primary px-4 py-2.5 lg:px-6 text-sm lg:text-base font-semibold rounded-xl transition-all duration-300 hover:scale-105"
    //           onClick={() =>
    //             (window.location.href = process.env.NEXT_PUBLIC_SIGNUP_URL!)
    //           }
    //         >
    //           Sign Up
    //         </button>
    //       </div>

    //       <div className="md:hidden flex items-center space-x-3">
    //         <button
    //           onClick={toggleTheme}
    //           className="glassmorphism-button p-2 rounded-lg transition-all duration-300"
    //           aria-label="Toggle theme"
    //         >
    //           <span className="text-base">
    //             {theme === "dark" ? "🌞" : "🌙"}
    //           </span>
    //         </button>
    //         <button
    //           onClick={() => setIsMenuOpen(!isMenuOpen)}
    //           className="glassmorphism-button p-2 rounded-lg transition-all duration-300"
    //         >
    //           <svg
    //             className="h-5 w-5 sm:h-6 sm:w-6"
    //             fill="none"
    //             viewBox="0 0 24 24"
    //             stroke="currentColor"
    //             strokeWidth={2}
    //           >
    //             {isMenuOpen ? (
    //               <path
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 d="M6 18L18 6M6 6l12 12"
    //               />
    //             ) : (
    //               <path
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 d="M4 6h16M4 12h16M4 18h16"
    //               />
    //             )}
    //           </svg>
    //         </button>
    //       </div>
    //     </div>

    //     {isMenuOpen && (
    //       <div className="md:hidden glassmorphism-dropdown">
    //         <div className="px-4 pt-4 pb-6 space-y-3">
    //           <a
    //             href="#features"
    //             className="block px-4 py-3 text-[var(--color-fg-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-secondary)]/30 rounded-lg transition-all duration-300 font-medium"
    //             onClick={() => setIsMenuOpen(false)}
    //           >
    //             Features
    //           </a>
    //           <a
    //             href="#pricing"
    //             className="block px-4 py-3 text-[var(--color-fg-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-secondary)]/30 rounded-lg transition-all duration-300 font-medium"
    //             onClick={() => setIsMenuOpen(false)}
    //           >
    //             Pricing
    //           </a>
    //           <a
    //             href="#docs"
    //             className="block px-4 py-3 text-[var(--color-fg-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-secondary)]/30 rounded-lg transition-all duration-300 font-medium"
    //             onClick={() => setIsMenuOpen(false)}
    //           >
    //             Docs
    //           </a>
    //           <a
    //             href="#contact"
    //             className="block px-4 py-3 text-[var(--color-fg-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-secondary)]/30 rounded-lg transition-all duration-300 font-medium"
    //             onClick={() => setIsMenuOpen(false)}
    //           >
    //             Contact
    //           </a>
    //           <div className="flex space-x-3 px-2 py-4 border-t border-[var(--color-border)]/30 mt-4 pt-6">
    //             <button
    //               className="flex-1 text-[var(--color-fg-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-secondary)]/30 transition-all duration-300 py-3 rounded-lg font-medium"
    //               onClick={() => {
    //                 window.location.href = process.env.NEXT_PUBLIC_LOGIN_URL!;
    //                 setIsMenuOpen(false);
    //               }}
    //             >
    //               Login
    //             </button>
    //             <button
    //               className="flex-1 glassmorphism-button-primary px-4 py-3 rounded-lg font-semibold transition-all duration-300"
    //               onClick={() => {
    //                 window.location.href = process.env.NEXT_PUBLIC_SIGNUP_URL!;
    //                 setIsMenuOpen(false);
    //               }}
    //             >
    //               Sign Up
    //             </button>
    //           </div>
    //         </div>
    //       </div>
    //     )}
    //   </div>
    // </nav>
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav glass-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-fg)]">
              CodeHealth
              <span className="text-[var(--color-primary)] neon-glow-subtle ml-1">
                AI
              </span>
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
              className="glass-btn p-2 rounded-lg"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "🌞" : "🌙"}
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

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="glass-btn p-2 rounded-lg"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "🌞" : "🌙"}
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden glass-card mt-2 border-t border-[var(--color-border)]/30"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="#features"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors rounded-md"
              >
                Features
              </a>
              <a
                href="#pricing"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors rounded-md"
              >
                Pricing
              </a>
              <a
                href="#docs"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors rounded-md"
              >
                Docs
              </a>
              <a
                href="#contact"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors rounded-md"
              >
                Contact
              </a>

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