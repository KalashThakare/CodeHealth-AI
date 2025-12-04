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

          const documentHeight = document.documentElement.scrollHeight;
          const windowHeight = window.innerHeight;
          const maxScrollableHeight = documentHeight - windowHeight;

          if (maxScrollableHeight <= 20) {
            setIsScrolled(false);
            lastScrollY = currentScrollY;
            ticking = false;
            return;
          }

          if (currentScrollY > lastScrollY && currentScrollY > 0) {
            setIsScrolled(true);
          }
          else if (currentScrollY <= 40) {
            setIsScrolled(false);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    };

    const checkScrollability = () => {
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const maxScrollableHeight = documentHeight - windowHeight;

      if (maxScrollableHeight <= 20 || window.scrollY <= 10) {
        setIsScrolled(false);
      }
    };

    checkScrollability();

    window.addEventListener("resize", checkScrollability);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkScrollability);
    };
  }, []);

  return { isScrolled };
};
