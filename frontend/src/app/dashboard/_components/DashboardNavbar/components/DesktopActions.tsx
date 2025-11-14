"use client";

import React, { useEffect } from "react";
import { Bell, MessageSquare } from "lucide-react";
import { NavbarState } from "../types";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { useNotificationStore } from "@/store/notificationStore";
import { socketService } from "@/lib/socket";
import { toast } from "sonner";

interface DesktopActionsProps {
  state: NavbarState;
}

export const DesktopActions: React.FC<DesktopActionsProps> = ({ state }) => {
  const { unreadCount, addNotification } = useNotificationStore();

  // Listen for Socket.IO events using the singleton service
  useEffect(() => {
    const handleNotification = (data: any) => {
      const notification = {
        type: data.type || "push",
        title: data.type === "push" ? "New Push" : "Notification",
        message: data.message || `New ${data.type} event on ${data.repoName}`,
        repoId: data.repoId,
        repoName: data.repoName,
        timestamp: new Date(data.time || Date.now()).toISOString(),
        success: true,
      };

      addNotification(notification);

      toast.info(data.message || "New notification", {
        description: data.repoName || "Repository update",
      });
    };

    const handleAnalysisProgress = (data: any) => {
      addNotification({
        type: data.type || "notification",
        title: data.message || "Analysis Update",
        message: data.error || data.message || "Analysis update received",
        repoId: data.repoId,
        repoName: data.repoName,
        prNumber: data.prNumber,
        issueNumber: data.issueNumber,
        score: data.score,
        timestamp: data.timestamp || new Date().toISOString(),
        success: data.success,
        error: data.error,
      });

      if (data.success) {
        toast.success(data.message || "Analysis completed", {
          description: data.repoName,
        });
      } else {
        toast.error(data.message || "Analysis failed", {
          description: data.error || data.repoName,
        });
      }
    };

    // Wait for socket to be available and register listeners
    const checkAndRegister = () => {
      const socket = socketService.getSocket();
      if (socket) {
        socket.on("notification", handleNotification);
        socket.on("analysis_progress", handleAnalysisProgress);
      } else {
        setTimeout(checkAndRegister, 100);
      }
    };

    checkAndRegister();

    return () => {
      const socket = socketService.getSocket();
      if (socket) {
        socket.off("notification", handleNotification);
        socket.off("analysis_progress", handleAnalysisProgress);
      }
    };
  }, [addNotification]);

  return (
    <div className="hidden sm:flex items-center space-x-3">
      {/* Feedback Button */}
      <button
        onClick={() => state.setIsFeedbackOpen(true)}
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
      <div className="relative">
        <button
          onClick={() =>
            state.setIsNotificationsOpen(!state.isNotificationsOpen)
          }
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
        />
      </div>
    </div>
  );
};
