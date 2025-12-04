"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useNavbarState } from "./hooks/useNavbarState";
import { useDropdownClose } from "./hooks/useDropdownClose";
import { useHighlightEffect } from "./hooks/useHighlightEffect";
import { useScrollNavbar } from "./hooks/useScrollNavbar";
import { LeftSection } from "./components/LeftSection";
import { RightSection } from "./components/RightSection";
import { DesktopNavLinks } from "./components/DesktopNavLinks";
import { Logo } from "./components/Logo";
import { DashboardNavbarProps } from "./types";

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  currentTeam,
}) => {
  const router = useRouter();
  const { logout } = useAuthStore();
  const state = useNavbarState();
  const refs = useDropdownClose(state);
  const highlightState = useHighlightEffect(refs);
  const { isScrolled } = useScrollNavbar();
  const handleLogOut = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <>
      <nav
        className="sticky top-0 z-50 border-b glassmorphism-navbar"
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          borderColor: "var(--color-border)",
          paddingTop: isScrolled ? "0.5rem" : "0.75rem",
          paddingBottom: isScrolled ? "0.4rem" : "0.375rem",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="h-fit mx-auto px-1 sm:px-6">
          <div
            className="flex justify-between items-center w-full"
            style={{
              opacity: isScrolled ? 0 : 1,
              maxHeight: isScrolled ? "0px" : "50px",
              marginBottom: isScrolled ? "0" : "0.375rem",
              overflow: isScrolled ? "hidden" : "visible",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <LeftSection state={state} refs={refs} isScrolled={false} />

            <RightSection
              state={state}
              refs={refs}
              handleLogOut={handleLogOut}
              isScrolled={false}
            />
          </div>

          <div
            className="hidden min-[520px]:flex items-center w-full"
            style={{
              transform: isScrolled ? "translateY(0)" : "translateY(0)",
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div
              style={{
                width: "100%",
                opacity: isScrolled ? 1 : 0,
                maxWidth: isScrolled ? "40px" : "0px",
                marginRight: isScrolled ? "0" : "0",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <Logo />
            </div>

            <div
              style={{
                width: "100%",
              }}
            >
              <DesktopNavLinks
                highlightState={highlightState}
                refs={{
                  navLinksRef:
                    refs.navLinksRef as React.RefObject<HTMLDivElement>,
                }}
              />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
