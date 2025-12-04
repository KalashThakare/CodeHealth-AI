import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
export interface HealthPulseMetric {
  score: number;
  trend: "up" | "down" | "stable";
  change: number;
  label: string;
}

export interface HealthPulse {
  overall: HealthPulseMetric;
  security: HealthPulseMetric;
  performance: HealthPulseMetric;
  maintainability: HealthPulseMetric;
  testCoverage: HealthPulseMetric;
  documentation: HealthPulseMetric;
  lastUpdated: string;
}

export interface TimelineDataPoint {
  date: string;
  overallScore: number;
  security: number;
  performance: number;
  maintainability: number;
  testCoverage: number;
  commits?: number;
  significantEvents?: TimelineEvent[];
}

export interface TimelineEvent {
  type: "commit" | "pr_merge" | "release" | "incident" | "analysis";
  title: string;
  description: string;
  impact: number; 
  author?: string;
  sha?: string;
  timestamp: string;
}

export interface CommitImpact {
  sha: string;
  message: string;
  author: string;
  authorAvatar?: string;
  timestamp: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  healthDelta: number;
  breakdown: {
    security: number;
    performance: number;
    maintainability: number;
    testCoverage: number;
  };
  issues: {
    introduced: number;
    resolved: number;
  };
  riskLevel: "low" | "medium" | "high" | "critical";
}

export interface HeatmapNode {
  name: string;
  path: string;
  type: "file" | "directory";
  healthScore: number;
  issues: number;
  loc?: number;
  children?: HeatmapNode[];
}

export interface ContributorHealth {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  healthPoints: number;
  commitsThisWeek: number;
  issuesIntroduced: number;
  issuesResolved: number;
  streak: number;
  rank: number;
  badges: string[];
}

export interface Prediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  timeframe: string;
  confidence: number;
  trend: "improving" | "declining" | "stable";
  riskLevel: "low" | "medium" | "high";
  factors: string[];
  recommendations: string[];
}

export interface SmartRecommendation {
  id: string;
  type: "critical" | "quick-win" | "improvement" | "documentation";
  title: string;
  description: string;
  impact: {
    metric: string;
    currentValue: number;
    expectedValue: number;
  };
  effort: "low" | "medium" | "high";
  timeEstimate: string;
  affectedFiles: string[];
  priority: number;
}

export interface HealthAlert {
  id: string;
  type: "threshold" | "anomaly" | "regression" | "security";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  metric?: string;
  value?: number;
  threshold?: number;
  timestamp: string;
  acknowledged: boolean;
  resolvedAt?: string;
}

export interface ObservabilityData {
  repoId: string;
  repoName: string;
  healthPulse: HealthPulse;
  timeline: TimelineDataPoint[];
  recentCommits: CommitImpact[];
  heatmap: HeatmapNode;
  contributors: ContributorHealth[];
  predictions: Prediction[];
  recommendations: SmartRecommendation[];
  alerts: HealthAlert[];
}


interface ObservabilityState {
  data: ObservabilityData | null;
  selectedRepoId: string | null;
  timeRange: "1w" | "1m" | "3m" | "6m" | "1y" | "all";

  loading: boolean;
  loadingTimeline: boolean;
  loadingPredictions: boolean;
  loadingRecommendations: boolean;

  error: string | null;

  fetchObservabilityData: (repoId: string) => Promise<void>;
  fetchHealthPulse: (repoId: string) => Promise<void>;
  fetchTimeline: (repoId: string, range?: string) => Promise<void>;
  fetchCommitImpacts: (repoId: string, limit?: number) => Promise<void>;
  fetchHeatmap: (repoId: string) => Promise<void>;
  fetchContributors: (repoId: string) => Promise<void>;
  fetchPredictions: (repoId: string) => Promise<void>;
  fetchRecommendations: (repoId: string) => Promise<void>;
  fetchAlerts: (repoId: string) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  setTimeRange: (range: "1w" | "1m" | "3m" | "6m" | "1y" | "all") => void;
  setSelectedRepo: (repoId: string) => void;
  clearData: () => void;
  clearError: () => void;
}

