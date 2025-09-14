import { useState } from "react";
import { NavbarState } from "../types";

export const useNavbarState = (): NavbarState => {
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  return {
    isTeamDropdownOpen,
    setIsTeamDropdownOpen,
    isProfileDropdownOpen,
    setIsProfileDropdownOpen,
    isFeedbackOpen,
    setIsFeedbackOpen,
    feedbackText,
    setFeedbackText,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isSubmittingFeedback,
    setIsSubmittingFeedback,
    isProjectDropdownOpen,
    setIsProjectDropdownOpen,
  };
};
