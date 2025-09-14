import React from "react";
import { useAuthStore } from "@/store/authStore";
import { Logo } from "./Logo";
import { TeamDropdown } from "./TeamDropdown";
import { NavbarState, DropdownRefs } from "../types";

interface LeftSectionProps {
  state: NavbarState;
  refs: DropdownRefs;
}

export const LeftSection: React.FC<LeftSectionProps> = ({ state, refs }) => {
  const { authUser } = useAuthStore();

  return (
    <div className="flex items-center space-x-3" ref={refs.teamDropdownRef}>
      <Logo />

      <span
        className="hidden min-[440px]:block text-sm font-medium"
        style={{ color: "var(--color-fg)" }}
      >
        {authUser?.name?.split(" ")[0] || "Your"}'s projects
      </span>

      <TeamDropdown state={state} refs={refs} />
    </div>
  );
};
