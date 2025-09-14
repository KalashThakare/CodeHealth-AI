import React from "react";
import { Bell, MessageSquare } from "lucide-react";
import { NavbarState } from "../types";

interface DesktopActionsProps {
  state: NavbarState;
}

export const DesktopActions: React.FC<DesktopActionsProps> = ({ state }) => {
  return (
    <div className="hidden sm:flex items-center space-x-3">
      {/* Feedback Button */}
      <button
        onClick={() => state.setIsFeedbackOpen(true)}
        className="!py-1.5 !px-3 !font-normal !text-sm rounded-lg border transition-all hover:opacity-80"
        style={{
          backgroundColor: "transparent",
          color: "var(--color-fg)",
          borderColor: "var(--color-border)",
          boxShadow: "none !important",
        }}
      >
        Feedback
      </button>

      {/* Notifications */}
      <button
        className="!p-1.5 !rounded-full border hover:opacity-80 transition-all relative"
        style={{
          backgroundColor: "transparent",
          color: "var(--color-fg)",
          borderColor: "var(--color-border)",
        }}
      >
        <Bell
          className="w-5 h-5"
          style={{
            backgroundColor: "transparent !important",
            color: "var(--color-fg)",
            borderColor: "var(--color-border)",
          }}
        />
        <span className="absolute top-0.75 right-0.75 w-2 h-2 bg-green-500 rounded-full"></span>
      </button>
    </div>
  );
};
