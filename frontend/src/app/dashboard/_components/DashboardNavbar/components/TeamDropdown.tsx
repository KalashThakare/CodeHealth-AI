import React from "react";
import { ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import TeamPersonalProfile from "../../TeamPersonalProfile";
import { NavbarState, DropdownRefs } from "../types";

interface TeamDropdownProps {
  state: NavbarState;
  refs: DropdownRefs;
}

export const TeamDropdown: React.FC<TeamDropdownProps> = ({ state, refs }) => {
  const { authUser } = useAuthStore();

  return (
    <div
      onClick={() => state.setIsTeamDropdownOpen(true)}
      className="flex items-center space-x-1 relative cursor-pointer"
    >
      <span
        className="text-xs px-2 py-1 rounded-full font-medium"
        style={{
          backgroundColor: "var(--color-bg-tertiary)",
          color: "var(--color-fg-secondary)",
        }}
      >
        Hobby
      </span>
      <div className="p-1 hover:opacity-70 transition-opacity">
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${
            state.isTeamDropdownOpen ? "rotate-180" : ""
          }`}
          style={{ color: "var(--color-fg-secondary)" }}
        />
      </div>

      <TeamPersonalProfile
        isOpen={state.isTeamDropdownOpen}
        setIsOpen={state.setIsTeamDropdownOpen}
      />
    </div>
  );
};
