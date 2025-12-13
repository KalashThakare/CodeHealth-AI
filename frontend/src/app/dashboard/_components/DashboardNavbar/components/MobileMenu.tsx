"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  X,
  MessageSquare,
  Bell,
  Settings,
  TriangleIcon,
  LogOut,
  Plus,
  Sun,
  Laptop,
  MoonStar,
  Users,
} from "lucide-react";
import { NavbarState, DropdownRefs } from "../types";
import { navLinks, isActive, closeAllMenus } from "../utils/navigation";
import { useTheme } from "@/components/ui/themeToggle";

interface MobileMenuProps {
  state: NavbarState;
  refs: DropdownRefs;
  handleLogOut: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  state,
  refs,
  handleLogOut,
}) => {
  const pathname = usePathname();
  const { authUser } = useAuthStore();
  const {
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    isLight,
    isDark,
    isSystem,
  } = useTheme();

  const handleCloseAllMenus = () => {
    closeAllMenus(
      state.setIsMobileMenuOpen,
      state.setIsProfileDropdownOpen,
      state.setIsTeamDropdownOpen
    );
  };

  if (!state.isMobileMenuOpen) return null;

  const smallLinkStyle = {
    color: "var(--color-fg-secondary)",
    fontSize: "0.85rem",
  } as React.CSSProperties;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={handleCloseAllMenus}
    >
      <div
        className="absolute top-4 right-4 w-80 max-w-[90vw] rounded-lg shadow-lg border max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: "var(--color-border)",
          boxShadow: "var(--shadow)",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="relative">
            <X
              onClick={(e) => {
                e.preventDefault();
                handleCloseAllMenus();
              }}
              className="w-4 h-4 absolute top-2 right-2 rounded-lg transition-colors hover:opacity-80"
              style={{ color: "var(--color-fg-secondary)" }}
              aria-label="Close menu"
            />
        </div>

        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {authUser?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <div
                className="font-medium text-sm"
                style={{ color: "var(--color-fg)" }}
              >
                {authUser?.name || "TestAcc0"}
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--color-fg-secondary)" }}
              >
                {authUser?.email || "test@example.com"}
              </div>
            </div>
          </div>
        </div>

        <div
          className="py-2 border-b hidden max-[520px]:block"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h4
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--color-fg-secondary)" }}
          >
            Navigate to
          </h4>

          <div className="flex flex-col gap-1 px-4 pb-2">
            {navLinks.map((link) => {
              const active = isActive(link.href, pathname);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={handleCloseAllMenus}
                  className="flex items-center space-x-3 pl-6 pr-2 py-1"
                  style={{
                    backgroundColor: active
                      ? "var(--color-bg-secondary)"
                      : "transparent",
                    alignItems: "center",
                    textDecoration: "none",
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: "var(--color-fg-secondary)",
                      transform: "translateX(4px)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      ...smallLinkStyle,
                      color: active ? "var(--color-fg)" : smallLinkStyle.color,
                    }}
                  >
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div
          className="border-t py-2"
          style={{ borderColor: "var(--color-border)" }}
        >
          <Link
            href="/dashboard/feedback"
            onClick={handleCloseAllMenus}
            className="flex items-center space-x-3 px-4 py-2 w-full transition-colors text-sm"
            style={{
              color: "var(--color-fg-secondary)",
              backgroundColor: "transparent",
              textDecoration: "none",
            }}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Feedback</span>
          </Link>

          <Link
            href="/dashboard/notifications"
            onClick={handleCloseAllMenus}
            className="flex items-center space-x-3 px-4 py-2 w-full transition-colors text-sm"
            style={{
              color: "var(--color-fg-secondary)",
              backgroundColor: "transparent",
              textDecoration: "none",
            }}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </Link>

          <Link
            href="/dashboard/settings"
            onClick={handleCloseAllMenus}
            className="flex items-center space-x-3 px-4 py-2 w-full transition-colors text-sm"
            style={{
              color: "var(--color-fg-secondary)",
              backgroundColor: "transparent",
              textDecoration: "none",
            }}
          >
            <Settings className="w-4 h-4" />
            <span>Account Settings</span>
          </Link>

          <Link
            href="/dashboard/teams/create"
            onClick={handleCloseAllMenus}
            className="flex items-center justify-between space-x-3 px-4 py-2 w-full transition-colors text-sm"
            style={{
              color: "var(--color-fg-secondary)",
              backgroundColor: "transparent",
              textDecoration: "none",
            }}
          >
            <div className="flex flex-row items-center space-x-3">
              <Users className="w-4 h-4" />
              <span>Create team</span>
            </div>
            <Plus className="w-4 h-4" />
          </Link>

          <div
            className="flex items-center justify-between px-4 py-2 w-full text-sm"
            style={{ color: "var(--color-fg-secondary)" }}
          >
            <div className="flex items-center space-x-3">
              <Sun className="w-4 h-4" />
              <span>Theme</span>
            </div>
            <div
              className="rounded-full flex flex-row gap-0 border items-center"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                borderColor: "var(--color-border)",
              }}
            >
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setSystemTheme();
                  handleCloseAllMenus();
                }}
                className={`w-6 h-6 p-1 rounded-full transition-all ${
                  isSystem ? "border" : ""
                }`}
                style={{
                  borderColor: isSystem
                    ? "var(--color-primary)"
                    : "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="System theme"
              >
                <Laptop className="w-full h-full" />
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setLightTheme();
                  handleCloseAllMenus();
                }}
                className={`w-6 h-6 p-1 rounded-full transition-all ${
                  isLight ? "border" : ""
                }`}
                style={{
                  borderColor: isLight ? "var(--color-primary)" : "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Light theme"
              >
                <Sun className="w-full h-full" />
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setDarkTheme();
                  handleCloseAllMenus();
                }}
                className={`w-6 h-6 p-1 rounded-full transition-all ${
                  isDark ? "border" : ""
                }`}
                style={{
                  borderColor: isDark ? "var(--color-primary)" : "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Dark theme"
              >
                <MoonStar className="w-full h-full" />
              </a>
            </div>
          </div>

          <div
            className="border-t mx-2"
            style={{ borderColor: "var(--color-border)" }}
          />

          <div className="py-1">
            <Link
              href="/"
              onClick={handleCloseAllMenus}
              className="flex items-center justify-between px-4 py-2 w-full transition-colors text-sm"
              style={{
                color: "var(--color-fg-secondary)",
                backgroundColor: "transparent",
                textDecoration: "none",
              }}
            >
              <span>Home Page</span>
              <TriangleIcon className="w-4 h-4" />
            </Link>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleCloseAllMenus();
                handleLogOut();
              }}
              className="flex items-center justify-between px-4 py-2 w-full transition-colors text-sm"
              style={{
                color: "var(--color-fg-secondary)",
                backgroundColor: "transparent",
                textDecoration: "none",
              }}
            >
              <span>Log Out</span>
              <LogOut className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};