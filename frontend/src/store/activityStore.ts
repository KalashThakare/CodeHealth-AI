import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";

export type ActivityType =
  | "repo_added"
  | "repo_removed"
  | "repo_created"
  | "repo_deleted"
  | "repo_synced"
  | "repo_initialized"
  | "analysis_started"
  | "analysis_completed"
  | "analysis_failed"
  | "team_created"
  | "team_joined"
  | "team_left"
  | "member_invited"
  | "member_added"
  | "member_removed"
  | "settings_updated"
  | "profile_updated"
  | "login"
  | "logout"
  | "scan_started"
  | "scan_completed"
  | "security_alert"
  | "policy_updated"
  | "alert_triggered"
  | "alert_resolved"
  | "webhook_configured"
  | "api_key_generated"
  | "subscription_updated"
  | "unknown";

export interface RawActivity {
  id: string;
  userId: string;
  activity: string;
  createdAt: string;
}

export interface ParsedActivity {
  id: string;
  type: ActivityType;
  action: string;
  description: string;
  metadata?: {
    repoName?: string;
    teamName?: string;
    memberName?: string;
    score?: number;
    branch?: string;
    [key: string]: any;
  };
  createdAt: string;
  formattedDate: string;
  month: string;
}

interface ActivityStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

interface ActivityState {
  activities: ParsedActivity[];
  loading: boolean;
  error: string | null;
  fetchActivities: () => Promise<void>;
  clearActivities: () => void;
  getStats: () => ActivityStats;
  getGroupedActivities: (filters?: {
    search?: string;
    type?: string;
    timeRange?: string;
  }) => Record<string, ParsedActivity[]>;
}

