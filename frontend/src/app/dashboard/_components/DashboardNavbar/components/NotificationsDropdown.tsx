"use client";

import React, { useEffect, useRef } from "react";
import { useNotificationStore } from "@/store/notificationStore";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";
import {
  Bell,
  GitPullRequest,
  GitCommit,
  AlertCircle,
  CheckCircle2,
  FileCode,
  X,
  Trash2,
  Activity,
} from "lucide-react";

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

const formatTimeAgo = (timestamp: string) => {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = now - time;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
};

const getNotificationIcon = (type: string, success?: boolean) => {
  if (success === false) {
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  }

  switch (type) {
    case "push":
      return <GitCommit className="w-5 h-5 text-blue-500" />;
    case "pull_request":
      return <GitPullRequest className="w-5 h-5 text-purple-500" />;
    case "issue":
      return <AlertCircle className="w-5 h-5 text-orange-500" />;
    case "full_repo":
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case "ast":
      return <FileCode className="w-5 h-5 text-cyan-500" />;
    case "analysis":
      return <Activity className="w-5 h-5 text-emerald-500" />;
    case "background":
      return <Activity className="w-5 h-5 text-teal-500" />;
    case "alert":
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    case "notification":
      return <Bell className="w-5 h-5 text-blue-400" />;
    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
  }
};

const getNotificationTitle = (notification: any) => {
  switch (notification.type) {
    case "push":
      return notification.success
        ? "Push Analysis Complete"
        : "Push Analysis Failed";
    case "pull_request":
      return notification.success
        ? "PR Analysis Complete"
        : "PR Analysis Failed";
    case "issue":
      return notification.success ? "Issue Analyzed" : "Issue Analysis Failed";
    case "full_repo":
      return notification.success
        ? "Repository Analysis Complete"
        : "Repository Analysis Failed";
    case "ast":
      return notification.success
        ? "File Analysis Complete"
        : "File Analysis Failed";
    case "analysis":
      return notification.success ? "Analysis Retrieved" : "Analysis Failed";
    case "background":
      return notification.success
        ? "Background Analysis Complete"
        : "Background Analysis Failed";
    case "notification":
      return notification.title || "Notification";
    case "remove":
      return "Repository Removed";
    case "delete":
      return "Repository Deleted";
    default:
      return notification.title || "Update";
  }
};

