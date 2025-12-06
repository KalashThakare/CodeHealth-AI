"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTeamStore } from "@/store/teamStore";
import { useGitHubStore } from "@/store/githubStore";
import { useUsageStore } from "@/store/usageStore";
import { useNotificationStore, Notification } from "@/store/notificationStore";
import {
  FiPlus,
  FiGithub,
  FiExternalLink,
  FiMoreHorizontal,
  FiLock,
  FiUnlock,
  FiActivity,
  FiUsers,
  FiDatabase,
  FiAlertTriangle,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";
import "../dashboard.css";
import { toast } from "sonner";

function MiniSemiCircle({
  value,
  max,
  color = "#10b981",
  size = 40,
}: {
  value: number;
  max: number;
  color?: string;
  size?: number;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size / 2 + 2 }}>
      <svg
        width={size}
        height={size / 2 + 2}
        viewBox={`0 0 ${size} ${size / 2 + 2}`}
        style={{ overflow: "visible" }}
      >
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${
            size - strokeWidth / 2
          } ${size / 2}`}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${
            size - strokeWidth / 2
          } ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 0.5s ease-in-out",
          }}
        />
      </svg>
    </div>
  );
}

function UsageStats({
  repoCount,
  teamCount,
  isLoading,
}: {
  repoCount: number;
  teamCount: number;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loading-spinner" style={{ width: 24, height: 24 }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiDatabase
              size={14}
              style={{ color: "var(--color-fg-secondary)" }}
            />
            <span className="text-sm" style={{ color: "var(--color-fg)" }}>
              Active Repos
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MiniSemiCircle
              value={repoCount}
              max={2}
              color={repoCount >= 2 ? "#f59e0b" : "#10b981"}
              size={36}
            />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--color-fg)", minWidth: "32px" }}
            >
              {repoCount} / 2
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiUsers size={14} style={{ color: "var(--color-fg-secondary)" }} />
            <span className="text-sm" style={{ color: "var(--color-fg)" }}>
              Teams
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MiniSemiCircle
              value={teamCount}
              max={Math.max(teamCount, 5)}
              color="#3b82f6"
              size={36}
            />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--color-fg)", minWidth: "32px" }}
            >
              {teamCount}
            </span>
          </div>
        </div>
      </div>

      <div
        className="w-full h-px"
        style={{ backgroundColor: "var(--color-border)" }}
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs"
            style={{ color: "var(--color-fg-secondary)" }}
          >
            Repo initialization Limit
          </span>
          <span
            className="text-xs"
            style={{ color: "var(--color-fg-secondary)" }}
          >
            {Math.round((repoCount / 2) * 100)}%
          </span>
        </div>
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--color-bg-secondary)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(repoCount / 2) * 100}%`,
              backgroundColor: repoCount >= 2 ? "#f59e0b" : "#10b981",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function getAlertSeverity(
  title: string
): "error" | "warning" | "info" | "success" {
  const lowerTitle = title.toLowerCase();
  if (
    lowerTitle.includes("error") ||
    lowerTitle.includes("failed") ||
    lowerTitle.includes("failure")
  ) {
    return "error";
  }
  if (
    lowerTitle.includes("warning") ||
    lowerTitle.includes("limit") ||
    lowerTitle.includes("exceeded")
  ) {
    return "warning";
  }
  if (lowerTitle.includes("complete") || lowerTitle.includes("success")) {
    return "success";
  }
  return "info";
}
function getAlertStyles(severity: "error" | "warning" | "info" | "success") {
  switch (severity) {
    case "error":
      return {
        icon: FiAlertCircle,
        bgColor: "rgba(239, 68, 68, 0.1)",
        borderColor: "rgba(239, 68, 68, 0.3)",
        iconColor: "#ef4444",
        textColor: "#fca5a5",
      };
    case "warning":
      return {
        icon: FiAlertTriangle,
        bgColor: "rgba(245, 158, 11, 0.1)",
        borderColor: "rgba(245, 158, 11, 0.3)",
        iconColor: "#f59e0b",
        textColor: "#fcd34d",
      };
    case "success":
      return {
        icon: FiCheckCircle,
        bgColor: "rgba(34, 197, 94, 0.1)",
        borderColor: "rgba(34, 197, 94, 0.3)",
        iconColor: "#22c55e",
        textColor: "#86efac",
      };
    default:
      return {
        icon: FiInfo,
        bgColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgba(59, 130, 246, 0.3)",
        iconColor: "#3b82f6",
        textColor: "#93c5fd",
      };
  }
}

function formatAlertTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

function AlertsSection({
  alerts,
  isLoading,
  onDismiss,
  onDismissAll,
}: {
  alerts: Notification[];
  isLoading: boolean;
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="loading-spinner" style={{ width: 20, height: 20 }} />
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <FiCheckCircle
          size={24}
          style={{ color: "var(--color-fg-tertiary)", marginBottom: 8 }}
        />
        <p className="text-xs" style={{ color: "var(--color-fg-secondary)" }}>
          No active alerts
        </p>
        <p
          className="text-xs mt-1"
          style={{ color: "var(--color-fg-tertiary)" }}
        >
          System is running smoothly
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {alerts.length > 1 && (
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-xs font-medium"
            style={{ color: "var(--color-fg-secondary)" }}
          >
            {alerts.length} active alert{alerts.length > 1 ? "s" : ""}
          </span>
          <button
            onClick={onDismissAll}
            className="text-xs hover:underline transition-all"
            style={{ color: "var(--color-accent)" }}
          >
            Dismiss all
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
        {alerts.slice(0, 5).map((alert) => {
          const severity = getAlertSeverity(alert.title);
          const styles = getAlertStyles(severity);
          const IconComponent = styles.icon;

          return (
            <div
              key={alert.id}
              className="relative rounded-lg p-3 transition-all hover:opacity-90"
              style={{
                backgroundColor: styles.bgColor,
                border: `1px solid ${styles.borderColor}`,
              }}
            >
              <button
                onClick={() => onDismiss(alert.id)}
                className="absolute top-2 right-2 p-1 rounded hover:bg-black/10 transition-colors"
                title="Dismiss"
              >
                <FiX size={12} style={{ color: "var(--color-fg-secondary)" }} />
              </button>

              <div className="flex gap-2.5 pr-5">
                <div className="flex-shrink-0 mt-0.5">
                  <IconComponent
                    size={14}
                    style={{ color: styles.iconColor }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className="text-xs font-medium leading-tight"
                    style={{ color: "var(--color-fg)" }}
                  >
                    {alert.title}
                  </h4>
                  <p
                    className="text-xs mt-1 leading-relaxed"
                    style={{ color: "var(--color-fg-secondary)" }}
                  >
                    {alert.message}
                  </p>
                  <span
                    className="text-[10px] mt-1.5 block"
                    style={{ color: "var(--color-fg-tertiary)" }}
                  >
                    {formatAlertTime(alert.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {alerts.length > 5 && (
        <p
          className="text-xs text-center pt-1"
          style={{ color: "var(--color-fg-tertiary)" }}
        >
          +{alerts.length - 5} more alert{alerts.length - 5 > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const router = useRouter();

  const myInvites = useTeamStore((s) => s.myInvites);
  const fetchMyInvites = useTeamStore((s) => s.fetchMyInvites);
  const myInvitesLoaded = useTeamStore((s) => s.myInvitesLoaded);

  const repositories = useGitHubStore((s) => s.repositories);
  const fetchGitHubRepos = useGitHubStore((s) => s.fetchGitHubRepos);
  const githubLoading = useGitHubStore((s) => s.isLoading);
  const selectRepository = useGitHubStore((s) => s.selectRepository);

  const usageData = useUsageStore((s) => s.usageData);
  const usageLoading = useUsageStore((s) => s.isLoading);
  const fetchUsage = useUsageStore((s) => s.fetchUsage);

  const alerts = useNotificationStore((s) => s.alerts);
  const alertsLoading = useNotificationStore((s) => s.alertsLoading);
  const alertsCount = useNotificationStore((s) => s.alertsCount);
  const dismissAlert = useNotificationStore((s) => s.dismissAlert);
  const dismissAllAlerts = useNotificationStore((s) => s.dismissAllAlerts);
  const fetchAlerts = useNotificationStore((s) => s.fetchAlerts);

  const [searchTerm, setSearchTerm] = useState("");
  const [openOptionsMenu, setOpenOptionsMenu] = useState<number | null>(null);
  const dataFetchRef = useRef(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openOptionsMenu) {
        setOpenOptionsMenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openOptionsMenu]);

  useEffect(() => {
    if (dataFetchRef.current) return;
    dataFetchRef.current = true;

    const fetchData = async () => {
      try {
        const promises = [];
        if (!myInvitesLoaded) {
          promises.push(fetchMyInvites());
        }
        promises.push(fetchGitHubRepos());
        promises.push(fetchUsage());
        promises.push(fetchAlerts());
        await Promise.all(promises);
      } catch (error) {
        console.error("Error fetching projects data:", error);
      }
    };

    fetchData();
  }, [
    fetchMyInvites,
    fetchGitHubRepos,
    myInvitesLoaded,
    fetchUsage,
    fetchAlerts,
  ]);

  const filteredRepositories = repositories.filter(
    (repo) =>
      repo.repoName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProjectClick = (repo: any) => {
    console.log("Selecting and navigating to project:", repo.fullName);
    selectRepository(repo);
    router.push("/gitProject");
  };

  const getProjectIcon = (repoName: string) => {
    const firstLetter = repoName.charAt(0).toUpperCase();
    return firstLetter;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return "1d ago";
    if (diffInDays < 30) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-section-title">Usage</div>
        <div className="sidebar-section">
          <UsageStats
            repoCount={usageData.repoCount}
            teamCount={usageData.teamCount}
            isLoading={usageLoading}
          />
        </div>

        <div className="sidebar-section-title">
          <span>Alerts</span>
          {alertsCount > 0 && (
            <span
              className="ml-2 px-1.5 py-0.5 text-[10px] font-medium rounded-full"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                color: "#ef4444",
              }}
            >
              {alertsCount}
            </span>
          )}
        </div>
        <div className="sidebar-section">
          <AlertsSection
            alerts={alerts}
            isLoading={alertsLoading}
            onDismiss={dismissAlert}
            onDismissAll={dismissAllAlerts}
          />
        </div>

        <div className="sidebar-section-title">Recent Previews</div>
        <div className="sidebar-section">
          <div>
            Preview deployments that you have recently visited or created will
            appear here.
          </div>
        </div>
      </aside>

      <main className="dashboard-main !gap-4">
        <div className="projects-header">
          <h2 className="!text-[15px]">Projects</h2>
        </div>

        {githubLoading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p className="loading-text">Loading projects...</p>
          </div>
        ) : filteredRepositories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiGithub size={32} />
            </div>
            <h3>No Projects Found</h3>
            <p>
              {searchTerm
                ? "No projects match your search. Try a different query."
                : "Connect your GitHub account to import and analyze your repositories."}
            </p>
            {!searchTerm && (
              <button
                className="empty-state-btn"
                onClick={() =>
                  router.push(
                    process.env.NEXT_PUBLIC_WEB_APP_REDIRECT_URI ||
                      "/gitProject"
                  )
                }
              >
                <FiPlus size={16} />
                Import Project
              </button>
            )}
          </div>
        ) : (
          <div className="projects-grid">
            {filteredRepositories.map((repo, index) => (
              <div
                key={repo.id}
                className="project-card"
                onClick={() => handleProjectClick(repo)}
              >
                <div className="project-card-header mb-2">
                  <div className="flex items-center gap-4">
                    <div className="project-icon" data-index={index % 10}>
                      {getProjectIcon(repo.repoName)}
                    </div>

                    <div className="project-info">
                      <div className="project-name">{repo.repoName}</div>
                      <div className="flex items-center gap-2">
                        <a
                          href={repo.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-url"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiExternalLink size={10} />
                        </a>
                        <span className="visibility-badge">
                          {repo.visibility === "private" ? (
                            <>
                              <FiLock size={10} /> Private
                            </>
                          ) : (
                            <>
                              <FiUnlock size={10} /> Public
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className="tooltip-wrapper"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="activity-btn"
                        onClick={() => {
                          if (!repo.initialised) {
                            selectRepository(repo);
                            toast.warning(
                              "Please initialize the repository first to see its analysis",
                              {
                                duration: 4000,
                              }
                            );
                            router.push(`/gitProject`);
                          } else {
                            router.push(`/analytics/${repo.repoId}`);
                          }
                        }}
                      >
                        <FiActivity size={18} />
                      </button>
                      <div className="tooltip-content">
                        Get detailed performance metrics with Code Health
                        Insights.
                      </div>
                    </div>
                    <div
                      className="relative !bg-none"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        background: "transparent",
                        border: "var(--color-accent)",
                      }}
                    >
                      <button
                        className="more-options-btn !bg-none"
                        style={{
                          background: "transparent",
                          border: "var(--color-accent)",
                        }}
                        onClick={() =>
                          setOpenOptionsMenu(
                            openOptionsMenu === repo.id ? null : repo.id
                          )
                        }
                      >
                        <FiMoreHorizontal size={18} />
                      </button>
                      {openOptionsMenu === repo.id && (
                        <div
                          className="absolute right-0 bottom-full w-fit mb-2 z-50 rounded-xl shadow-lg border-0"
                          style={{
                            backgroundColor: "var(--color-card)",
                            borderColor: "var(--color-border)",
                          }}
                        >
                          <button
                            className="w-fit !text-left !border-0 !px-2 !py-1 !text-sm !hover:bg-opacity-80 transition-colors !rounded-xl"
                            style={{
                              color: "var(--color-fg)",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "var(--color-bg-secondary)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }}
                            onClick={() => {
                              setOpenOptionsMenu(null);
                              // selectRepository(repo);
                              router.push(
                                `${process.env.NEXT_PUBLIC_WEB_APP_REDIRECT_URI}`
                              );
                            }}
                          >
                            Manage
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="project-meta">
                  <span>
                    {repo.installationId ? (
                      <div
                        className="flex gap-1 rounded-full w-fit px-1 py-0.5"
                        style={{
                          backgroundColor: "var(--color-bg-secondary)",
                        }}
                      >
                        <FiGithub
                          size={18}
                          className="github-icon rounded-full p-[3px]"
                          style={{
                            backgroundColor: "var(--color-bg)",
                            color: "var(--color-fg)",
                          }}
                        />
                        <span>{repo.fullName}</span>
                      </div>
                    ) : (
                      "Imported Repository"
                    )}
                  </span>
                </div>

                <div className="project-status">
                  <div
                    className={`status-indicator ${
                      repo.initialised ? "" : "not-ready"
                    }`}
                  >
                    <div
                      className={`status-dot ${
                        repo.initialised ? "" : "not-ready"
                      }`}
                    />
                    <span className="status-text">
                      {repo.initialised ? "Ready" : "Not Initialized"}
                    </span>
                  </div>
                  <div className="activity-info">
                    <FiActivity size={12} />
                    {formatDate(repo.updatedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
