import React from "react";
import { useAuthStore } from "@/store/authStore";
import { Menu } from "lucide-react";
import { DesktopActions } from "./DesktopActions";
import { ProfileDropdown } from "./ProfileDropdown";
import { MobileMenu } from "./MobileMenu";
import { NavbarState, DropdownRefs } from "../types";

interface RightSectionProps {
  state: NavbarState;
  refs: DropdownRefs;
  handleLogOut: () => void;
}

export const RightSection: React.FC<RightSectionProps> = ({
  state,
  refs,
  handleLogOut,
}) => {
  const { authUser } = useAuthStore();

  return (
    <div className="flex items-center space-x-3">
      <DesktopActions state={state} />

      {/* Profile Button (Desktop) */}
      <div className="hidden sm:block relative" ref={refs.profileDropdownRef}>
        <button
          onClick={() =>
            state.setIsProfileDropdownOpen(!state.isProfileDropdownOpen)
          }
          className="!px-3 !py-1 !font-normal !text-sm !rounded-full border transition-all hover:opacity-80"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-fg)",
            borderColor: "var(--color-border)",
            boxShadow: "none !important",
          }}
        >
          <span
            className="text-white font-bold text-lg"
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

      {/* Mobile Menu Button */}
      <div className="sm:hidden relative" ref={refs.mobileMenuRef}>
        <button
          onClick={() => state.setIsMobileMenuOpen(!state.isMobileMenuOpen)}
          className="!p-2 !rounded-lg border transition-all hover:opacity-80"
          style={{
            backgroundColor: state.isMobileMenuOpen
              ? "var(--color-bg-secondary)"
              : "transparent",
            color: "var(--color-fg)",
            borderColor: "var(--color-border)",
            boxShadow: "none !important",
          }}
        >
          <Menu className="w-4 h-4" />
        </button>

        <MobileMenu state={state} refs={refs} handleLogOut={handleLogOut} />
      </div>
    </div>
  );
};
