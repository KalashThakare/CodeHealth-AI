import { useState, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { HighlightState, DropdownRefs } from "../types";
import { navLinks, isActive } from "../utils/navigation";

export const useHighlightEffect = (refs: DropdownRefs): HighlightState => {
  const pathname = usePathname();
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!refs.navLinksRef.current) return;

    const activeIndex = navLinks.findIndex((link) =>
      isActive(link.href, pathname)
    );
    const targetIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

    if (targetIndex === -1) {
      setHighlightStyle({ opacity: 0 });
      return;
    }

    const linkElements =
      refs.navLinksRef.current.querySelectorAll<HTMLAnchorElement>("a");
    const targetElement = linkElements[targetIndex];

    if (targetElement) {
      const containerRect = refs.navLinksRef.current.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();

      setHighlightStyle({
        position: "absolute",
        left: targetRect.left - containerRect.left,
        top: 0,
        width: targetRect.width,
        height: targetRect.height,
        backgroundColor:
          hoveredIndex !== null
            ? "var(--color-border)"
            : "var(--color-bg-secondary)",
        borderRadius: "0.375rem",
        transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: 1,
        zIndex: 0,
      });
    }
  }, [pathname, hoveredIndex, refs.navLinksRef]);

  return {
    highlightStyle,
    setHighlightStyle,
    hoveredIndex,
    setHoveredIndex,
  };
};
