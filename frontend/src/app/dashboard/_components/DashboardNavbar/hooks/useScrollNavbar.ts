import { useState, useEffect } from "react";

export const useScrollNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Hide immediately when scrolling down (any downward scroll)
          if (currentScrollY > lastScrollY && currentScrollY > 0) {
            setIsScrolled(true);
          }
          // Show when near the top (within 35px threshold)
          else if (currentScrollY <= 40) {
            setIsScrolled(false);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    };

    // Check initial scroll position
    if (window.scrollY <= 10) {
      setIsScrolled(false);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { isScrolled };
};
