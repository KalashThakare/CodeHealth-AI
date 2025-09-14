import { NavLink } from "../types";
import { Activity, Eye, HelpCircle, Settings } from "lucide-react";

export const navLinks: NavLink[] = [
  { name: "Overview", href: "/dashboard", icon: Activity },
  { name: "Activity", href: "/dashboard/activity", icon: Activity },
  { name: "Observability", href: "/dashboard/observability", icon: Eye },
  { name: "Support", href: "/dashboard/support", icon: HelpCircle },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const isActive = (path: string, pathname: string): boolean => {
  if (path === "/dashboard") {
    return pathname === path;
  }
  return pathname.startsWith(path);
};

export const closeAllMenus = (
  setIsMobileMenuOpen: (open: boolean) => void,
  setIsProfileDropdownOpen: (open: boolean) => void,
  setIsTeamDropdownOpen: (open: boolean) => void
) => {
  setIsMobileMenuOpen(false);
  setIsProfileDropdownOpen(false);
  setIsTeamDropdownOpen(false);
};
