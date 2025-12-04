"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "../utils/navigation";

interface DesktopNavLinksProps {
  highlightState: {
    highlightStyle: React.CSSProperties;
    setHoveredIndex: (index: number | null) => void;
  };
  refs: {
    navLinksRef: React.RefObject<HTMLDivElement>;
  };
}

export const DesktopNavLinks: React.FC<DesktopNavLinksProps> = ({
  highlightState,
  refs,
}) => {
  const pathname = usePathname();
  const { highlightStyle, setHoveredIndex } = highlightState;

  const isActive = (path: string) => {
    if (path === "/dashboard/projects") {
      return pathname === path || pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  return (
    <div
      className="hidden min-[520px]:flex items-center space-x-0 relative mt-1.5"
      ref={refs.navLinksRef}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <div
        className="transition-all !duration-130"
        style={{
          ...highlightStyle,
          opacity: highlightStyle.opacity || 0,
        }}
      />

      {navLinks.map((link, index) => (
        <div
          key={link.name}
          className="relative text-center h-fit flex items-center justify-center"
        >
          <Link
            href={link.href}
            className="relative text-sm px-4 py-1 mb-0.5 rounded transition-colors duration-150 z-10"
            style={{
              color: isActive(link.href)
                ? "var(--color-fg)"
                : "var(--color-fg-secondary)",
              textDecoration: "none",
            }}
            onMouseEnter={() => setHoveredIndex(index)}
          >
            {link.name}
          </Link>

          <div
            className="absolute bottom-0 left-0 w-full transition-all duration-130"
            style={{
              height: "2px",
              backgroundColor: isActive(link.href)
                ? "var(--color-fg)"
                : "transparent",
              transform: "translateY(6px)",
              opacity: isActive(link.href) ? 1 : 0,
            }}
          />
        </div>
      ))}
    </div>
  );
};
