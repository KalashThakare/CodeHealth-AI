"use client";

import React, { useRef } from "react";
import { Bell, MessageSquare } from "lucide-react";
import { NavbarState } from "../types";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { FeedbackDropdown } from "./FeedbackDropdown";
import { useNotificationStore } from "@/store/notificationStore";

interface DesktopActionsProps {
  state: NavbarState;
}

export const DesktopActions: React.FC<DesktopActionsProps> = ({ state }) => {
  const { unreadCount } = useNotificationStore();
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const feedbackButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="hidden sm:flex items-center space-x-3">
      {/* Feedback Button */}
      <div className="relative">
        <button
          ref={feedbackButtonRef}
          onClick={() => state.setIsFeedbackOpen((prev) => !prev)}
          className="!p-1.5 !rounded-full border hover:opacity-80 transition-all"
          style={{
            backgroundColor: "transparent",
            color: "var(--color-fg)",
            borderColor: "var(--color-border)",
          }}
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* Feedback Dropdown */}
        <FeedbackDropdown
          isOpen={state.isFeedbackOpen}
          onClose={() => state.setIsFeedbackOpen(false)}
          buttonRef={feedbackButtonRef}
        />
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          ref={notificationButtonRef}
          onClick={() => {
            state.setIsNotificationsOpen((prev) => !prev);
          }}
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
          {/* Notification Badge */}
          {unreadCount > 0 ? (
            <>
              {/* Glowing green dot */}
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>
              {/* Count badge */}
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full border-2"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "white",
                    borderColor: "var(--color-bg)",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </>
          ) : (
            /* Gray dot when no notifications */
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gray-400 rounded-full"></span>
          )}
        </button>

        {/* Notifications Dropdown */}
        <NotificationsDropdown
          isOpen={state.isNotificationsOpen}
          onClose={() => state.setIsNotificationsOpen(false)}
          buttonRef={notificationButtonRef}
        />
      </div>
    </div>
  );
};
