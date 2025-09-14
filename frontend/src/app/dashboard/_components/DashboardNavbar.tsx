"use client";
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useTeamStore } from "@/store/teamStore";
import { useTheme } from "@/components/ui/themeToggle";
import {
  ChevronDown,
  Users,
  Settings,
  MessageSquare,
  Bell,
  Plus,
  Activity,
  LogOut,
  X,
  Menu,
  Sun,
  Laptop,
  TriangleIcon,
  MoonStar,
} from "lucide-react";
import { submitFeedbackAPI } from "@/services/feedbackService";
import { toast } from "sonner";
import TeamPersonalProfile from "./TeamPersonalProfile";

interface DashboardNavbarProps {
  currentTeam?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

const navLinks = [
  { name: "Overview", href: "/dashboard" },
  { name: "Activity", href: "/dashboard/activity" },
  { name: "Observability", href: "/dashboard/observability" },
  { name: "Support", href: "/dashboard/support" },
  { name: "Settings", href: "/dashboard/settings" },
];

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  currentTeam,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, authUser } = useAuthStore();
  const {
    theme,
    mounted,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    isLight,
    isDark,
    isSystem,
  } = useTheme();
  const { teams } = useTeamStore();

  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false); // Add this
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  // Sliding highlight effect state
  const navLinksRef = useRef<HTMLDivElement>(null);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const teamDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const projectDropdownRef = useRef<HTMLDivElement>(null);

  // Update highlight position based on active or hovered link
  useLayoutEffect(() => {
    if (!navLinksRef.current) return;

    const activeIndex = navLinks.findIndex((link) => isActive(link.href));
    const targetIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

    if (targetIndex === -1) {
      setHighlightStyle({ opacity: 0 });
      return;
    }

    const linkElements =
      navLinksRef.current.querySelectorAll<HTMLAnchorElement>("a");
    const targetElement = linkElements[targetIndex];

    if (targetElement) {
      const containerRect = navLinksRef.current.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();

      setHighlightStyle({
        position: "absolute",
        left: targetRect.left - containerRect.left,
        top: 0,
        width: targetRect.width,
        height: targetRect.height,
        backgroundColor:
          hoveredIndex !== null
            ? "var(--color-primary-hover)"
            : "var(--color-bg-secondary)",
        borderRadius: "0.375rem",
        transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: 1,
        zIndex: 0,
      });
    }
  }, [pathname, hoveredIndex]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        teamDropdownRef.current &&
        !teamDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTeamDropdownOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProjectDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogOut = async () => {
    await logout();
    router.replace("/");
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim()) return;

    setIsSubmittingFeedback(true);

    try {
      await submitFeedbackAPI(feedbackText.trim());

      // Success feedback
      toast.success(
        "Feedback submitted successfully! Thank you for your input."
      );

      // Reset form and close modal
      setFeedbackText("");
      setIsFeedbackOpen(false);
    } catch (error) {
      // Error feedback
      console.error("Failed to submit feedback:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit feedback. Please try again."
      );
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Main Navbar */}
      <nav
        className="sticky h-fit pt-3 px-4 pb-1.5 top-0 z-50 border-b transition-all duration-200"
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="h-fit mx-auto px-1 sm:px-6">
          <div className="flex-col items-center justify-between">
            <div className="flex justify-between items-center space-x-8">
              {/* Left Section */}
              {/* Logo & Project Name */}
              <div
                className="flex items-center space-x-3"
                ref={projectDropdownRef}
              >
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {authUser?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>

                {/* Project Name - Hidden below md breakpoint */}
                <span
                  className="hidden min-[440px]:block text-sm font-medium"
                  style={{ color: "var(--color-fg)" }}
                >
                  {authUser?.name?.split(" ")[0] || "Your"}'s projects
                </span>

                <div
                  onClick={() => setIsTeamDropdownOpen(true)}
                  className="flex items-center space-x-1 relative"
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
                        isTeamDropdownOpen ? "rotate-180" : ""
                      }`}
                      style={{ color: "var(--color-fg-secondary)" }}
                    />
                  </div>

                  {/* Project Dropdown Menu */}
                  <TeamPersonalProfile
                    isOpen={isTeamDropdownOpen}
                    setIsOpen={setIsTeamDropdownOpen}
                  />
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-3">
                {/* Desktop Right Options - Hidden on small screens, visible from sm+ */}
                <div className="hidden sm:flex items-center space-x-3">
                  {/* Feedback Button */}
                  <button
                    onClick={() => setIsFeedbackOpen(true)}
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

                  {/* Profile */}
                  <div className="relative" ref={profileDropdownRef}>
                    <button
                      onClick={() =>
                        setIsProfileDropdownOpen(!isProfileDropdownOpen)
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

                    {isProfileDropdownOpen && (
                      <div
                        className="absolute top-full right-0 mt-2 w-64 rounded-lg shadow-lg border overflow-hidden z-50"
                        style={{
                          backgroundColor: "var(--color-card)",
                          borderColor: "var(--color-border)",
                          boxShadow: "var(--shadow)",
                        }}
                      >
                        {/* User Info Section */}
                        <div
                          className="px-4 py-3"
                          style={{
                            backgroundColor: "var(--color-bg-secondary)",
                            borderBottom: "1px solid var(--color-border)",
                          }}
                        >
                          <div
                            className="font-semibold text-sm"
                            style={{ color: "var(--color-fg)" }}
                          >
                            {authUser?.name || "TestAcc0"}
                          </div>
                          <div
                            className="text-xs mt-1"
                            style={{ color: "var(--color-fg-secondary)" }}
                          >
                            {authUser?.email || "test@example.com"}
                          </div>
                        </div>

                        {/* Navigation Items */}
                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 w-full transition-colors text-sm"
                            style={{
                              color: "var(--color-fg-secondary)",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "var(--color-bg-secondary)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <Activity className="w-4 h-4" />
                            <span>Dashboard</span>
                          </Link>

                          <Link
                            href="/dashboard/settings"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 w-full transition-colors text-sm"
                            style={{
                              color: "var(--color-fg-secondary)",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "var(--color-bg-secondary)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <Settings className="w-4 h-4" />
                            <span>Account Settings</span>
                          </Link>

                          <Link
                            href="/dashboard/settings"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center justify-between space-x-3 px-4 py-2 w-full transition-colors text-sm"
                            style={{
                              color: "var(--color-fg-secondary)",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "var(--color-bg-secondary)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <div className="flex flex-row items-center space-x-3">
                              <Users className="w-4 h-4" />
                              <span>Create team</span>
                            </div>
                            <Plus
                              className="w-4 h-4 rounded-full border-2"
                              style={{
                                color: "var(--color-fg-secondary)",
                                backgroundColor: "transparent",
                              }}
                            />
                          </Link>
                        </div>

                        {/* Divider */}
                        <div
                          className="border-t mx-2"
                          style={{ borderColor: "var(--color-border)" }}
                        />

                        {/* Utility Items */}
                        <div className="py-1">
                          <div
                            className="flex items-center justify-between px-4 py-2 w-full transition-colors text-sm"
                            style={{
                              color: "var(--color-fg-secondary)",
                              backgroundColor: "transparent",
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <Sun className="w-4 h-4" />
                              <span>Theme</span>
                            </div>
                            <div
                              className="rounded-full flex flex-row gap-0 border items-center transition-all"
                              style={{
                                color: "var(--color-fg-secondary)",
                                backgroundColor: "var(--color-bg-secondary",
                                borderColor: "var(--color-border)",
                              }}
                            >
                              <Laptop
                                className={`w-6 h-6 p-1 rounded-full ${
                                  isSystem ? "!border-[1px]" : "border-none"
                                }`}
                                onClick={setSystemTheme}
                              />
                              <Sun
                                className={`w-6 h-6 p-1 rounded-full ${
                                  isLight ? "!border-[1px]" : "border-none"
                                }`}
                                onClick={setLightTheme}
                              />
                              <MoonStar
                                className={`w-6 h-6 p-1 rounded-full ${
                                  isDark ? "!border-[1px]" : "border-none"
                                }`}
                                onClick={setDarkTheme}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Divider */}
                        <div
                          className="border-t mx-2"
                          style={{ borderColor: "var(--color-border)" }}
                        />

                        {/* Bottom Items */}
                        <div className="py-1">
                          <Link
                            href="/"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center justify-between px-4 py-2 w-full transition-colors text-sm"
                            style={{
                              color: "var(--color-fg-secondary)",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "var(--color-bg-secondary)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <div className="flex items-center space-x-3">
                              <span>Home Page</span>
                            </div>
                            <TriangleIcon className="w-4 h-4" />
                          </Link>

                          <Link
                            href="/"
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              handleLogOut();
                            }}
                            className="flex items-center justify-between px-4 py-2 w-full transition-colors text-sm"
                            style={{
                              color: "var(--color-fg-secondary)",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "var(--color-bg-secondary)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <div className="flex items-center space-x-3">
                              <span>Log Out</span>
                            </div>
                            <LogOut className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    )}
                    {/* Mobile Dropdown Menu - Updated for better visibility */}
                    {isMobileMenuOpen && (
                      <div
                        className="absolute top-full right-0 mt-2 w-72 sm:w-64 rounded-lg shadow-lg py-1 z-50 border max-h-[80vh] overflow-y-auto"
                        style={{
                          backgroundColor: "var(--color-card)",
                          borderColor: "var(--color-border)",
                          boxShadow: "var(--shadow)",
                        }}
                      >
                        {/* User Info */}
                        <div
                          className="px-3 py-3 border-b"
                          style={{ borderColor: "var(--color-border)" }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">
                                {authUser?.name?.charAt(0).toUpperCase() || "U"}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                className="font-medium text-sm truncate"
                                style={{ color: "var(--color-fg)" }}
                              >
                                {authUser?.name || "TestAcc0"}
                              </div>
                              <div
                                className="text-xs truncate"
                                style={{ color: "var(--color-fg-secondary)" }}
                              >
                                {authUser?.email || "test@example.com"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Navigation Links for Mobile */}
                        <div className="py-1">
                          <h4
                            className="px-3 py-2 text-xs font-semibold uppercase tracking-wide"
                            style={{ color: "var(--color-fg-secondary)" }}
                          >
                            Navigation
                          </h4>

                          {navLinks.map((link) => (
                            <Link
                              key={link.name}
                              href={link.href}
                              className="flex items-center space-x-3 px-3 py-2 transition-colors text-sm"
                              style={{
                                color: isActive(link.href)
                                  ? "var(--color-fg)"
                                  : "var(--color-fg-secondary)",
                                backgroundColor: isActive(link.href)
                                  ? "var(--color-bg-secondary)"
                                  : "transparent",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "var(--color-bg-secondary)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  isActive(link.href)
                                    ? "var(--color-bg-secondary)"
                                    : "transparent")
                              }
                              onClick={closeMobileMenu}
                            >
                              <Activity className="w-4 h-4" />
                              <span className="font-medium">{link.name}</span>
                            </Link>
                          ))}
                        </div>

                        {/* Mobile Actions */}
                        <div
                          className="border-t py-2"
                          style={{ borderColor: "var(--color-border)" }}
                        >
                          <button
                            onClick={() => {
                              setIsFeedbackOpen(true);
                              closeMobileMenu();
                            }}
                            className="flex items-center space-x-3 px-3 py-2 w-full transition-colors text-sm"
                            style={{
                              color: "var(--color-fg-secondary)",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "var(--color-bg-secondary)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span className="font-medium">Feedback</span>
                          </button>

                          <div
                            className="flex items-center justify-between px-3 py-2 w-full text-sm"
                            style={{
                              color: "var(--color-fg-secondary)",
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <Sun className="w-4 h-4" />
                              <span className="font-medium">Theme</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              closeMobileMenu();
                              handleLogOut();
                            }}
                            className="flex items-center space-x-3 px-3 py-2 w-full transition-colors text-sm"
                            style={{
                              color: "#ef4444",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "var(--color-bg-secondary)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="font-medium">Log Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Menu Button - Visible only below sm breakpoint */}
                <div className="sm:hidden relative" ref={mobileMenuRef}>
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="!p-2 !rounded-lg border transition-all hover:opacity-80"
                    style={{
                      backgroundColor: isMobileMenuOpen
                        ? "var(--color-bg-secondary)"
                        : "transparent",
                      color: "var(--color-fg)",
                      borderColor: "var(--color-border)",
                      boxShadow: "none !important",
                    }}
                  >
                    <Menu className="w-4 h-4" />
                  </button>

                  {/* Mobile Dropdown Menu */}
                  {isMobileMenuOpen && (
                    <div
                      className="absolute top-full right-0 mt-2 w-64 min-[220px]:w-50 min-[260px]:w-60 min-[300px]:w-66 min-[340px]:w-72 min-[380px]:w-80 rounded-lg shadow-lg py-1 z-50 border"
                      style={{
                        backgroundColor: "var(--color-card)",
                        borderColor: "var(--color-border)",
                        boxShadow: "var(--shadow)",
                      }}
                    >
                      {/* User Info */}
                      <div
                        className="px-3 py-2 border-b"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs">
                              {authUser?.name?.charAt(0).toUpperCase() || "U"}
                            </span>
                          </div>
                          <div>
                            <div
                              className="font-medium text-xs"
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

                      {/* Navigation Links */}
                      <div className="min-[520px]:hidden py-1">
                        <h4
                          className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
                          style={{ color: "var(--color-fg-secondary)" }}
                        >
                          Navigation
                        </h4>

                        {navLinks.map((link, index) => (
                          <Link
                            key={link.name}
                            href={link.href}
                            className="flex items-center space-x-2 px-3 py-2 transition-colors text-sm rounded-md mx-1"
                            style={{
                              color: isActive(link.href)
                                ? "var(--color-fg)"
                                : "var(--color-fg-secondary)",
                              backgroundColor: isActive(link.href)
                                ? "var(--color-bg-secondary)"
                                : "transparent",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "var(--color-bg-secondary)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = isActive(
                                link.href
                              )
                                ? "var(--color-bg-secondary)"
                                : "transparent")
                            }
                            onClick={closeMobileMenu}
                          >
                            <Activity className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">
                              {link.name}
                            </span>
                          </Link>
                        ))}
                      </div>

                      {/* Actions */}
                      <div
                        className="border-t py-1 px-2 flex flex-col items-center gap-2"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <button
                          onClick={() => {
                            setIsFeedbackOpen(true);
                            closeMobileMenu();
                          }}
                          className="flex justify-center items-center space-x-2 px-3 py-2 w-3/4 transition-colors text-sm rounded-md mx-1 hover:opacity-80"
                          style={{
                            color: "var(--color-fg)",
                            backgroundColor: "transparent",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "var(--color-bg-secondary)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">Feedback</span>
                        </button>


                        <button
                          onClick={() => {
                            closeMobileMenu();
                            handleLogOut();
                          }}
                          className="flex items-center justify-center space-x-2 px-3 py-2 w-3/4 transition-colors text-sm rounded-md mx-1 hover:opacity-80"
                          style={{
                            color: "#ef4444",
                            backgroundColor: "transparent",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "var(--color-bg-secondary)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div
              className="hidden min-[520px]:flex items-center space-x-0 relative mt-1.5"
              ref={navLinksRef}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Moving highlight background */}
              <div
                className="transition-all !duration-130"
                style={{
                  ...highlightStyle,
                  opacity: hoveredIndex !== null ? 0.5 : 0,
                }}
              />

              {navLinks.map((link, index) => (
                <div
                  key={link.name}
                  className="relative text-center h-fit flex items-center justify-center"
                >
                  <Link
                    key={link.name}
                    href={link.href}
                    className="relative text-sm px-4 py-2 rounded transition-colors duration-150 z-10"
                    style={{
                      color:
                        hoveredIndex === index || isActive(link.href)
                          ? "var(--color-fg)"
                          : "var(--color-fg-secondary)",
                      textDecoration: "none",
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                  >
                    {link.name}
                  </Link>

                  <div
                    className="absolute bottom-0 left-0 w-full transition-all duration-200"
                    style={{
                      height: "1px",
                      backgroundColor: isActive(link.href)
                        ? "var(--color-fg)"
                        : "transparent",
                      transform: "translateY(5px)", // Position it 4px below
                      opacity: isActive(link.href) ? 1 : 0,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 backdrop-blur-sm"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            onClick={() => !isSubmittingFeedback && setIsFeedbackOpen(false)}
          />
          <div
            className="relative rounded-2xl shadow-2xl w-full max-w-md p-6"
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-semibold"
                style={{ color: "var(--color-fg)" }}
              >
                Send Feedback
              </h3>
              <button
                onClick={() =>
                  !isSubmittingFeedback && setIsFeedbackOpen(false)
                }
                disabled={isSubmittingFeedback}
                className="p-2 rounded-lg transition-colors disabled:opacity-50"
                style={{ color: "var(--color-fg-secondary)" }}
                onMouseEnter={(e) =>
                  !isSubmittingFeedback &&
                  (e.currentTarget.style.backgroundColor =
                    "var(--color-bg-secondary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              disabled={isSubmittingFeedback}
              placeholder="Share your thoughts, report bugs, or suggest improvements..."
              className="w-full h-32 px-4 py-3 rounded-xl resize-none focus:outline-none transition-all duration-200 border disabled:opacity-50"
              style={{
                background: "var(--color-input-bg)",
                borderColor: "var(--color-input-border)",
                color: "var(--color-fg)",
              }}
            />

            <div className="flex items-center justify-end space-x-3 mt-4">
              <button
                onClick={() => setIsFeedbackOpen(false)}
                disabled={isSubmittingFeedback}
                className="px-4 py-2 rounded-lg transition-colors border disabled:opacity-50"
                style={{
                  color: "var(--color-fg)",
                  borderColor: "var(--color-border)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) =>
                  !isSubmittingFeedback &&
                  (e.currentTarget.style.backgroundColor =
                    "var(--color-bg-secondary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                disabled={!feedbackText.trim() || isSubmittingFeedback}
                className="px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                style={{
                  backgroundColor: "var(--color-btn-bg)",
                  color: "var(--color-btn-fg)",
                  border: "1px solid var(--color-btn-border)",
                }}
                onMouseEnter={(e) =>
                  !feedbackText.trim() || isSubmittingFeedback
                    ? null
                    : (e.currentTarget.style.backgroundColor =
                        "var(--color-btn-bg-hover)")
                }
                onMouseLeave={(e) =>
                  !feedbackText.trim() || isSubmittingFeedback
                    ? null
                    : (e.currentTarget.style.backgroundColor =
                        "var(--color-btn-bg)")
                }
              >
                {isSubmittingFeedback ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};








// "use client";
// import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
// import Link from "next/link";
// import { useRouter, usePathname } from "next/navigation";
// import { useAuthStore } from "@/store/authStore";
// import { useTheme } from "@/components/ui/themeToggle";
// import {
//   ChevronDown,
//   Users,
//   Settings,
//   MessageSquare,
//   Bell,
//   Plus,
//   Activity,
//   LogOut,
//   X,
//   Menu,
//   Sun,
//   Laptop,
//   TriangleIcon,
//   MoonStar,
//   Eye,
//   HelpCircle,
// } from "lucide-react";
// import { submitFeedbackAPI } from "@/services/feedbackService";
// import { toast } from "sonner";
// import TeamPersonalProfile from "./TeamPersonalProfile";

// interface DashboardNavbarProps {
//   currentTeam?: {
//     id: string;
//     name: string;
//     slug: string;
//   } | null;
// }

// const navLinks = [
//   { name: "Overview", href: "/dashboard", icon: Activity },
//   { name: "Activity", href: "/dashboard/activity", icon: Activity },
//   { name: "Observability", href: "/dashboard/observability", icon: Eye },
//   { name: "Support", href: "/dashboard/support", icon: HelpCircle },
//   { name: "Settings", href: "/dashboard/settings", icon: Settings },
// ];

// export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
//   currentTeam,
// }) => {
//   const router = useRouter();
//   const pathname = usePathname();
//   const { logout, authUser } = useAuthStore();
//   const {
//     setLightTheme,
//     setDarkTheme,
//     setSystemTheme,
//     isLight,
//     isDark,
//     isSystem,
//   } = useTheme();

//   const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
//   const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
//   const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
//   const [feedbackText, setFeedbackText] = useState("");
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

//   // Sliding highlight effect state
//   const navLinksRef = useRef<HTMLDivElement>(null);
//   const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
//   const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

//   const teamDropdownRef = useRef<HTMLDivElement>(null);
//   const profileDropdownRef = useRef<HTMLDivElement>(null);
//   const mobileMenuRef = useRef<HTMLDivElement>(null);

//   // Update highlight position based on active or hovered link
//   useLayoutEffect(() => {
//     if (!navLinksRef.current) return;

//     const activeIndex = navLinks.findIndex((link) => isActive(link.href));
//     const targetIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

//     if (targetIndex === -1) {
//       setHighlightStyle({ opacity: 0 });
//       return;
//     }

//     const linkElements =
//       navLinksRef.current.querySelectorAll<HTMLAnchorElement>("a");
//     const targetElement = linkElements[targetIndex];

//     if (targetElement) {
//       const containerRect = navLinksRef.current.getBoundingClientRect();
//       const targetRect = targetElement.getBoundingClientRect();

//       setHighlightStyle({
//         position: "absolute",
//         left: targetRect.left - containerRect.left,
//         top: 0,
//         width: targetRect.width,
//         height: targetRect.height,
//         backgroundColor:
//           hoveredIndex !== null
//             ? "var(--color-primary-hover)"
//             : "var(--color-bg-secondary)",
//         borderRadius: "0.375rem",
//         transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
//         opacity: 1,
//         zIndex: 0,
//       });
//     }
//   }, [pathname, hoveredIndex]);

//   // Close dropdowns when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         teamDropdownRef.current &&
//         !teamDropdownRef.current.contains(event.target as Node)
//       ) {
//         setIsTeamDropdownOpen(false);
//       }
//       if (
//         profileDropdownRef.current &&
//         !profileDropdownRef.current.contains(event.target as Node)
//       ) {
//         setIsProfileDropdownOpen(false);
//       }
//       if (
//         mobileMenuRef.current &&
//         !mobileMenuRef.current.contains(event.target as Node)
//       ) {
//         setIsMobileMenuOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleLogOut = async () => {
//     await logout();
//     router.replace("/");
//   };

//   const submitFeedback = async () => {
//     if (!feedbackText.trim()) return;

//     setIsSubmittingFeedback(true);

//     try {
//       await submitFeedbackAPI(feedbackText.trim());
//       toast.success(
//         "Feedback submitted successfully! Thank you for your input."
//       );
//       setFeedbackText("");
//       setIsFeedbackOpen(false);
//     } catch (error) {
//       console.error("Failed to submit feedback:", error);
//       toast.error(
//         error instanceof Error
//           ? error.message
//           : "Failed to submit feedback. Please try again."
//       );
//     } finally {
//       setIsSubmittingFeedback(false);
//     }
//   };

//   const isActive = (path: string) => {
//     if (path === "/dashboard") {
//       return pathname === path;
//     }
//     return pathname.startsWith(path);
//   };

//   const closeAllMenus = () => {
//     setIsMobileMenuOpen(false);
//     setIsProfileDropdownOpen(false);
//     setIsTeamDropdownOpen(false);
//   };

//   return (
//     <>
//       {/* Main Navbar */}
//       <nav
//         className="sticky h-fit pt-3 px-4 pb-1.5 top-0 z-50 border-b transition-all duration-200"
//         style={{
//           backgroundColor: "var(--color-bg-secondary)",
//           borderColor: "var(--color-border)",
//         }}
//       >
//         <div className="h-fit mx-auto px-1 sm:px-6">
//           <div className="flex-col items-center justify-between">
//             <div className="flex justify-between items-center space-x-8">
//               {/* Left Section - Logo & Project Name */}
//               <div
//                 className="flex items-center space-x-3"
//                 ref={teamDropdownRef}
//               >
//                 <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
//                   <span className="text-white font-bold text-xs">
//                     {authUser?.name?.charAt(0).toUpperCase() || "U"}
//                   </span>
//                 </div>

//                 <span
//                   className="hidden min-[440px]:block text-sm font-medium"
//                   style={{ color: "var(--color-fg)" }}
//                 >
//                   {authUser?.name?.split(" ")[0] || "Your"}'s projects
//                 </span>

//                 <div
//                   onClick={() => setIsTeamDropdownOpen(true)}
//                   className="flex items-center space-x-1 relative cursor-pointer"
//                 >
//                   <span
//                     className="text-xs px-2 py-1 rounded-full font-medium"
//                     style={{
//                       backgroundColor: "var(--color-bg-tertiary)",
//                       color: "var(--color-fg-secondary)",
//                     }}
//                   >
//                     Hobby
//                   </span>
//                   <div className="p-1 hover:opacity-70 transition-opacity">
//                     <ChevronDown
//                       className={`w-3 h-3 transition-transform duration-200 ${
//                         isTeamDropdownOpen ? "rotate-180" : ""
//                       }`}
//                       style={{ color: "var(--color-fg-secondary)" }}
//                     />
//                   </div>

//                   <TeamPersonalProfile
//                     isOpen={isTeamDropdownOpen}
//                     setIsOpen={setIsTeamDropdownOpen}
//                   />
//                 </div>
//               </div>

//               {/* Right Section */}
//               <div className="flex items-center space-x-3">
//                 {/* Desktop Right Options - Hidden on small screens */}
//                 <div className="hidden sm:flex items-center space-x-3">
//                   {/* Feedback Button */}
//                   <button
//                     onClick={() => setIsFeedbackOpen(true)}
//                     className="py-1.5 px-3 text-sm rounded-lg border transition-all hover:opacity-80"
//                     style={{
//                       backgroundColor: "transparent",
//                       color: "var(--color-fg)",
//                       borderColor: "var(--color-border)",
//                     }}
//                   >
//                     Feedback
//                   </button>

//                   {/* Notifications */}
//                   <button
//                     className="p-1.5 rounded-full border hover:opacity-80 transition-all relative"
//                     style={{
//                       backgroundColor: "transparent",
//                       color: "var(--color-fg)",
//                       borderColor: "var(--color-border)",
//                     }}
//                   >
//                     <Bell className="w-5 h-5" />
//                     <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-green-500 rounded-full"></span>
//                   </button>

//                   {/* Profile */}
//                   <div className="relative" ref={profileDropdownRef}>
//                     <button
//                       onClick={() =>
//                         setIsProfileDropdownOpen(!isProfileDropdownOpen)
//                       }
//                       className="px-3 py-1 text-sm rounded-full border transition-all hover:opacity-80"
//                       style={{
//                         backgroundColor: "var(--color-primary)",
//                         color: "white",
//                         borderColor: "var(--color-border)",
//                       }}
//                     >
//                       {authUser?.name?.charAt(0).toUpperCase() || "U"}
//                     </button>

//                     {/* Desktop Profile Dropdown */}
//                     {isProfileDropdownOpen && (
//                       <div
//                         className="absolute top-full right-0 mt-2 w-64 rounded-lg shadow-lg border overflow-hidden z-50"
//                         style={{
//                           backgroundColor: "var(--color-card)",
//                           borderColor: "var(--color-border)",
//                           boxShadow: "var(--shadow)",
//                         }}
//                       >
//                         {/* User Info Section */}
//                         <div
//                           className="px-4 py-3"
//                           style={{
//                             backgroundColor: "var(--color-bg-secondary)",
//                             borderBottom: "1px solid var(--color-border)",
//                           }}
//                         >
//                           <div
//                             className="font-semibold text-sm"
//                             style={{ color: "var(--color-fg)" }}
//                           >
//                             {authUser?.name || "TestAcc0"}
//                           </div>
//                           <div
//                             className="text-xs mt-1"
//                             style={{ color: "var(--color-fg-secondary)" }}
//                           >
//                             {authUser?.email || "test@example.com"}
//                           </div>
//                         </div>

//                         {/* Navigation Links - Only show when main nav is hidden */}
//                         <div className="md:hidden py-1">
//                           <h4
//                             className="px-4 py-2 text-xs font-semibold uppercase tracking-wide"
//                             style={{ color: "var(--color-fg-secondary)" }}
//                           >
//                             Navigate to
//                           </h4>
//                           {navLinks.map((link) => {
//                             const IconComponent = link.icon;
//                             return (
//                               <Link
//                                 key={link.name}
//                                 href={link.href}
//                                 onClick={() => setIsProfileDropdownOpen(false)}
//                                 className="flex items-center space-x-3 px-6 py-1.5 w-full transition-colors text-xs"
//                                 style={{
//                                   color: isActive(link.href)
//                                     ? "var(--color-fg)"
//                                     : "var(--color-fg-secondary)",
//                                   backgroundColor: isActive(link.href)
//                                     ? "var(--color-bg-secondary)"
//                                     : "transparent",
//                                 }}
//                                 onMouseEnter={(e) =>
//                                   (e.currentTarget.style.backgroundColor =
//                                     "var(--color-bg-secondary)")
//                                 }
//                                 onMouseLeave={(e) =>
//                                   (e.currentTarget.style.backgroundColor =
//                                     isActive(link.href)
//                                       ? "var(--color-bg-secondary)"
//                                       : "transparent")
//                                 }
//                               >
//                                 <span
//                                   className="w-1 h-1 rounded-full"
//                                   style={{
//                                     backgroundColor:
//                                       "var(--color-fg-secondary)",
//                                   }}
//                                 />
//                                 <span className="font-normal">{link.name}</span>
//                               </Link>
//                             );
//                           })}

//                           <div
//                             className="border-t mx-2 my-1"
//                             style={{ borderColor: "var(--color-border)" }}
//                           />
//                         </div>

//                         {/* Main Navigation Items */}
//                         <div className="py-1">
//                           <Link
//                             href="/dashboard"
//                             onClick={() => setIsProfileDropdownOpen(false)}
//                             className="flex items-center space-x-3 px-4 py-2 w-full transition-colors text-sm"
//                             style={{
//                               color: "var(--color-fg-secondary)",
//                               backgroundColor: "transparent",
//                             }}
//                             onMouseEnter={(e) =>
//                               (e.currentTarget.style.backgroundColor =
//                                 "var(--color-bg-secondary)")
//                             }
//                             onMouseLeave={(e) =>
//                               (e.currentTarget.style.backgroundColor =
//                                 "transparent")
//                             }
//                           >
//                             <Activity className="w-4 h-4" />
//                             <span>Dashboard</span>
//                           </Link>

//                           <Link
//                             href="/dashboard/settings"
//                             onClick={() => setIsProfileDropdownOpen(false)}
//                             className="flex items-center space-x-3 px-4 py-2 w-full transition-colors text-sm"
//                             style={{
//                               color: "var(--color-fg-secondary)",
//                               backgroundColor: "transparent",
//                             }}
//                             onMouseEnter={(e) =>
//                               (e.currentTarget.style.backgroundColor =
//                                 "var(--color-bg-secondary)")
//                             }
//                             onMouseLeave={(e) =>
//                               (e.currentTarget.style.backgroundColor =
//                                 "transparent")
//                             }
//                           >
//                             <Settings className="w-4 h-4" />
//                             <span>Account Settings</span>
//                           </Link>

//                           <Link
//                             href="/dashboard/settings"
//                             onClick={() => setIsProfileDropdownOpen(false)}
//                             className="flex items-center justify-between space-x-3 px-4 py-2 w-full transition-colors text-sm"
//                             style={{
//                               color: "var(--color-fg-secondary)",
//                               backgroundColor: "transparent",
//                             }}
//                             onMouseEnter={(e) =>
//                               (e.currentTarget.style.backgroundColor =
//                                 "var(--color-bg-secondary)")
//                             }
//                             onMouseLeave={(e) =>
//                               (e.currentTarget.style.backgroundColor =
//                                 "transparent")
//                             }
//                           >
//                             <div className="flex flex-row items-center space-x-3">
//                               <Users className="w-4 h-4" />
//                               <span>Create team</span>
//                             </div>
//                             <Plus className="w-4 h-4" />
//                           </Link>
//                         </div>

//                         {/* Divider */}
//                         <div
//                           className="border-t mx-2"
//                           style={{ borderColor: "var(--color-border)" }}
//                         />

//                         {/* Theme Selector */}
//                         <div className="py-1">
//                           <div
//                             className="flex items-center justify-between px-4 py-2 w-full text-sm"
//                             style={{
//                               color: "var(--color-fg-secondary)",
//                             }}
//                           >
//                             <div className="flex items-center space-x-3">
//                               <Sun className="w-4 h-4" />
//                               <span>Theme</span>
//                             </div>
//                             <div
//                               className="rounded-full flex flex-row gap-0 border items-center"
//                               style={{
//                                 backgroundColor: "var(--color-bg-secondary)",
//                                 borderColor: "var(--color-border)",
//                               }}
//                             >
//                               <button
//                                 className={`w-6 h-6 p-1 rounded-full transition-all ${
//                                   isSystem ? "border" : ""
//                                 }`}
//                                 onClick={setSystemTheme}
//                                 style={{
//                                   borderColor: isSystem
//                                     ? "var(--color-primary)"
//                                     : "transparent",
//                                 }}
//                               >
//                                 <Laptop className="w-full h-full" />
//                               </button>
//                               <button
//                                 className={`w-6 h-6 p-1 rounded-full transition-all ${
//                                   isLight ? "border" : ""
//                                 }`}
//                                 onClick={setLightTheme}
//                                 style={{
//                                   borderColor: isLight
//                                     ? "var(--color-primary)"
//                                     : "transparent",
//                                 }}
//                               >
//                                 <Sun className="w-full h-full" />
//                               </button>
//                               <button
//                                 className={`w-6 h-6 p-1 rounded-full transition-all ${
//                                   isDark ? "border" : ""
//                                 }`}
//                                 onClick={setDarkTheme}
//                                 style={{
//                                   borderColor: isDark
//                                     ? "var(--color-primary)"
//                                     : "transparent",
//                                 }}
//                               >
//                                 <MoonStar className="w-full h-full" />
//                               </button>
//                             </div>
//                           </div>
//                         </div>

//                         {/* Divider */}
//                         <div
//                           className="border-t mx-2"
//                           style={{ borderColor: "var(--color-border)" }}
//                         />

//                         {/* Bottom Items */}
//                         <div className="py-1">
//                           <Link
//                             href="/"
//                             onClick={() => setIsProfileDropdownOpen(false)}
//                             className="flex items-center justify-between px-4 py-2 w-full transition-colors text-sm"
//                             style={{
//                               color: "var(--color-fg-secondary)",
//                               backgroundColor: "transparent",
//                             }}
//                             onMouseEnter={(e) =>
//                               (e.currentTarget.style.backgroundColor =
//                                 "var(--color-bg-secondary)")
//                             }
//                             onMouseLeave={(e) =>
//                               (e.currentTarget.style.backgroundColor =
//                                 "transparent")
//                             }
//                           >
//                             <span>Home Page</span>
//                             <TriangleIcon className="w-4 h-4" />
//                           </Link>

//                           <button
//                             onClick={() => {
//                               setIsProfileDropdownOpen(false);
//                               handleLogOut();
//                             }}
//                             className="flex items-center justify-between px-4 py-2 w-full transition-colors text-sm"
//                             style={{
//                               color: "var(--color-fg-secondary)",
//                               backgroundColor: "transparent",
//                             }}
//                             onMouseEnter={(e) =>
//                               (e.currentTarget.style.backgroundColor =
//                                 "var(--color-bg-secondary)")
//                             }
//                             onMouseLeave={(e) =>
//                               (e.currentTarget.style.backgroundColor =
//                                 "transparent")
//                             }
//                           >
//                             <span>Log Out</span>
//                             <LogOut className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Mobile Menu Button */}
//                 <div className="sm:hidden relative" ref={mobileMenuRef}>
//                   <button
//                     onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//                     className="p-2 rounded-lg border transition-all hover:opacity-80"
//                     style={{
//                       backgroundColor: isMobileMenuOpen
//                         ? "var(--color-bg-secondary)"
//                         : "transparent",
//                       color: "var(--color-fg)",
//                       borderColor: "var(--color-border)",
//                     }}
//                   >
//                     <Menu className="w-4 h-4" />
//                   </button>

//                   {/* Mobile Dropdown Menu */}
//                   {isMobileMenuOpen && (
//                     <div
//                       className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
//                       onClick={closeAllMenus}
//                     >
//                       <div
//                         className="absolute top-4 right-4 w-80 max-w-[90vw] rounded-lg shadow-lg border max-h-[90vh] overflow-y-auto"
//                         style={{
//                           backgroundColor: "var(--color-card)",
//                           borderColor: "var(--color-border)",
//                           boxShadow: "var(--shadow)",
//                         }}
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         {/* Header with Close Button */}
//                         <div
//                           className="flex items-center justify-between px-4 py-3 border-b"
//                           style={{ borderColor: "var(--color-border)" }}
//                         >
//                           <h3
//                             className="font-semibold text-sm"
//                             style={{ color: "var(--color-fg)" }}
//                           >
//                             Menu
//                           </h3>
//                           <button
//                             onClick={closeAllMenus}
//                             className="p-1 rounded-lg transition-colors hover:opacity-80"
//                             style={{ color: "var(--color-fg-secondary)" }}
//                           >
//                             <X className="w-4 h-4" />
//                           </button>
//                         </div>

//                         {/* User Info */}
//                         <div
//                           className="px-4 py-3 border-b"
//                           style={{ borderColor: "var(--color-border)" }}
//                         >
//                           <div className="flex items-center space-x-3">
//                             <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
//                               <span className="text-white font-bold text-sm">
//                                 {authUser?.name?.charAt(0).toUpperCase() || "U"}
//                               </span>
//                             </div>
//                             <div>
//                               <div
//                                 className="font-medium text-sm"
//                                 style={{ color: "var(--color-fg)" }}
//                               >
//                                 {authUser?.name || "TestAcc0"}
//                               </div>
//                               <div
//                                 className="text-xs"
//                                 style={{ color: "var(--color-fg-secondary)" }}
//                               >
//                                 {authUser?.email || "test@example.com"}
//                               </div>
//                             </div>
//                           </div>
//                         </div>

//                         {/* Navigation Links */}
//                         <div className="py-2">
//                           <h4
//                             className="px-4 py-2 text-xs font-semibold uppercase tracking-wide"
//                             style={{ color: "var(--color-fg-secondary)" }}
//                           >
//                             Navigation
//                           </h4>
//                           {navLinks.map((link) => {
//                             const IconComponent = link.icon;
//                             return (
//                               <Link
//                                 key={link.name}
//                                 href={link.href}
//                                 className="flex items-center space-x-3 px-4 py-2 transition-colors text-sm"
//                                 style={{
//                                   color: isActive(link.href)
//                                     ? "var(--color-fg)"
//                                     : "var(--color-fg-secondary)",
//                                   backgroundColor: isActive(link.href)
//                                     ? "var(--color-bg-secondary)"
//                                     : "transparent",
//                                 }}
//                                 onMouseEnter={(e) =>
//                                   (e.currentTarget.style.backgroundColor =
//                                     "var(--color-bg-secondary)")
//                                 }
//                                 onMouseLeave={(e) =>
//                                   (e.currentTarget.style.backgroundColor =
//                                     isActive(link.href)
//                                       ? "var(--color-bg-secondary)"
//                                       : "transparent")
//                                 }
//                                 onClick={closeAllMenus}
//                               >
//                                 <IconComponent className="w-4 h-4" />
//                                 <span>{link.name}</span>
//                               </Link>
//                             );
//                           })}
//                         </div>

//                         {/* Actions */}
//                         <div
//                           className="border-t py-2"
//                           style={{ borderColor: "var(--color-border)" }}
//                         >
//                           <h4
//                             className="px-4 py-2 text-xs font-semibold uppercase tracking-wide"
//                             style={{ color: "var(--color-fg-secondary)" }}
//                           >
//                             Actions
//                           </h4>

//                           <button
//                             onClick={() => {
//                               setIsFeedbackOpen(true);
//                               closeAllMenus();
//                             }}
//                             className="flex items-center space-x-3 px-4 py-2 w-full transition-colors text-sm"
//                             style={{
//                               color: "var(--color-fg-secondary)",
//                               backgroundColor: "transparent",
//                             }}
//                             onMouseEnter={(e) =>
//                               (e.currentTarget.style.backgroundColor =
//                                 "var(--color-bg-secondary)")
//                             }
//                             onMouseLeave={(e) =>
//                               (e.currentTarget.style.backgroundColor =
//                                 "transparent")
//                             }
//                           >
//                             <MessageSquare className="w-4 h-4" />
//                             <span>Feedback</span>
//                           </button>

//                           <button
//                             className="flex items-center space-x-3 px-4 py-2 w-full transition-colors text-sm"
//                             style={{
//                               color: "var(--color-fg-secondary)",
//                               backgroundColor: "transparent",
//                             }}
//                             onMouseEnter={(e) =>
//                               (e.currentTarget.style.backgroundColor =
//                                 "var(--color-bg-secondary)")
//                             }
//                             onMouseLeave={(e) =>
//                               (e.currentTarget.style.backgroundColor =
//                                 "transparent")
//                             }
//                           >
//                             <Bell className="w-4 h-4" />
//                             <span>Notifications</span>
//                           </button>

//                           <Link
//                             href="/dashboard/settings"
//                             onClick={closeAllMenus}
//                             className="flex items-center space-x-3 px-4 py-2 w-full transition-colors text-sm"
//                             style={{
//                               color: "var(--color-fg-secondary)",
//                               backgroundColor: "transparent",
//                             }}
//                             onMouseEnter={(e) =>
//                               (e.currentTarget.style.backgroundColor =
//                                 "var(--color-bg-secondary)")
//                             }
//                             onMouseLeave={(e) =>
//                               (e.currentTarget.style.backgroundColor =
//                                 "transparent")
//                             }
//                           >
//                             <Settings className="w-4 h-4" />
//                             <span>Settings</span>
//                           </Link>

//                           <Link
//                             href="/"
//                             onClick={closeAllMenus}
//                             className="flex items-center space-x-3 px-4 py-2 w-full transition-colors text-sm"
//                             style={{
//                               color: "var(--color-fg-secondary)",
//                               backgroundColor: "transparent",
//                             }}
//                             onMouseEnter={(e) =>
//                               (e.currentTarget.style.backgroundColor =
//                                 "var(--color-bg-secondary)")
//                             }
//                             onMouseLeave={(e) =>
//                               (e.currentTarget.style.backgroundColor =
//                                 "transparent")
//                             }
//                           >
//                             <TriangleIcon className="w-4 h-4" />
//                             <span>Home Page</span>
//                           </Link>

//                           <button
//                             onClick={() => {
//                               closeAllMenus();
//                               handleLogOut();
//                             }}
//                             className="flex items-center space-x-3 px-4 py-2 w-full transition-colors text-sm"
//                             style={{
//                               color: "#ef4444",
//                               backgroundColor: "transparent",
//                             }}
//                             onMouseEnter={(e) =>
//                               (e.currentTarget.style.backgroundColor =
//                                 "var(--color-bg-secondary)")
//                             }
//                             onMouseLeave={(e) =>
//                               (e.currentTarget.style.backgroundColor =
//                                 "transparent")
//                             }
//                           >
//                             <LogOut className="w-4 h-4" />
//                             <span>Log Out</span>
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Desktop Navigation Links */}
//             <div
//               className="hidden md:flex items-center space-x-0 relative mt-1.5"
//               ref={navLinksRef}
//               onMouseLeave={() => setHoveredIndex(null)}
//             >
//               {/* Moving highlight background */}
//               <div
//                 className="transition-all duration-300"
//                 style={{
//                   ...highlightStyle,
//                   opacity: hoveredIndex !== null ? 0.5 : highlightStyle.opacity,
//                 }}
//               />

//               {navLinks.map((link, index) => (
//                 <div
//                   key={link.name}
//                   className="relative text-center h-fit flex items-center justify-center"
//                 >
//                   <Link
//                     href={link.href}
//                     className="relative text-sm px-4 py-2 rounded transition-colors duration-150 z-10"
//                     style={{
//                       color:
//                         hoveredIndex === index || isActive(link.href)
//                           ? "var(--color-fg)"
//                           : "var(--color-fg-secondary)",
//                       textDecoration: "none",
//                     }}
//                     onMouseEnter={() => setHoveredIndex(index)}
//                   >
//                     {link.name}
//                   </Link>

//                   <div
//                     className="absolute bottom-0 left-0 w-full transition-all duration-200"
//                     style={{
//                       height: "1px",
//                       backgroundColor: isActive(link.href)
//                         ? "var(--color-fg)"
//                         : "transparent",
//                       transform: "translateY(5px)",
//                       opacity: isActive(link.href) ? 1 : 0,
//                     }}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Feedback Modal */}
//       {isFeedbackOpen && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//           <div
//             className="fixed inset-0 backdrop-blur-sm"
//             style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
//             onClick={() => !isSubmittingFeedback && setIsFeedbackOpen(false)}
//           />
//           <div
//             className="relative rounded-2xl shadow-2xl w-full max-w-md p-6"
//             style={{
//               background: "var(--color-card)",
//               border: "1px solid var(--color-border)",
//               boxShadow: "var(--shadow)",
//             }}
//           >
//             <div className="flex items-center justify-between mb-4">
//               <h3
//                 className="text-lg font-semibold"
//                 style={{ color: "var(--color-fg)" }}
//               >
//                 Send Feedback
//               </h3>
//               <button
//                 onClick={() =>
//                   !isSubmittingFeedback && setIsFeedbackOpen(false)
//                 }
//                 disabled={isSubmittingFeedback}
//                 className="p-2 rounded-lg transition-colors disabled:opacity-50"
//                 style={{ color: "var(--color-fg-secondary)" }}
//                 onMouseEnter={(e) =>
//                   !isSubmittingFeedback &&
//                   (e.currentTarget.style.backgroundColor =
//                     "var(--color-bg-secondary)")
//                 }
//                 onMouseLeave={(e) =>
//                   (e.currentTarget.style.backgroundColor = "transparent")
//                 }
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>

//             <textarea
//               value={feedbackText}
//               onChange={(e) => setFeedbackText(e.target.value)}
//               disabled={isSubmittingFeedback}
//               placeholder="Share your thoughts, report bugs, or suggest improvements..."
//               className="w-full h-32 px-4 py-3 rounded-xl resize-none focus:outline-none transition-all duration-200 border disabled:opacity-50"
//               style={{
//                 background: "var(--color-input-bg)",
//                 borderColor: "var(--color-input-border)",
//                 color: "var(--color-fg)",
//               }}
//             />

//             <div className="flex items-center justify-end space-x-3 mt-4">
//               <button
//                 onClick={() => setIsFeedbackOpen(false)}
//                 disabled={isSubmittingFeedback}
//                 className="px-4 py-2 rounded-lg transition-colors border disabled:opacity-50"
//                 style={{
//                   color: "var(--color-fg)",
//                   borderColor: "var(--color-border)",
//                   backgroundColor: "transparent",
//                 }}
//                 onMouseEnter={(e) =>
//                   !isSubmittingFeedback &&
//                   (e.currentTarget.style.backgroundColor =
//                     "var(--color-bg-secondary)")
//                 }
//                 onMouseLeave={(e) =>
//                   (e.currentTarget.style.backgroundColor = "transparent")
//                 }
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={submitFeedback}
//                 disabled={!feedbackText.trim() || isSubmittingFeedback}
//                 className="px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
//                 style={{
//                   backgroundColor: "var(--color-btn-bg)",
//                   color: "var(--color-btn-fg)",
//                   border: "1px solid var(--color-btn-border)",
//                 }}
//                 onMouseEnter={(e) =>
//                   !feedbackText.trim() || isSubmittingFeedback
//                     ? null
//                     : (e.currentTarget.style.backgroundColor =
//                         "var(--color-btn-bg-hover)")
//                 }
//                 onMouseLeave={(e) =>
//                   !feedbackText.trim() || isSubmittingFeedback
//                     ? null
//                     : (e.currentTarget.style.backgroundColor =
//                         "var(--color-btn-bg)")
//                 }
//               >
//                 {isSubmittingFeedback ? (
//                   <>
//                     <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
//                     <span>Sending...</span>
//                   </>
//                 ) : (
//                   <span>Send</span>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };