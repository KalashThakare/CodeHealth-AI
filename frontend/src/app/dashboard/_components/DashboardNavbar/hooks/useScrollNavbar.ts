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
          
          // Calculate total scrollable height
          const documentHeight = document.documentElement.scrollHeight;
          const windowHeight = window.innerHeight;
          const maxScrollableHeight = documentHeight - windowHeight;

          // If content is not scrollable or scrollable less than 20px, keep navbar open
          if (maxScrollableHeight <= 20) {
            setIsScrolled(false);
            lastScrollY = currentScrollY;
            ticking = false;
            return;
          }

          // Hide immediately when scrolling down (any downward scroll)
          if (currentScrollY > lastScrollY && currentScrollY > 0) {
            setIsScrolled(true);
          }
          // Show when near the top (within 40px threshold)
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
      
      // If content is not scrollable or barely scrollable, keep navbar open
      if (maxScrollableHeight <= 20 || window.scrollY <= 10) {
        setIsScrolled(false);
      }
    };

    // Check initial scroll position and scrollability
    checkScrollability();

    // Also check when window is resized (content might become scrollable/non-scrollable)
    window.addEventListener("resize", checkScrollability);
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkScrollability);
    };
  }, []);

  return { isScrolled };
};