const getNotificationTitleFromType = (type: string, success?: boolean) => {
  switch (type) {
    case "push":
      return success ? "Push Analysis Complete" : "Push Analysis Failed";
    case "pull_request":
      return success ? "PR Analysis Complete" : "PR Analysis Failed";
    case "remove":
      return "Repository Removed";
    case "delete":
      return "Repository Deleted";
    case "analysis":
      return success ? "Analysis Complete" : "Analysis Failed";
    default:
      return "Notification";
  }
};

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  isOpen,
  onClose,
  buttonRef,
}) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    addNotification,
  } = useNotificationStore();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { socket } = useSocket({ autoConnect: true });

  useEffect(() => {
    if (!socket) return;

    const handleAnalysisFetched = (data: any) => {
      console.log("Analysis fetched notification:", data);

      const repoName = data.repoName || "Repository";

      if (data.success) {
        const healthScore = data.overallHealthScore?.toFixed(1) || "N/A";

        addNotification({
          type: "analysis" as any,
          title: "Analysis Retrieved",
          message: `${repoName}: Health Score ${healthScore}`,
          repoId: String(data.repoId),
          repoName: data.repoName,
          score: data.overallHealthScore
            ? Math.round(data.overallHealthScore)
            : undefined,
          timestamp: data.timestamp || new Date().toISOString(),
          success: true,
        });

        toast.success("Analysis Retrieved", {
          description: `${repoName}: Health Score ${healthScore}`,
        });
      } else {
        addNotification({
          type: "analysis" as any,
          title: "Analysis Failed",
          message: data.message || `${repoName}: Failed to fetch analysis`,
          repoId: String(data.repoId),
          repoName: data.repoName,
          timestamp: data.timestamp || new Date().toISOString(),
          success: false,
          error: data.error,
        });

        toast.error("Analysis Failed", {
          description: data.error || repoName,
        });
      }
    };

    const handleAnalysisComplete = (data: any) => {
      console.log("Analysis complete notification:", data);

      const repoName = data.repoName || "Repository";

      addNotification({
        type: "background" as any,
        title: data.success ? "Analysis Complete" : "Analysis Failed",
        message:
          data.message ||
          (data.success
            ? `${repoName}: Analysis completed successfully`
            : `${repoName}: Analysis failed`),
        repoId: String(data.repoId),
        repoName: data.repoName,
        score: data.overallHealthScore
          ? Math.round(data.overallHealthScore)
          : undefined,
        timestamp: data.timestamp || new Date().toISOString(),
        success: data.success,
        error: data.error,
      });

      if (data.success) {
        toast.success(data.message || "Analysis Complete", {
          description: repoName,
        });
      } else {
        toast.error(data.message || "Analysis Failed", {
          description: data.error || repoName,
        });
      }
    };

    const handleNotification = (data: any) => {
      console.log("Socket notification received:", data);

      addNotification({
        type: data.type || "notification",
        title:
          data.title || getNotificationTitleFromType(data.type, data.success),
        message: data.message || "",
        repoId: data.repoId ? String(data.repoId) : undefined,
        repoName: data.repoName,
        timestamp: data.time
          ? new Date(data.time).toISOString()
          : new Date().toISOString(),
        success: data.success !== undefined ? data.success : true,
      });

      toast.info(data.message || "New notification", {
        description: data.repoName || "Repository update",
      });
    };

    socket.on("analysis_fetched", handleAnalysisFetched);
    socket.on("analysis_complete", handleAnalysisComplete);
    socket.on("notification", handleNotification);

    return () => {
      socket.off("analysis_fetched", handleAnalysisFetched);
      socket.off("analysis_complete", handleAnalysisComplete);
      socket.off("notification", handleNotification);
    };
  }, [socket, addNotification]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const dropdown = dropdownRef.current;
    if (!dropdown || !isOpen) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const scrollContainer = scrollContainerRef.current;
      if (scrollContainer) {
        scrollContainer.scrollTop += e.deltaY;
      }
    };

    dropdown.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      dropdown.removeEventListener("wheel", handleWheel);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-96 rounded-lg border shadow-lg z-50"
      style={{
        backgroundColor: "var(--color-bg)",
        borderColor: "var(--color-border)",
        maxHeight: "480px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="flex items-center gap-2 justify-between p-4 border-b"
        style={{
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center gap-2">
          <h3
            className="!font-semibold !text-lg"
            style={{ color: "var(--color-fg)" }}
          >
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span
              className="!px-2 !py-0.5 !text-xs !font-semibold !rounded-full"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "white",
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="!text-xs !hover:opacity-80 !transition-opacity"
                  style={{ color: "var(--color-accent)" }}
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={clearAllNotifications}
                className="!p-2 !hover:opacity-80 !transition-opacity"
                title="Clear all"
              >
                <Trash2
                  className="w-5 h-5"
                  style={{ color: "var(--color-fg-secondary)" }}
                />
              </button>
            </>
          )}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="overflow-y-auto flex-1 no-scrollbar"
        style={{ maxHeight: "360px" }}
      >
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Bell
              className="w-12 h-12 mb-3"
              style={{ color: "var(--color-fg-secondary)" }}
            />
            <p
              className="text-sm"
              style={{ color: "var(--color-fg-secondary)" }}
            >
              No notifications yet
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--color-fg-tertiary)" }}
            >
              You'll see updates about your repositories here
            </p>
          </div>
        ) : (
          <div
            className="divide-y"
            style={{ borderColor: "var(--color-border)" }}
          >
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-opacity-50 transition-all cursor-pointer group relative ${
                  !notification.read ? "bg-opacity-30" : ""
                }`}
                style={{
                  backgroundColor: !notification.read
                    ? "var(--color-accent-bg)"
                    : "transparent",
                }}
                onClick={() => handleNotificationClick(notification.id)}
              >
                {!notification.read && (
                  <div
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: "var(--color-accent)" }}
                  />
                )}

                <div className="flex gap-3 pl-3">
                  <div className="!flex-shrink-0 !mt-1">
                    {getNotificationIcon(
                      notification.type,
                      notification.success
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`!text-sm !font-medium ${
                          !notification.read ? "!font-semibold" : ""
                        }`}
                        style={{ color: "var(--color-fg)" }}
                      >
                        {getNotificationTitle(notification)}
                      </h4>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(notification.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 !transition-opacity !p-1 !hover:bg-red-100 dark:!hover:bg-red-900/20 !rounded"
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </button>
                    </div>

                    <p
                      className="!text-sm !mt-1"
                      style={{ color: "var(--color-fg-secondary)" }}
                    >
                      {notification.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                      {notification.repoName && (
                        <span
                          className="px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: "var(--color-bg-tertiary)",
                            color: "var(--color-fg-secondary)",
                          }}
                        >
                          {notification.repoName}
                        </span>
                      )}
                      {notification.prNumber && (
                        <span
                          className="px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: "var(--color-bg-tertiary)",
                            color: "var(--color-fg-secondary)",
                          }}
                        >
                          PR #{notification.prNumber}
                        </span>
                      )}
                      {notification.issueNumber && (
                        <span
                          className="px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: "var(--color-bg-tertiary)",
                            color: "var(--color-fg-secondary)",
                          }}
                        >
                          Issue #{notification.issueNumber}
                        </span>
                      )}
                      {notification.score !== undefined && (
                        <span
                          className="px-2 py-0.5 rounded font-medium"
                          style={{
                            backgroundColor:
                              notification.score >= 80
                                ? "rgba(34, 197, 94, 0.1)"
                                : notification.score >= 60
                                ? "rgba(251, 191, 36, 0.1)"
                                : "rgba(239, 68, 68, 0.1)",
                            color:
                              notification.score >= 80
                                ? "#22c55e"
                                : notification.score >= 60
                                ? "#fbbf24"
                                : "#ef4444",
                          }}
                        >
                          Score: {notification.score}
                        </span>
                      )}
                      <span style={{ color: "var(--color-fg-tertiary)" }}>
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
