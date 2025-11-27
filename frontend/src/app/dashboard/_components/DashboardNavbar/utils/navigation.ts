import { NavLink } from "../types";
import { Activity, Eye, HelpCircle, Settings, FolderGit2 } from "lucide-react";

export const navLinks: NavLink[] = [
  { name: "Projects", href: "/dashboard/projects", icon: FolderGit2 },
  { name: "Activity", href: "/dashboard/activity", icon: Activity },
  { name: "Observability", href: "/dashboard/observability", icon: Eye },
  { name: "Support", href: "/dashboard/support", icon: HelpCircle },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const isActive = (path: string, pathname: string): boolean => {
  if (path === "/dashboard/projects") {
    return pathname === path || pathname === "/dashboard";
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
