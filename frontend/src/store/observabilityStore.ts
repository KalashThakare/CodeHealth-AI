import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { isMockDataEnabled } from "@/data/mockDataUtils";
import { ALL_MOCK_DATA } from "@/data/mockObservabilityData";

export interface HealthTimelinePoint {
  date: string;
  healthScore: number | null;
  codeQuality: number | null;
}

export interface RiskTimelinePoint {
  date: string;
  technicalDebt: number | null;
  highRiskFiles: number;
}

export interface VelocityTimelinePoint {
  date: string;
  velocityTrend: number | null;
}

export interface QuickSummary {
  currentHealthScore: number | null;
  currentTechnicalDebt: number | null;
  currentHighRiskFiles: number;
  currentVelocityTrend: number | null;
  currentCodeQuality: number | null;
  lastUpdated: string;
}

export interface TrendData {
  healthTimeline: HealthTimelinePoint[];
  riskTimeline: RiskTimelinePoint[];
  velocityTimeline: VelocityTimelinePoint[];
  quickSummary: QuickSummary | null;
}

export interface PushActivitySummary {
  totalPushes: number;
  totalCommits: number;
  avgPushesPerDay: string;
  avgCommitsPerDay: string;
  activeDays: number;
  uniqueContributors: number;
}

export interface DailyMetric {
  date: string;
  totalPushes: number;
  totalCommits: number;
  uniqueContributors: number;
  isActive: boolean;
}

export interface HourlyHeatmapPoint {
  hour: number;
  count: number;
}

export interface TopContributor {
  userId: string;
  totalPushes: number;
  totalCommits: number;
}

export interface PushActivityData {
  summary: PushActivitySummary;
  dailyMetrics: DailyMetric[];
  heatmapData: HourlyHeatmapPoint[];
  topContributors: TopContributor[];
}

export interface HeatmapPoint {
  day: string;
  hour: number;
  count: number;
}

export interface HeatmapData {
  heatmapData: HeatmapPoint[];
}

export interface PRVelocitySummary {
  totalPRsOpened: number;
  totalPRsMerged: number;
  totalPRsClosed: number;
  avgTimeToMerge: number;
  medianTimeToMerge: number;
  avgTimeToFirstReview: number;
  medianTimeToFirstReview: number;
  currentOpenPRs: number;
  currentStalePRs: number;
  avgReviewsPerPR: number;
  prsWithoutReview: number;
  avgTimeToMergeFormatted: string;
  avgTimeToFirstReviewFormatted: string;
}

export interface PRVelocityTrend {
  mergeTime: string;
  reviewTime: string;
  throughput: string;
}

export interface PRChartDataPoint {
  date: string;
  opened: number;
  merged: number;
  timeToMerge: number;
  timeToReview: number;
}

export interface PRVelocityData {
  summary: PRVelocitySummary;
  trend: PRVelocityTrend;
  dailyMetrics: any[];
  chartData: PRChartDataPoint[];
}

export interface StalePR {
  id: string;
  prNumber: number;
  title: string;
  authorId: string;
  createdAt: string;
  daysSinceCreated: number;
  reviewCount: number;
  lastReviewDate: string | null;
}

export interface StalePRsData {
  count: number;
  stalePRs: StalePR[];
}

export interface ReviewerData {
  reviewerId: string;
  reviewerName: string;
  totalReviews: number;
  avgResponseTime: number;
  avgResponseTimeFormatted: string;
  approvals: number;
  changesRequested: number;
  comments: number;
  isBottleneck: boolean;
  bottleneckDays: number;
  pendingReviews: number;
  performanceRating: string;
}

export interface TeamStats {
  totalReviewers: number;
  totalReviews: number;
  avgTeamResponseTime: number;
  avgTeamResponseTimeFormatted: string;
  bottleneckCount: number;
  totalPendingReviews: number;
}

export interface ReviewerPerformanceData {
  teamStats: TeamStats;
  reviewers: ReviewerData[];
  bottlenecks: ReviewerData[];
  recommendations: string[];
}

export interface MergeTimeDistribution {
  under1Hour: number;
  under4Hours: number;
  under1Day: number;
  under1Week: number;
  over1Week: number;
}

export interface ReviewTimeDistribution {
  under1Hour: number;
  under4Hours: number;
  under1Day: number;
  over1Day: number;
}

export interface PRDistributionData {
  mergeTimeDistribution: MergeTimeDistribution;
  reviewTimeDistribution: ReviewTimeDistribution;
}