function getAuthHeaders() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function generateMockData(repoId: string): ObservabilityData {
  const now = new Date();
  const timelineData: TimelineDataPoint[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const baseScore = 75 + Math.random() * 15;
    timelineData.push({
      date: date.toISOString().split("T")[0],
      overallScore: Math.round(baseScore),
      security: Math.round(baseScore + (Math.random() - 0.5) * 10),
      performance: Math.round(baseScore + (Math.random() - 0.5) * 10),
      maintainability: Math.round(baseScore + (Math.random() - 0.5) * 10),
      testCoverage: Math.round(baseScore + (Math.random() - 0.5) * 10),
      commits: Math.floor(Math.random() * 10),
    });
  }

  return {
    repoId,
    repoName: "Repository",
    healthPulse: {
      overall: { score: 82, trend: "up", change: 3, label: "Overall" },
      security: { score: 74, trend: "down", change: -5, label: "Security" },
      performance: { score: 89, trend: "up", change: 2, label: "Performance" },
      maintainability: {
        score: 71,
        trend: "down",
        change: -8,
        label: "Maintainability",
      },
      testCoverage: {
        score: 78,
        trend: "stable",
        change: 0,
        label: "Test Coverage",
      },
      documentation: {
        score: 65,
        trend: "up",
        change: 5,
        label: "Documentation",
      },
      lastUpdated: new Date().toISOString(),
    },
    timeline: timelineData,
    recentCommits: [
      {
        sha: "abc123",
        message: "feat: add user authentication",
        author: "john",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        filesChanged: 12,
        additions: 847,
        deletions: 23,
        healthDelta: -12,
        breakdown: {
          security: -8,
          performance: -2,
          maintainability: -2,
          testCoverage: 0,
        },
        issues: { introduced: 3, resolved: 0 },
        riskLevel: "high",
      },
      {
        sha: "def456",
        message: "refactor: optimize database queries",
        author: "jane",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        filesChanged: 5,
        additions: 234,
        deletions: 156,
        healthDelta: 8,
        breakdown: {
          security: 0,
          performance: 6,
          maintainability: 2,
          testCoverage: 0,
        },
        issues: { introduced: 0, resolved: 2 },
        riskLevel: "low",
      },
      {
        sha: "ghi789",
        message: "fix: handle edge case in parser",
        author: "alex",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        filesChanged: 2,
        additions: 45,
        deletions: 12,
        healthDelta: 2,
        breakdown: {
          security: 1,
          performance: 0,
          maintainability: 0,
          testCoverage: 1,
        },
        issues: { introduced: 0, resolved: 1 },
        riskLevel: "low",
      },
    ],
    heatmap: {
      name: "src",
      path: "src",
      type: "directory",
      healthScore: 78,
      issues: 24,
      children: [
        {
          name: "components",
          path: "src/components",
          type: "directory",
          healthScore: 92,
          issues: 3,
          children: [],
        },
        {
          name: "services",
          path: "src/services",
          type: "directory",
          healthScore: 74,
          issues: 8,
          children: [],
        },
        {
          name: "utils",
          path: "src/utils",
          type: "directory",
          healthScore: 68,
          issues: 5,
          children: [],
        },
        {
          name: "api",
          path: "src/api",
          type: "directory",
          healthScore: 51,
          issues: 12,
          children: [],
        },
        {
          name: "legacy",
          path: "src/legacy",
          type: "directory",
          healthScore: 23,
          issues: 18,
          children: [],
        },
      ],
    },
    contributors: [
      {
        userId: "1",
        name: "Jane Smith",
        email: "jane@example.com",
        healthPoints: 42,
        commitsThisWeek: 15,
        issuesIntroduced: 2,
        issuesResolved: 8,
        streak: 12,
        rank: 1,
        badges: ["Security Champion", "Top Contributor"],
      },
      {
        userId: "2",
        name: "Alex Johnson",
        email: "alex@example.com",
        healthPoints: 18,
        commitsThisWeek: 8,
        issuesIntroduced: 1,
        issuesResolved: 4,
        streak: 5,
        rank: 2,
        badges: ["Bug Squasher"],
      },
      {
        userId: "3",
        name: "Mike Brown",
        email: "mike@example.com",
        healthPoints: 12,
        commitsThisWeek: 6,
        issuesIntroduced: 2,
        issuesResolved: 3,
        streak: 3,
        rank: 3,
        badges: [],
      },
      {
        userId: "4",
        name: "John Doe",
        email: "john@example.com",
        healthPoints: -12,
        commitsThisWeek: 4,
        issuesIntroduced: 5,
        issuesResolved: 1,
        streak: 0,
        rank: 4,
        badges: [],
      },
    ],
    predictions: [
      {
        metric: "Security",
        currentValue: 74,
        predictedValue: 68,
        timeframe: "30 days",
        confidence: 78,
        trend: "declining",
        riskLevel: "high",
        factors: [
          "2 unpatched vulnerabilities trending",
          "Increasing dependency on outdated packages",
        ],
        recommendations: [
          "Update vulnerable dependencies",
          "Enable automated security scanning",
        ],
      },
      {
        metric: "Technical Debt",
        currentValue: 29,
        predictedValue: 36,
        timeframe: "30 days",
        confidence: 82,
        trend: "declining",
        riskLevel: "medium",
        factors: [
          "Current velocity adding 3 complexity points/week",
          "Legacy code ratio increasing",
        ],
        recommendations: [
          "Allocate 20% sprint capacity for refactoring",
          "Focus on src/api directory",
        ],
      },
      {
        metric: "Test Coverage",
        currentValue: 78,
        predictedValue: 78,
        timeframe: "30 days",
        confidence: 90,
        trend: "stable",
        riskLevel: "low",
        factors: ["Consistent test writing patterns", "CI enforcement working"],
        recommendations: ["Consider increasing coverage threshold to 80%"],
      },
    ],
    recommendations: [
      {
        id: "1",
        type: "critical",
        title: "Refactor src/api/auth.js",
        description:
          "This file has grown 340% in 3 months. Complexity score: 89. Suggested: Split into AuthService, TokenManager, SessionStore",
        impact: {
          metric: "Maintainability",
          currentValue: 71,
          expectedValue: 85,
        },
        effort: "high",
        timeEstimate: "8-12 hours",
        affectedFiles: ["src/api/auth.js"],
        priority: 1,
      },
      {
        id: "2",
        type: "quick-win",
        title: "Add error boundaries to 12 components",
        description:
          "Estimated impact: +5 reliability points. Prevents cascading failures in UI.",
        impact: { metric: "Reliability", currentValue: 80, expectedValue: 85 },
        effort: "low",
        timeEstimate: "2 hours",
        affectedFiles: [
          "src/components/Dashboard.tsx",
          "src/components/Analytics.tsx",
        ],
        priority: 2,
      },
      {
        id: "3",
        type: "documentation",
        title: "23 public functions lack JSDoc",
        description: "Would improve documentation score from 45 → 72",
        impact: {
          metric: "Documentation",
          currentValue: 65,
          expectedValue: 72,
        },
        effort: "medium",
        timeEstimate: "4 hours",
        affectedFiles: ["src/utils/helpers.ts", "src/services/api.ts"],
        priority: 3,
      },
    ],
    alerts: [
      {
        id: "1",
        type: "threshold",
        severity: "critical",
        title: "Security score below threshold",
        message: "Security score dropped below 75 (current: 74)",
        metric: "security",
        value: 74,
        threshold: 75,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        acknowledged: false,
      },
      {
        id: "2",
        type: "anomaly",
        severity: "warning",
        title: "Unusual commit pattern detected",
        message: "Detected 5x normal commit rate in /api directory",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        acknowledged: false,
      },
      {
        id: "3",
        type: "regression",
        severity: "info",
        title: "Weekly health report ready",
        message: "Your weekly code health report is available for review",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        acknowledged: true,
      },
    ],
  };
}

