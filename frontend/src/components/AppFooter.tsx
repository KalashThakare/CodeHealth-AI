"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Sun, Laptop, MoonStar } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme as theme } from "@/hooks/useTheme";
import { useTheme } from "@/components/ui/themeToggle"

export default function AppFooter() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const {
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    isLight,
    isSystem,
  } = useTheme();
  const { isDark } = theme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const hiddenPaths = ["/", "/login", "/signup"];
  if (hiddenPaths.includes(pathname)) {
    return null;
  }

  if (!mounted) {
    return null;
  }
  const navLinks = [
    { href: "/dashboard/projects", label: "Home" },
    { href: "#", label: "Docs", hasDropdown: false },
    { href: "#", label: "Help" },
    { href: "#", label: "Contact" },
  ];

  return (
    <footer className="app-footer">
      <div className="app-footer-container">
        <div className="app-footer-left">
          <Link href="/dashboard/projects">
            <Image
              src={isDark ? "/Logo_Dark.png" : "/Logo_white.png"}
              alt="CodeHealth Logo"
              width={36}
              height={36}
              style={{
                objectFit: "cover",
                borderRadius: "20px",
                alignContent: "center",
              }}
            />
          </Link>

          <nav className="app-footer-nav">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="app-footer-link"
              >
                {link.label}
                {link.hasDropdown && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    style={{ marginLeft: "4px" }}
                  >
                    <path
                      d="M4.5 6L8 9.5L11.5 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                    />
                  </svg>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="app-footer-right">
          <div className="app-footer-status">
            <span className="status-dot"></span>
            <span className="status-text">All systems normal.</span>
          </div>

          <div
            className="rounded-full flex flex-row gap-0 border items-center transition-all"
            style={{
              color: "var(--color-fg-secondary)",
              backgroundColor: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)",
            }}
          >
            <Laptop
              className={`w-6 h-6 p-1 rounded-full ${
                isSystem ? "!border-[1px]" : "border-none"
              }`}
              onClick={setSystemTheme}
            />
            <Sun
              className={`w-6 h-6 p-1 rounded-full ${
                isLight ? "!border-[1px]" : "border-none"
              }`}
              onClick={setLightTheme}
            />
            <MoonStar
              className={`w-6 h-6 p-1 rounded-full ${
                isDark ? "!border-[1px]" : "border-none"
              }`}
              onClick={setDarkTheme}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