interface ObservabilityState {
  trendData: TrendData | null;
  pushActivityData: PushActivityData | null;
  heatmapData: HeatmapData | null;
  prVelocityData: PRVelocityData | null;
  stalePRsData: StalePRsData | null;
  reviewerData: ReviewerPerformanceData | null;
  prDistributionData: PRDistributionData | null;

  selectedRepoId: string | null;
  timeRange: number;
  activeSection: string;
  loading: boolean;
  loadingStates: {
    trend: boolean;
    pushActivity: boolean;
    heatmap: boolean;
    prVelocity: boolean;
    stalePRs: boolean;
    reviewers: boolean;
    distribution: boolean;
  };
  error: string | null;

  setSelectedRepoId: (repoId: string | null) => void;
  setTimeRange: (days: number) => void;
  setActiveSection: (section: string) => void;

  fetchAllData: (repoId: string) => Promise<void>;
  fetchTrendData: (repoId: string) => Promise<void>;
  fetchPushActivity: (repoId: string, days?: number) => Promise<void>;
  fetchHeatmap: (repoId: string, days?: number) => Promise<void>;
  fetchPRVelocity: (repoId: string, days?: number) => Promise<void>;
  fetchStalePRs: (repoId: string) => Promise<void>;
  fetchReviewerPerformance: (repoId: string, days?: number) => Promise<void>;
  fetchPRDistribution: (repoId: string, days?: number) => Promise<void>;

  loadMockData: () => void;
  clearData: () => void;
  clearError: () => void;
}