export const useObservabilityStore = create<ObservabilityState>()(
  (set, get) => ({
    data: null,
    selectedRepoId: null,
    timeRange: "1m",
    loading: false,
    loadingTimeline: false,
    loadingPredictions: false,
    loadingRecommendations: false,
    error: null,

    fetchObservabilityData: async (repoId: string) => {
      set({ loading: true, error: null, selectedRepoId: repoId });

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); 
        const mockData = generateMockData(repoId);
        set({ data: mockData, loading: false });

        toast.success("Observability data loaded");
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          "Failed to fetch observability data";
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
      }
    },

    fetchHealthPulse: async (repoId: string) => {
      try {
        const response = await axiosInstance.get(
          `/observability/${repoId}/health-pulse`,
          {
            headers: getAuthHeaders(),
          }
        );

        set((state) => ({
          data: state.data
            ? { ...state.data, healthPulse: response.data }
            : null,
        }));
      } catch (error: any) {
        console.error("Failed to fetch health pulse:", error);
      }
    },

    fetchTimeline: async (repoId: string, range?: string) => {
      set({ loadingTimeline: true });
      try {
        const timeRange = range || get().timeRange;
        const response = await axiosInstance.get(
          `/observability/${repoId}/timeline?range=${timeRange}`,
          { headers: getAuthHeaders() }
        );

        set((state) => ({
          data: state.data ? { ...state.data, timeline: response.data } : null,
          loadingTimeline: false,
        }));
      } catch (error: any) {
        set({ loadingTimeline: false });
        console.error("Failed to fetch timeline:", error);
      }
    },

    fetchCommitImpacts: async (repoId: string, limit = 10) => {
      try {
        const response = await axiosInstance.get(
          `/observability/${repoId}/commit-impacts?limit=${limit}`,
          { headers: getAuthHeaders() }
        );

        set((state) => ({
          data: state.data
            ? { ...state.data, recentCommits: response.data }
            : null,
        }));
      } catch (error: any) {
        console.error("Failed to fetch commit impacts:", error);
      }
    },

    fetchHeatmap: async (repoId: string) => {
      try {
        const response = await axiosInstance.get(
          `/observability/${repoId}/heatmap`,
          {
            headers: getAuthHeaders(),
          }
        );

        set((state) => ({
          data: state.data ? { ...state.data, heatmap: response.data } : null,
        }));
      } catch (error: any) {
        console.error("Failed to fetch heatmap:", error);
      }
    },

    fetchContributors: async (repoId: string) => {
      try {
        const response = await axiosInstance.get(
          `/observability/${repoId}/contributors`,
          {
            headers: getAuthHeaders(),
          }
        );

        set((state) => ({
          data: state.data
            ? { ...state.data, contributors: response.data }
            : null,
        }));
      } catch (error: any) {
        console.error("Failed to fetch contributors:", error);
      }
    },

    fetchPredictions: async (repoId: string) => {
      set({ loadingPredictions: true });
      try {
        const response = await axiosInstance.get(
          `/observability/${repoId}/predictions`,
          {
            headers: getAuthHeaders(),
          }
        );

        set((state) => ({
          data: state.data
            ? { ...state.data, predictions: response.data }
            : null,
          loadingPredictions: false,
        }));
      } catch (error: any) {
        set({ loadingPredictions: false });
        console.error("Failed to fetch predictions:", error);
      }
    },

    fetchRecommendations: async (repoId: string) => {
      set({ loadingRecommendations: true });
      try {
        const response = await axiosInstance.get(
          `/observability/${repoId}/recommendations`,
          {
            headers: getAuthHeaders(),
          }
        );

        set((state) => ({
          data: state.data
            ? { ...state.data, recommendations: response.data }
            : null,
          loadingRecommendations: false,
        }));
      } catch (error: any) {
        set({ loadingRecommendations: false });
        console.error("Failed to fetch recommendations:", error);
      }
    },

    fetchAlerts: async (repoId: string) => {
      try {
        const response = await axiosInstance.get(
          `/observability/${repoId}/alerts`,
          {
            headers: getAuthHeaders(),
          }
        );

        set((state) => ({
          data: state.data ? { ...state.data, alerts: response.data } : null,
        }));
      } catch (error: any) {
        console.error("Failed to fetch alerts:", error);
      }
    },

    acknowledgeAlert: async (alertId: string) => {
      try {
        await axiosInstance.post(
          `/observability/alerts/${alertId}/acknowledge`,
          {},
          { headers: getAuthHeaders() }
        );

        set((state) => ({
          data: state.data
            ? {
                ...state.data,
                alerts: state.data.alerts.map((alert) =>
                  alert.id === alertId
                    ? { ...alert, acknowledged: true }
                    : alert
                ),
              }
            : null,
        }));

        toast.success("Alert acknowledged");
      } catch (error: any) {
        toast.error("Failed to acknowledge alert");
      }
    },

    setTimeRange: (range) => {
      set({ timeRange: range });
      const { selectedRepoId } = get();
      if (selectedRepoId) {
        get().fetchTimeline(selectedRepoId, range);
      }
    },

    setSelectedRepo: (repoId) => {
      set({ selectedRepoId: repoId });
    },

    clearData: () => {
      set({ data: null, selectedRepoId: null, error: null });
    },

    clearError: () => {
      set({ error: null });
    },
  })
);
