/**
 * Theme Hook
 * Detects and tracks theme changes across the application
 */

import { useState, useEffect } from "react";

export const useTheme = () => {
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const dark = currentTheme === "dark";
      setIsDark(dark);
      setTheme(dark ? "dark" : "light");
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-theme") {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return { isDark, theme };
};
