"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { DashboardNavbar } from "../_components/DashboardNavbar";
import {
  Calendar,
  ChevronDown,
  GitCommit,
  GitPullRequest,
  Trash2,
  Plus,
  GitBranch,
  Globe,
  User,
} from "lucide-react";
import "../dashboard.css";

interface ActivityItem {
  id: string;
  type: "deploy" | "create" | "delete" | "alias" | "team";
  action: string;
  project?: string;
  target?: string;
  branch?: string;
  commit?: string;
  user: string;
  date: string;
  month: string;
}

// Mock activity data - replace with real API data
const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "alias",
    action: "aliased",
    project: "codehealth-ai",
    target: "codehealth-ai-git-main.vercel.app",
    user: "You",
    date: "Nov 27",
    month: "November 2025",
  },
  {
    id: "2",
    type: "deploy",
    action: "deployed",
    project: "codehealth-ai",
    commit: "a3f2b1c",
    branch: "main",
    target: "production",
    user: "You",
    date: "Nov 27",
    month: "November 2025",
  },
  {
    id: "3",
    type: "create",
    action: "created project",
    project: "codehealth-ai",
    user: "You",
    date: "Nov 27",
    month: "November 2025",
  },
  {
    id: "4",
    type: "delete",
    action: "deleted project",
    project: "old-project",
    user: "You",
    date: "Nov 15",
    month: "November 2025",
  },
  {
    id: "5",
    type: "team",
    action: "created Team",
    project: "my-team",
    user: "You",
    date: "Oct 20",
    month: "October 2025",
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "deploy":
      return <GitCommit className="w-4 h-4" />;
    case "create":
      return <Plus className="w-4 h-4 text-green-500" />;
    case "delete":
      return <Trash2 className="w-4 h-4 text-red-500" />;
    case "alias":
      return <Globe className="w-4 h-4 text-blue-500" />;
    case "team":
      return <User className="w-4 h-4 text-purple-500" />;
    default:
      return <GitBranch className="w-4 h-4" />;
  }
};

export default function ActivityPage() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.authUser);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  useEffect(() => {
    const init = async () => {
      await checkAuth(router as any);
      setIsLoading(false);
    };
    init();
  }, [checkAuth, router]);

  // Group activities by month
  const groupedActivities = mockActivities.reduce((acc, activity) => {
    if (!acc[activity.month]) {
      acc[activity.month] = [];
    }
    acc[activity.month].push(activity);
    return acc;
  }, {} as Record<string, ActivityItem[]>);

  if (isLoading) {
    return (
      <div className="vercel-dashboard">
        <DashboardNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="vercel-dashboard">
      <DashboardNavbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[var(--color-fg)] mb-2">
            Activity
          </h1>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          {/* Time Filter */}
          <div className="relative">
            <button
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all"
              style={{
                background: "var(--color-bg-secondary)",
                borderColor: "var(--color-border)",
                color: "var(--color-fg)",
              }}
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{timeFilter}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showTimeDropdown && (
              <div
                className="absolute top-full mt-2 left-0 w-48 rounded-lg border shadow-lg z-50"
                style={{
                  background: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                }}
              >
                {[
                  "All Time",
                  "Last 7 days",
                  "Last 30 days",
                  "Last 90 days",
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setTimeFilter(option);
                      setShowTimeDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-bg-secondary)] transition-colors"
                    style={{ color: "var(--color-fg)" }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Type Filter */}
          <div className="relative">
            <button
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className="flex items-center gap-2 px-4 py-2 text-sm"
              style={{ color: "var(--color-fg-secondary)" }}
            >
              <ChevronDown className="w-4 h-4" />
              <span>Type</span>
            </button>
            {showTypeDropdown && (
              <div
                className="absolute top-full mt-2 left-0 w-48 rounded-lg border shadow-lg z-50"
                style={{
                  background: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                }}
              >
                {["All Types", "Deployments", "Projects", "Teams"].map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setTypeFilter(option);
                        setShowTypeDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-bg-secondary)] transition-colors"
                      style={{ color: "var(--color-fg)" }}
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Activity List */}
        <div className="space-y-8">
          {Object.entries(groupedActivities).map(([month, activities]) => (
            <div key={month}>
              <h2
                className="text-sm font-semibold mb-4"
                style={{ color: "var(--color-fg)" }}
              >
                {month}
              </h2>
              <div className="space-y-1">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 py-3 px-4 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors group"
                  >
                    <div className="mt-1">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-sm"
                          style={{ color: "var(--color-fg-secondary)" }}
                        >
                          {activity.user}
                        </span>
                        <span
                          className="text-sm"
                          style={{ color: "var(--color-fg-secondary)" }}
                        >
                          {activity.action}
                        </span>
                        {activity.project && (
                          <span className="text-sm font-medium text-[var(--color-link)]">
                            {activity.project}
                          </span>
                        )}
                        {activity.commit && (
                          <>
                            <span className="text-sm text-[var(--color-link)]">
                              {activity.commit}
                            </span>
                            <span
                              className="text-sm"
                              style={{ color: "var(--color-fg-secondary)" }}
                            >
                              in
                            </span>
                            <span className="text-sm text-[var(--color-link)]">
                              {activity.branch}
                            </span>
                          </>
                        )}
                        {activity.target && activity.type === "deploy" && (
                          <>
                            <span
                              className="text-sm"
                              style={{ color: "var(--color-fg-secondary)" }}
                            >
                              to
                            </span>
                            <span
                              className="text-sm"
                              style={{ color: "var(--color-fg)" }}
                            >
                              {activity.target}
                            </span>
                          </>
                        )}
                        {activity.target && activity.type === "alias" && (
                          <>
                            <span
                              className="text-sm"
                              style={{ color: "var(--color-fg-secondary)" }}
                            >
                              to
                            </span>
                            <span className="text-sm text-[var(--color-link)]">
                              {activity.target}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span
                      className="text-sm whitespace-nowrap"
                      style={{ color: "var(--color-fg-secondary)" }}
                    >
                      {activity.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {mockActivities.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-16 rounded-lg border"
            style={{
              background: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)",
            }}
          >
            <Calendar
              className="w-12 h-12 mb-4"
              style={{ color: "var(--color-fg-secondary)" }}
            />
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: "var(--color-fg)" }}
            >
              No activity yet
            </h3>
            <p
              className="text-sm"
              style={{ color: "var(--color-fg-secondary)" }}
            >
              Your recent activity will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
