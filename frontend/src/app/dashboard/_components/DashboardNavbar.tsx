"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useTeamStore } from "@/store/teamStore";
import { Toggle } from "@/components/ui/themeToggle";
import {
  ChevronDown,
  Users,
  Settings,
  MessageSquare,
  Bell,
  Plus,
  Activity,
  Eye,
  LifeBuoy,
  LogOut,
  X,
} from "lucide-react";

interface DashboardNavbarProps {
  currentTeam?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  currentTeam,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, authUser } = useAuthStore();
  const { teams } = useTeamStore();

  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const teamDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogOut = async () => {
    await logout();
    router.replace("/");
  };

  const submitFeedback = () => {
    if (feedbackText.trim()) {
      console.log("Feedback submitted:", feedbackText);
      setFeedbackText("");
      setIsFeedbackOpen(false);
    }
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path);

  return (
    <>
      {/* Main Navbar */}
      <nav
        className="sticky p-4 top-0 z-50 border-b transition-all duration-200"
        style={{
          backgroundColor: "var(--color-bg)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-12">
            {/* Left Section */}
            <div className="flex items-center space-x-8">
              {/* Logo & Project Name */}
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">J</span>
                </div>
                <span
                  className="text-base font-medium"
                  style={{ color: "var(--color-fg)" }}
                >
                  {authUser?.name?.split(" ")[0] || "TestAcc0"}'s projects
                </span>
                <div className="flex items-center space-x-1">
                  <span
                    className="text-xs px-2 py-1 rounded font-medium"
                    style={{
                      backgroundColor: "var(--color-bg-secondary)",
                      color: "var(--color-fg-secondary)",
                    }}
                  >
                    Hobby
                  </span>
                  <ChevronDown
                    className="w-3 h-3"
                    style={{ color: "var(--color-fg-secondary)" }}
                  />
                </div>
              </div>

              {/* Navigation Links */}
              <div className="hidden lg:flex items-center space-x-8">
                <Link
                  href="/dashboard"
                  className={`text-sm transition-colors pb-3 ${
                    isActive("/dashboard") && pathname === "/dashboard"
                      ? "border-b-2 font-medium"
                      : "hover:opacity-70"
                  }`}
                  style={{
                    color:
                      isActive("/dashboard") && pathname === "/dashboard"
                        ? "var(--color-fg)"
                        : "var(--color-fg-secondary)",
                    borderColor:
                      isActive("/dashboard") && pathname === "/dashboard"
                        ? "var(--color-primary)"
                        : "transparent",
                  }}
                >
                  Overview
                </Link>

                <Link
                  href="/dashboard/activity"
                  className={`text-sm transition-colors pb-3 ${
                    isActive("/dashboard/activity")
                      ? "border-b-2 font-medium"
                      : "hover:opacity-70"
                  }`}
                  style={{
                    color: isActive("/dashboard/activity")
                      ? "var(--color-fg)"
                      : "var(--color-fg-secondary)",
                    borderColor: isActive("/dashboard/activity")
                      ? "var(--color-primary)"
                      : "transparent",
                  }}
                >
                  Activity
                </Link>

                <Link
                  href="/dashboard/observability"
                  className={`text-sm transition-colors pb-3 ${
                    isActive("/dashboard/observability")
                      ? "border-b-2 font-medium"
                      : "hover:opacity-70"
                  }`}
                  style={{
                    color: isActive("/dashboard/observability")
                      ? "var(--color-fg)"
                      : "var(--color-fg-secondary)",
                    borderColor: isActive("/dashboard/observability")
                      ? "var(--color-primary)"
                      : "transparent",
                  }}
                >
                  Observability
                </Link>

                <Link
                  href="/dashboard/support"
                  className={`text-sm transition-colors pb-3 ${
                    isActive("/dashboard/support")
                      ? "border-b-2 font-medium"
                      : "hover:opacity-70"
                  }`}
                  style={{
                    color: isActive("/dashboard/support")
                      ? "var(--color-fg)"
                      : "var(--color-fg-secondary)",
                    borderColor: isActive("/dashboard/support")
                      ? "var(--color-primary)"
                      : "transparent",
                  }}
                >
                  Support
                </Link>

                <Link
                  href="/dashboard/settings"
                  className={`text-sm transition-colors pb-3 ${
                    isActive("/dashboard/settings")
                      ? "border-b-2 font-medium"
                      : "hover:opacity-70"
                  }`}
                  style={{
                    color: isActive("/dashboard/settings")
                      ? "var(--color-fg)"
                      : "var(--color-fg-secondary)",
                    borderColor: isActive("/dashboard/settings")
                      ? "var(--color-primary)"
                      : "transparent",
                  }}
                >
                  Settings
                </Link>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Feedback Button */}
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="text-sm px-3 py-1 rounded border transition-colors hover:opacity-80"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--color-fg)",
                  borderColor: "var(--color-border)",
                }}
              >
                Feedback
              </button>

              {/* Notifications */}
              <button className="p-2 rounded hover:opacity-70 transition-opacity relative">
                <Bell
                  className="w-4 h-4"
                  style={{ color: "var(--color-fg-secondary)" }}
                />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Theme Toggle */}
              <div className="flex items-center">
                <Toggle />
              </div>

              {/* Profile */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <span className="text-white font-bold text-sm">
                    {authUser?.name?.charAt(0).toUpperCase() || "T"}
                  </span>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div
                    className="absolute top-full right-0 mt-2 w-64 rounded-lg shadow-lg py-2 z-50 border"
                    style={{
                      backgroundColor: "var(--color-card)",
                      borderColor: "var(--color-border)",
                      boxShadow: "var(--shadow)",
                    }}
                  >
                    <div
                      className="px-4 py-3 border-b"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <div
                        className="font-medium"
                        style={{ color: "var(--color-fg)" }}
                      >
                        {authUser?.name || "TestAcc0"}
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: "var(--color-fg-secondary)" }}
                      >
                        {authUser?.email || "test@example.com"}
                      </div>
                    </div>

                    <div className="py-2">
                      <h4
                        className="px-4 py-2 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--color-fg-secondary)" }}
                      >
                        NavBar Options
                      </h4>

                      <Link
                        href="/dashboard"
                        className="flex items-center space-x-3 px-4 py-2 transition-colors"
                        style={{ color: "var(--color-fg)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "var(--color-bg-secondary)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <Activity className="w-4 h-4" />
                        <span>1. Overview</span>
                      </Link>

                      <Link
                        href="/dashboard/activity"
                        className="flex items-center space-x-3 px-4 py-2 transition-colors"
                        style={{ color: "var(--color-fg)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "var(--color-bg-secondary)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <Activity className="w-4 h-4" />
                        <span>2. Activity</span>
                      </Link>

                      <Link
                        href="/dashboard/observability"
                        className="flex items-center space-x-3 px-4 py-2 transition-colors"
                        style={{ color: "var(--color-fg)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "var(--color-bg-secondary)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <Eye className="w-4 h-4" />
                        <span>3. Observability</span>
                      </Link>

                      <Link
                        href="/dashboard/support"
                        className="flex items-center space-x-3 px-4 py-2 transition-colors"
                        style={{ color: "var(--color-fg)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "var(--color-bg-secondary)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <LifeBuoy className="w-4 h-4" />
                        <span>4. Support</span>
                      </Link>

                      <Link
                        href="/dashboard/settings"
                        className="flex items-center space-x-3 px-4 py-2 transition-colors"
                        style={{ color: "var(--color-fg)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "var(--color-bg-secondary)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>5. Settings</span>
                      </Link>
                    </div>

                    <div
                      className="border-t pt-2"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleLogOut();
                        }}
                        className="flex items-center space-x-3 px-4 py-2 w-full transition-colors text-red-400"
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
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
            onClick={() => setIsFeedbackOpen(false)}
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
                onClick={() => setIsFeedbackOpen(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: "var(--color-fg-secondary)" }}
                onMouseEnter={(e) =>
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
              placeholder="Share your thoughts, report bugs, or suggest improvements..."
              className="w-full h-32 px-4 py-3 rounded-xl resize-none focus:outline-none transition-all duration-200 border"
              style={{
                background: "var(--color-input-bg)",
                borderColor: "var(--color-input-border)",
                color: "var(--color-fg)",
              }}
            />

            <div className="flex items-center justify-end space-x-3 mt-4">
              <button
                onClick={() => setIsFeedbackOpen(false)}
                className="px-4 py-2 rounded-lg transition-colors border"
                style={{
                  color: "var(--color-fg)",
                  borderColor: "var(--color-border)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) =>
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
                disabled={!feedbackText.trim()}
                className="px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--color-btn-bg)",
                  color: "var(--color-btn-fg)",
                  border: "1px solid var(--color-btn-border)",
                }}
                onMouseEnter={(e) =>
                  !feedbackText.trim()
                    ? null
                    : (e.currentTarget.style.backgroundColor =
                        "var(--color-btn-bg-hover)")
                }
                onMouseLeave={(e) =>
                  !feedbackText.trim()
                    ? null
                    : (e.currentTarget.style.backgroundColor =
                        "var(--color-btn-bg)")
                }
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