const parseActivityString = (
  activityStr: string
): {
  type: ActivityType;
  action: string;
  description: string;
  metadata?: Record<string, any>;
} => {
  try {
    const parsed = JSON.parse(activityStr);
    return {
      type: parsed.type || "unknown",
      action: parsed.action || activityStr,
      description: parsed.description || activityStr,
      metadata: parsed.metadata,
    };
  } catch {
    const lower = activityStr.toLowerCase();

    if (lower.includes("repo") && lower.includes("added"))
      return {
        type: "repo_added",
        action: "added repository",
        description: activityStr,
      };
    if (lower.includes("repo") && lower.includes("removed"))
      return {
        type: "repo_removed",
        action: "removed repository",
        description: activityStr,
      };
    if (lower.includes("repo") && lower.includes("created"))
      return {
        type: "repo_created",
        action: "created repository",
        description: activityStr,
      };
    if (lower.includes("repo") && lower.includes("deleted"))
      return {
        type: "repo_deleted",
        action: "deleted repository",
        description: activityStr,
      };
    if (lower.includes("repo") && lower.includes("sync"))
      return {
        type: "repo_synced",
        action: "synced repository",
        description: activityStr,
      };
    if (lower.includes("repo") && lower.includes("initial"))
      return {
        type: "repo_initialized",
        action: "initialized repository",
        description: activityStr,
      };
    if (lower.includes("analysis") && lower.includes("started"))
      return {
        type: "analysis_started",
        action: "started analysis",
        description: activityStr,
      };
    if (lower.includes("analysis") && lower.includes("complete"))
      return {
        type: "analysis_completed",
        action: "completed analysis",
        description: activityStr,
      };
    if (lower.includes("analysis") && lower.includes("failed"))
      return {
        type: "analysis_failed",
        action: "analysis failed",
        description: activityStr,
      };
    if (lower.includes("team") && lower.includes("created"))
      return {
        type: "team_created",
        action: "created team",
        description: activityStr,
      };
    if (lower.includes("team") && lower.includes("joined"))
      return {
        type: "team_joined",
        action: "joined team",
        description: activityStr,
      };
    if (lower.includes("team") && lower.includes("left"))
      return {
        type: "team_left",
        action: "left team",
        description: activityStr,
      };
    if (lower.includes("invited"))
      return {
        type: "member_invited",
        action: "invited member",
        description: activityStr,
      };
    if (lower.includes("member") && lower.includes("added"))
      return {
        type: "member_added",
        action: "added member",
        description: activityStr,
      };
    if (lower.includes("member") && lower.includes("removed"))
      return {
        type: "member_removed",
        action: "removed member",
        description: activityStr,
      };
    if (lower.includes("scan") && lower.includes("started"))
      return {
        type: "scan_started",
        action: "started scan",
        description: activityStr,
      };
    if (lower.includes("scan") && lower.includes("complete"))
      return {
        type: "scan_completed",
        action: "completed scan",
        description: activityStr,
      };
    if (lower.includes("login"))
      return { type: "login", action: "logged in", description: activityStr };
    if (lower.includes("logout"))
      return { type: "logout", action: "logged out", description: activityStr };
    if (lower.includes("settings"))
      return {
        type: "settings_updated",
        action: "updated settings",
        description: activityStr,
      };
    if (lower.includes("profile"))
      return {
        type: "profile_updated",
        action: "updated profile",
        description: activityStr,
      };
    if (lower.includes("security") || lower.includes("alert"))
      return {
        type: "security_alert",
        action: "security alert",
        description: activityStr,
      };

    return { type: "unknown", action: "activity", description: activityStr };
  }
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getMonth = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

const transformActivity = (activity: RawActivity): ParsedActivity => {
  const parsed = parseActivityString(activity.activity);
  return {
    id: activity.id,
    type: parsed.type,
    action: parsed.action,
    description: parsed.description,
    metadata: parsed.metadata,
    createdAt: activity.createdAt,
    formattedDate: formatDate(activity.createdAt),
    month: getMonth(activity.createdAt),
  };
};

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  loading: false,
  error: null,

  fetchActivities: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get("/activity/get");
      if (response.data?.data?.length > 0) {
        const transformed = response.data.data.map(transformActivity);
        set({ activities: transformed, loading: false });
      } else {
        set({ activities: [], loading: false });
      }
    } catch (error: any) {
      console.error("Failed to fetch activities:", error);
      set({
        activities: [],
        loading: false,
        error: error.message || "Failed to fetch activities",
      });
    }
  },

  clearActivities: () => set({ activities: [], error: null }),

  getStats: () => {
    const { activities } = get();
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      total: activities.length,
      today: activities.filter((a) => new Date(a.createdAt) >= last24h).length,
      thisWeek: activities.filter((a) => new Date(a.createdAt) >= last7d)
        .length,
      thisMonth: activities.filter((a) => new Date(a.createdAt) >= last30d)
        .length,
    };
  },

  getGroupedActivities: (filters) => {
    const { activities } = get();
    let filtered = [...activities];

    if (filters?.timeRange && filters.timeRange !== "all") {
      const now = new Date();
      let cutoff: Date;
      switch (filters.timeRange) {
        case "7d":
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoff = new Date(0);
      }
      filtered = filtered.filter((a) => new Date(a.createdAt) >= cutoff);
    }

    if (filters?.type && filters.type !== "all") {
      const typeMap: Record<string, string[]> = {
        repo: [
          "repo_added",
          "repo_removed",
          "repo_created",
          "repo_deleted",
          "repo_synced",
          "repo_initialized",
        ],
        analysis: [
          "analysis_started",
          "analysis_completed",
          "analysis_failed",
          "scan_started",
          "scan_completed",
        ],
        team: [
          "team_created",
          "team_joined",
          "team_left",
          "member_invited",
          "member_added",
          "member_removed",
        ],
        security: [
          "security_alert",
          "policy_updated",
          "alert_triggered",
          "alert_resolved",
        ],
        account: ["login", "logout", "profile_updated", "settings_updated"],
      };
      const validTypes = typeMap[filters.type] || [];
      if (validTypes.length > 0) {
        filtered = filtered.filter((a) => validTypes.includes(a.type));
      }
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.description.toLowerCase().includes(searchLower) ||
          a.action.toLowerCase().includes(searchLower) ||
          a.metadata?.repoName?.toLowerCase().includes(searchLower) ||
          a.metadata?.teamName?.toLowerCase().includes(searchLower)
      );
    }

    const grouped: Record<string, ParsedActivity[]> = {};
    filtered.forEach((activity) => {
      if (!grouped[activity.month]) {
        grouped[activity.month] = [];
      }
      grouped[activity.month].push(activity);
    });

    return grouped;
  },
}));
