"use client";
import React from "react";
import { useAuthStore } from "@/store/authStore";
import { DesktopActions } from "./DesktopActions";
import { ProfileDropdown } from "./ProfileDropdown";
import { MobileMenu } from "./MobileMenu";

interface RightSectionProps {
  state: any;
  refs: any;
  handleLogOut: () => void;
  isScrolled: boolean;
}

export const RightSection: React.FC<RightSectionProps> = ({
  state,
  refs,
  handleLogOut,
  isScrolled,
}) => {
  const { authUser } = useAuthStore();

  return (
    <div className="flex items-center gap-3">
      {/* Desktop Actions - smooth hide with transition */}
      <div
        style={{
          display: isScrolled ? "none" : "block",
        }}
      >
        <DesktopActions state={state} />
      </div>

      {/* Profile Button & Dropdown - smooth hide with transition */}
      <div
        className="hidden sm:block relative rounded-full"
        ref={refs.profileDropdownRef}
        style={{
          display: isScrolled ? "none" : "block",
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            state.setIsProfileDropdownOpen(!state.isProfileDropdownOpen);
          }}
          className="!px-3 !py-1.25 font-normal text-sm !rounded-full border transition-all hover:opacity-80 cursor-pointer"
          style={{
            backgroundColor: "var(--color-bg-tertiary)",
            color: "var(--color-fg)",
            borderColor: "var(--color-border)",
          }}
        >
          <span
            className="font-bold text-base"
            style={{
              color: "var(--color-fg)",
            }}
          >
            {authUser?.name?.charAt(0).toUpperCase() || "T"}
          </span>
        </button>

        <ProfileDropdown
          state={state}
          refs={refs}
          handleLogOut={handleLogOut}
        />
      </div>

      {/* Mobile Menu - always visible */}
      <MobileMenu state={state} refs={refs} handleLogOut={handleLogOut} />
    </div>
  );
};
