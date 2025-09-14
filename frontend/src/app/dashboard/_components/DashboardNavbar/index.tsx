"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useNavbarState } from "./hooks/useNavbarState";
import { useDropdownClose } from "./hooks/useDropdownClose";
import { useHighlightEffect } from "./hooks/useHighlightEffect";
import { LeftSection } from "./components/LeftSection";
import { RightSection } from "./components/RightSection";
import { DesktopNavLinks } from "./components/DesktopNavLinks";
import { FeedbackModal } from "./components/FeedbackModal";
import { DashboardNavbarProps } from "./types";

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  currentTeam,
}) => {
  const router = useRouter();
  const { logout } = useAuthStore();

  // State management
  const state = useNavbarState();
  const refs = useDropdownClose(state);
  const highlightState = useHighlightEffect(refs);

  // Handler functions
  const handleLogOut = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <>
      {/* Main Navbar */}
      <nav
        className="sticky h-fit pt-3 pb-1.5 top-0 z-50 border-b transition-all duration-200"
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="h-fit mx-auto px-1 sm:px-6">
          <div className="flex-col items-center justify-between">
            <div className="flex justify-between items-center space-x-8">
              {/* Left Section */}
              <LeftSection state={state} refs={refs} />

              {/* Right Section */}
              <RightSection 
                state={state} 
                refs={refs} 
                handleLogOut={handleLogOut} 
              />
            </div>

            {/* Desktop Navigation Links */}
            <DesktopNavLinks highlightState={highlightState} refs={{ navLinksRef: refs.navLinksRef as React.RefObject<HTMLDivElement> }} />
          </div>
        </div>
      </nav>

      {/* Feedback Modal */}
      <FeedbackModal state={state} />
    </>
  );
};