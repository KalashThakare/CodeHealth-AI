"use client";
import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Logo } from "./Logo";
import { TeamDropdown } from "./TeamDropdown";

interface LeftSectionProps {
  state: any;
  refs: any;
  isScrolled: boolean;
}

export const LeftSection: React.FC<LeftSectionProps> = ({
  state,
  refs,
  isScrolled,
}) => {
  const { authUser } = useAuthStore();

  return (
    <div className="flex items-center gap-3 min-h-9">
      <Link href="/dashboard/projects">
        <Logo />
      </Link>

      {!isScrolled && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <span
            className="text-sm font-medium hidden sm:block"
            style={{
              color: "var(--color-fg)",
              whiteSpace: "nowrap",
            }}
          >
            {authUser?.name?.split(" ")?.[0] || "Your"}'s projects
          </span>
          <TeamDropdown state={state} refs={refs} />
        </div>
      )}
    </div>
  );
};