export const useObservabilityStore = create<ObservabilityState>()(
  (set, get) => ({
    trendData: null,
    pushActivityData: null,
    heatmapData: null,
    prVelocityData: null,
    stalePRsData: null,
    reviewerData: null,
    prDistributionData: null,

    selectedRepoId: null,
    timeRange: 30,
    activeSection: "overview",
    loading: false,
    loadingStates: {
      trend: false,
      pushActivity: false,
      heatmap: false,
      prVelocity: false,
      stalePRs: false,
      reviewers: false,
      distribution: false,
    },
    error: null,

    setSelectedRepoId: (repoId) => set({ selectedRepoId: repoId }),
    setTimeRange: (days) => {
      set({ timeRange: days });
      const { selectedRepoId } = get();
      if (selectedRepoId) {
        get().fetchAllData(selectedRepoId);
      }
    },
    setActiveSection: (section) => set({ activeSection: section }),

    fetchAllData: async (repoId: string) => {
      const { timeRange } = get();
      set({ loading: true, error: null, selectedRepoId: repoId });

      console.log(
        `[ObservabilityStore] Fetching all data for repo: ${repoId}, days: ${timeRange}`
      );

      if (isMockDataEnabled()) {
        console.log(
          `[ObservabilityStore] Loading MOCK data (set NEXT_PUBLIC_USE_MOCK_DATA=false to use backend)`
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        return get().loadMockData();
      }

      try {
        await Promise.all([
          get().fetchTrendData(repoId),
          get().fetchPushActivity(repoId, timeRange),
          get().fetchHeatmap(repoId, timeRange),
          get().fetchPRVelocity(repoId, timeRange),
          get().fetchStalePRs(repoId),
          get().fetchReviewerPerformance(repoId, timeRange),
          get().fetchPRDistribution(repoId, timeRange),
        ]);
      } catch (error: any) {
        console.error("[ObservabilityStore] Error fetching data:", error);
        set({ error: error?.message || "Failed to fetch observability data" });
      } finally {
        set({ loading: false });
      }
    },

    fetchTrendData: async (repoId: string) => {
      set((state) => ({
        loadingStates: { ...state.loadingStates, trend: true },
      }));
      try {
        const response = await axiosInstance.get(
          `/observability/${repoId}/trend`
        );
        console.log("[ObservabilityStore] Trend data:", response.data);
        set({ trendData: response.data });
      } catch (error: any) {
        console.error("[ObservabilityStore] Trend error:", error);
      } finally {
        set((state) => ({
          loadingStates: { ...state.loadingStates, trend: false },
        }));
      }
    },

    fetchPushActivity: async (repoId: string, days = 30) => {
      set((state) => ({
        loadingStates: { ...state.loadingStates, pushActivity: true },
      }));
      try {
        const response = await axiosInstance.get(
          `/observability/${repoId}/push-activity?days=${days}`
        );
        console.log("[ObservabilityStore] Push activity data:", response.data);
        set({ pushActivityData: response.data });
      } catch (error: any) {
        console.error("[ObservabilityStore] Push activity error:", error);
      } finally {
        set((state) => ({
          loadingStates: { ...state.loadingStates, pushActivity: false },
        }));
      }
    },

    fetchHeatmap: async (repoId: string, days = 30) => {
      set((state) => ({
        loadingStates: { ...state.loadingStates, heatmap: true },
      }));
      try {
        const response = await axiosInstance.get(
          `/observability/${repoId}/activity-heatmap?days=${days}`
        );
        console.log("[ObservabilityStore] Heatmap data:", response.data);
        set({ heatmapData: response.data });
      } catch (error: any) {
        console.error("[ObservabilityStore] Heatmap error:", error);
      } finally {
        set((state) => ({
          loadingStates: { ...state.loadingStates, heatmap: false },
        }));
      }
    },

    fetchPRVelocity: async (repoId: string, days = 30) => {
      set((state) => ({
        loadingStates: { ...state.loadingStates, prVelocity: true },
      }));
      try {
        const response = await axiosInstance.get(
          `/observability/${repoId}/pr-velocity?days=${days}`
        );
        console.log("[ObservabilityStore] PR velocity data:", response.data);
        set({ prVelocityData: response.data });
      } catch (error: any) {
        console.error("[ObservabilityStore] PR velocity error:", error);
      } finally {
        set((state) => ({
          loadingStates: { ...state.loadingStates, prVelocity: false },
        }));
      }
    },

    fetchStalePRs: async (repoId: string) => {
      set((state) => ({
        loadingStates: { ...state.loadingStates, stalePRs: true },
      }));
      try {
        const response = await axiosInstance.get(
          `/observability/${repoId}/stale-prs`
        );
        console.log("[ObservabilityStore] Stale PRs data:", response.data);
        set({ stalePRsData: response.data });
      } catch (error: any) {
        console.error("[ObservabilityStore] Stale PRs error:", error);
      } finally {
        set((state) => ({
          loadingStates: { ...state.loadingStates, stalePRs: false },
        }));
      }
    },

    fetchReviewerPerformance: async (repoId: string, days = 30) => {
      set((state) => ({
        loadingStates: { ...state.loadingStates, reviewers: true },
      }));
      try {
        const response = await axiosInstance.get(
          `/observability/${repoId}/reviewer-performance?days=${days}`
        );
        console.log(
          "[ObservabilityStore] Reviewer performance data:",
          response.data
        );
        set({ reviewerData: response.data });
      } catch (error: any) {
        console.error(
          "[ObservabilityStore] Reviewer performance error:",
          error
        );
      } finally {
        set((state) => ({
          loadingStates: { ...state.loadingStates, reviewers: false },
        }));
      }
    },

    fetchPRDistribution: async (repoId: string, days = 30) => {
      set((state) => ({
        loadingStates: { ...state.loadingStates, distribution: true },
      }));
      try {
        const response = await axiosInstance.get(
          `/observability/${repoId}/pr-distribution?days=${days}`
        );
        console.log(
          "[ObservabilityStore] PR distribution data:",
          response.data
        );
        set({ prDistributionData: response.data });
      } catch (error: any) {
        console.error("[ObservabilityStore] PR distribution error:", error);
      } finally {
        set((state) => ({
          loadingStates: { ...state.loadingStates, distribution: false },
        }));
      }
    },

    loadMockData: () => {
      console.log("[ObservabilityStore] Loading mock data...");
      set({
        trendData: ALL_MOCK_DATA.trend,
        pushActivityData: ALL_MOCK_DATA.pushActivity,
        heatmapData: ALL_MOCK_DATA.heatmap,
        prVelocityData: ALL_MOCK_DATA.prVelocity,
        stalePRsData: ALL_MOCK_DATA.stalePRs,
        reviewerData: ALL_MOCK_DATA.reviewerPerformance,
        prDistributionData: ALL_MOCK_DATA.prDistribution,
        loading: false,
        error: null,
      });
      console.log("[ObservabilityStore] Mock data loaded successfully ✅");
    },

    clearData: () => {
      set({
        trendData: null,
        pushActivityData: null,
        heatmapData: null,
        prVelocityData: null,
        stalePRsData: null,
        reviewerData: null,
        prDistributionData: null,
        selectedRepoId: null,
        error: null,
      });
    },

    clearError: () => set({ error: null }),
  })
);
