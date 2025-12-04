import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/components/ui/themeToggle";
import {
  Users,
  Settings,
  Plus,
  Activity,
  LogOut,
  Sun,
  Laptop,
  TriangleIcon,
  MoonStar,
} from "lucide-react";
import { NavbarState, DropdownRefs } from "../types";
import { navLinks, isActive } from "../utils/navigation";

interface ProfileDropdownProps {
  state: NavbarState;
  refs: DropdownRefs;
  handleLogOut: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
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

  if (!state.isProfileDropdownOpen) return null;

  return (
    <div
      className="absolute top-full right-0 mt-2 w-64 rounded-lg shadow-lg border overflow-hidden z-[1000]"
      style={{
        backgroundColor: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow)",
      }}
    >
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

      <div className="hidden max-[519px]:flex flex-col py-1">
        <h4
          className="px-4 py-2 text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--color-fg-secondary)" }}
        >
          Navigate to
        </h4>
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            onClick={() => state.setIsProfileDropdownOpen(false)}
            className="flex items-center space-x-3 px-6 py-1.5 w-full transition-colors text-xs"
            style={{
              color: isActive(link.href, pathname)
                ? "var(--color-fg)"
                : "var(--color-fg-secondary)",
              backgroundColor: isActive(link.href, pathname)
                ? "var(--color-bg-secondary)"
                : "transparent",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--color-bg-secondary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = isActive(
                link.href,
                pathname
              )
                ? "var(--color-bg-secondary)"
                : "transparent")
            }
          >
            <span
              className="w-1 h-1 rounded-full"
              style={{
                backgroundColor: "var(--color-fg-secondary)",
              }}
            />
            <span className="font-normal">{link.name}</span>
          </Link>
        ))}

        <div
          className="border-t mx-2 my-1"
          style={{ borderColor: "var(--color-border)" }}
        />
      </div>

      <div className="py-1">
        <Link
          href="/dashboard"
          onClick={() => state.setIsProfileDropdownOpen(false)}
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
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <Activity className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/dashboard/settings"
          onClick={() => state.setIsProfileDropdownOpen(false)}
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
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <Settings className="w-4 h-4" />
          <span>Account Settings</span>
        </Link>

        <Link
          href="/dashboard/settings"
          onClick={() => state.setIsProfileDropdownOpen(false)}
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
            (e.currentTarget.style.backgroundColor = "transparent")
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

      <div
        className="border-t mx-2"
        style={{ borderColor: "var(--color-border)" }}
      />

      <div className="py-1">
        <div
          className="flex items-center justify-between px-4 py-2 w-full text-sm"
          style={{
            color: "var(--color-fg-secondary)",
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

      <div
        className="border-t mx-2"
        style={{ borderColor: "var(--color-border)" }}
      />

      <div className="py-1">
        <Link
          href="/"
          onClick={() => state.setIsProfileDropdownOpen(false)}
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
            (e.currentTarget.style.backgroundColor = "transparent")
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
            state.setIsProfileDropdownOpen(false);
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
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <div className="flex items-center space-x-3">
            <span>Log Out</span>
          </div>
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
