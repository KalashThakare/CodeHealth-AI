export interface DashboardNavbarProps {
  currentTeam?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface NavLink {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
}

export interface NavbarState {
  isTeamDropdownOpen: boolean;
  setIsTeamDropdownOpen: (open: boolean) => void;
  isProfileDropdownOpen: boolean;
  setIsProfileDropdownOpen: (open: boolean) => void;
  isFeedbackOpen: boolean;
  setIsFeedbackOpen: (open: boolean) => void;
  feedbackText: string;
  setFeedbackText: (text: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isSubmittingFeedback: boolean;
  setIsSubmittingFeedback: (submitting: boolean) => void;
  isProjectDropdownOpen: boolean;
  setIsProjectDropdownOpen: (open: boolean) => void;
}

export interface HighlightState {
  highlightStyle: React.CSSProperties;
  setHighlightStyle: (style: React.CSSProperties) => void;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
}

export interface DropdownRefs {
  teamDropdownRef: React.RefObject<HTMLDivElement | null>;
  profileDropdownRef: React.RefObject<HTMLDivElement | null>;
  mobileMenuRef: React.RefObject<HTMLDivElement | null>;
  projectDropdownRef: React.RefObject<HTMLDivElement | null>;
  navLinksRef: React.RefObject<HTMLDivElement | null>;
}
