import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";

export interface FileMetric {
  id: number;
  path: string;
  repoId: number;
  commitSha: string | null;
  branch: string | null;
  cyclomaticComplexity: number | null;
  maintainabilityIndex: number | null;
  locTotal: number | null;
  locSource: number | null;
  locLogical: number | null;
  locComments: number | null;
  locBlank: number | null;
  halsteadUniqueOperators: number | null;
  halsteadUniqueOperands: number | null;
  halsteadTotalOperators: number | null;
  halsteadTotalOperands: number | null;
  halsteadVocabulary: number | null;
  halsteadLength: number | null;
  halsteadVolume: number | null;
  analyzedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PushMetric {
  id: number;
  repository: string;
  repoId: number;
  branch: string;
  commitSha: string | null;
  impact: number;
  threshold: number;
  score: number;
  ok: boolean;
  message: string | null;
  files: Array<{
    sha: string;
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
  }>;
  riskAnalysis: {
    impactedFiles: string[];
    candidates: Array<{
      path: string;
      priority: number;
      reason: string;
    }>;
  };
  analyzedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Commit {
  id: string;
  repoId: number;
  branch: string;
  sha: string;
  message: string;
  authorName: string;
  authorEmail: string;
  authorDate: string;
  committerName: string;
  committerDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommitAnalysis {
  id: string;
  repoId: number;
  branch: string;
  totalCommits: number;
  topContributors: Array<{
    name: string;
    commits: number;
    email?: string;
  }>;
  commitsPerDay: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisJob {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  repoId: string;
  estimatedWaitTime?: string;
  progress?: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

// STORE STATE INTERFACE
interface AnalysisState {
  // Job Management
  currentJob: AnalysisJob | null;
  jobHistory: AnalysisJob[];

  // Metrics Data
  fileMetrics: FileMetric[];
  pushMetrics: PushMetric[];
  commits: Commit[];
  commitAnalysis: CommitAnalysis[];

  // UI State
  loading: boolean;
  error: string | null;

  // Computed
  isAnalyzing: boolean;
  hasActiveJob: boolean;

  // Actions - Job Management
  startAnalysis: (repoId: string) => Promise<AnalysisJob | null>;
  checkJobStatus: (jobId: string) => Promise<void>;
  cancelAnalysis: (jobId: string) => Promise<boolean>;
  clearCurrentJob: () => void;

  // Actions - Fetch Metrics
  fetchFileMetrics: (repoId: string) => Promise<void>;
  fetchPushMetrics: (repoId: string) => Promise<void>;
  fetchCommits: (repoId: string) => Promise<void>;
  fetchCommitAnalysis: (repoId: string) => Promise<void>;
  fetchAllMetrics: (repoId: string) => Promise<void>;

  // Actions - Utility
  clearError: () => void;
  clearHistory: () => void;
  clearAllData: () => void;

  // Polling
  startPolling: (jobId: string) => void;
  stopPolling: () => void;
}

// POLLING MANAGER
let pollingInterval: NodeJS.Timeout | null = null;

export const useAnalysisStore = create<AnalysisState>()((set, get) => ({
  // INITIAL STATE
  currentJob: null,
  jobHistory: [],
  fileMetrics: [],
  pushMetrics: [],
  commits: [],
  commitAnalysis: [],
  loading: false,
  error: null,

  // COMPUTED GETTERS
  get isAnalyzing() {
    const { currentJob } = get();
    return (
      currentJob?.status === "queued" || currentJob?.status === "processing"
    );
  },

  get hasActiveJob() {
    const { currentJob } = get();
    return (
      !!currentJob &&
      (currentJob.status === "queued" || currentJob.status === "processing")
    );
  },

  // JOB MANAGEMENT ACTIONS
  /**
   * Start full repository analysis
   * POST /analyze/full-repo
   */
  startAnalysis: async (repoId: string) => {
    set({ loading: true, error: null });

    const loadingToast = toast.loading("Starting repository analysis...");

    try {
      console.log("[Analysis] Starting analysis for repo:", repoId);

      const response = await axiosInstance.post("/analyze/full-repo", {
        repoId: Number(repoId),
      });

      if (response.status === 202 && response.data.data) {
        const jobData: AnalysisJob = {
          jobId: response.data.data.jobId,
          status: response.data.data.status || "queued",
          repoId: String(response.data.data.repoId),
          estimatedWaitTime:
            response.data.data.estimatedWaitTime || "2-5 minutes",
          startedAt: new Date().toISOString(),
        };

        set((state) => ({
          currentJob: jobData,
          jobHistory: [
            jobData,
            ...state.jobHistory.filter((job) => job.jobId !== jobData.jobId),
          ],
          loading: false,
          error: null,
        }));

        // Start polling for updates
        get().startPolling(jobData.jobId);

        toast.success("Analysis started successfully!", {
          id: loadingToast,
          description: `Job ID: ${jobData.jobId}`,
        });

        console.log("[Analysis] Job created successfully:", jobData);
        return jobData;
      }

      throw new Error("Invalid response from server");
    } catch (error: any) {
      console.error("[Analysis] Failed to start analysis:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to start repository analysis";

      toast.error("Analysis failed to start", {
        id: loadingToast,
        description: errorMessage,
      });

      set({
        loading: false,
        error: errorMessage,
        currentJob: null,
      });

      return null;
    }
  },

  /**
   * Check job status (placeholder - backend doesn't expose status endpoint yet)
   * When backend adds GET /analyze/job/:jobId, update this
   */
  checkJobStatus: async (jobId: string) => {
    try {
      console.log("[Analysis] Checking status for job:", jobId);

      const currentJob = get().currentJob;
      if (currentJob && currentJob.jobId === jobId) {
        // Try fetching file metrics as a proxy for completion
        try {
          await get().fetchFileMetrics(currentJob.repoId);

          // If successful, mark job as completed
          set((state) => ({
            currentJob: {
              ...state.currentJob!,
              status: "completed",
              completedAt: new Date().toISOString(),
            },
          }));

          toast.success("Analysis completed!", {
            description: `Repository ${currentJob.repoId} analyzed successfully`,
          });

          get().stopPolling();
        } catch {
          // Metrics not ready yet, keep polling
          console.log("[Analysis] Metrics not ready, continuing to poll...");
        }
      }
    } catch (error: any) {
      console.error("[Analysis] Failed to check job status:", error);

      toast.error("Status check failed", {
        description: "Unable to verify analysis progress",
      });
    }
  },

  /**
   * Cancel analysis job (backend doesn't expose cancel endpoint yet)
   */
  cancelAnalysis: async (jobId: string) => {
    const loadingToast = toast.loading("Cancelling analysis...");

    try {
      console.log("[Analysis] Attempting to cancel job:", jobId);

      // TODO: Implement when backend adds POST /analyze/cancel/:jobId
      // const response = await axiosInstance.post(`/analyze/cancel/${jobId}`);

      get().stopPolling();

      set((state) => {
        const updatedJob =
          state.currentJob?.jobId === jobId
            ? {
                ...state.currentJob,
                status: "failed" as const,
                error: "Cancelled by user",
                completedAt: new Date().toISOString(),
              }
            : state.currentJob;

        return {
          currentJob: updatedJob,
        };
      });

      toast.success("Analysis cancelled", {
        id: loadingToast,
        description: "The analysis job has been stopped",
      });

      console.log("[Analysis] Job cancelled");
      return true;
    } catch (error: any) {
      console.error("[Analysis] Failed to cancel:", error);

      const errorMessage =
        error.response?.data?.message || "Failed to cancel analysis";

      toast.error("Cancel failed", {
        id: loadingToast,
        description: errorMessage,
      });

      set({ error: errorMessage });
      return false;
    }
  },

  clearCurrentJob: () => {
    get().stopPolling();
    set({ currentJob: null });
    toast.info("Current job cleared");
  },

  // FETCH METRICS ACTIONS
  /**
   * Fetch file metrics for a repository
   * GET /analyze/:repoId/getfilemetrics
   */
  fetchFileMetrics: async (repoId: string) => {
    set({ loading: true, error: null });

    try {
      console.log("[Analysis] Fetching file metrics for repo:", repoId);

      const response = await axiosInstance.get(
        `/analyze/${repoId}/getfilemetrics`
      );

      if (response.data && response.data.metric) {
        set({
          fileMetrics: response.data.metric,
          loading: false,
          error: null,
        });

        toast.success("File metrics loaded", {
          description: `${response.data.metric.length} files analyzed`,
        });

        console.log(
          "[Analysis] File metrics loaded:",
          response.data.metric.length
        );
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error: any) {
      console.error("[Analysis] Failed to fetch file metrics:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch file metrics";

      toast.error("Failed to load file metrics", {
        description: errorMessage,
      });

      set({
        loading: false,
        error: errorMessage,
        fileMetrics: [],
      });
    }
  },

  /**
   * Fetch push analysis metrics
   * GET /analyze/:repoId/getpushmetrics
   */
  fetchPushMetrics: async (repoId: string) => {
    set({ loading: true, error: null });

    try {
      console.log("[Analysis] Fetching push metrics for repo:", repoId);

      const response = await axiosInstance.get(
        `/analyze/${repoId}/getpushmetrics`
      );

      if (response.data && response.data.metric) {
        set({
          pushMetrics: response.data.metric,
          loading: false,
          error: null,
        });

        toast.success("Push metrics loaded", {
          description: `${response.data.metric.length} pushes analyzed`,
        });

        console.log(
          "[Analysis] Push metrics loaded:",
          response.data.metric.length
        );
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error: any) {
      console.error("[Analysis] Failed to fetch push metrics:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch push metrics";

      toast.error("Failed to load push metrics", {
        description: errorMessage,
      });

      set({
        loading: false,
        error: errorMessage,
        pushMetrics: [],
      });
    }
  },

  /**
   * Fetch commit metadata
   * GET /analyze/:repoId/getCommits
   */
  fetchCommits: async (repoId: string) => {
    set({ loading: true, error: null });

    try {
      console.log("[Analysis] Fetching commits for repo:", repoId);

      const response = await axiosInstance.get(`/analyze/${repoId}/getCommits`);

      if (response.data && response.data.commits) {
        set({
          commits: response.data.commits,
          loading: false,
          error: null,
        });

        toast.success("Commits loaded", {
          description: `${response.data.commits.length} commits retrieved`,
        });

        console.log("[Analysis] Commits loaded:", response.data.commits.length);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error: any) {
      console.error("[Analysis] Failed to fetch commits:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch commits";

      toast.error("Failed to load commits", {
        description: errorMessage,
      });

      set({
        loading: false,
        error: errorMessage,
        commits: [],
      });
    }
  },

  /**
   * Fetch commit analysis
   * GET /analyze/:repoId/getCommits-analysis
   */
  fetchCommitAnalysis: async (repoId: string) => {
    set({ loading: true, error: null });

    try {
      console.log("[Analysis] Fetching commit analysis for repo:", repoId);

      const response = await axiosInstance.get(
        `/analyze/${repoId}/getCommits-analysis`
      );

      if (response.data && response.data.analysis) {
        set({
          commitAnalysis: response.data.analysis,
          loading: false,
          error: null,
        });

        toast.success("Commit analysis loaded", {
          description: `${response.data.analysis.length} analyses retrieved`,
        });

        console.log(
          "[Analysis] Commit analysis loaded:",
          response.data.analysis.length
        );
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error: any) {
      console.error("[Analysis] Failed to fetch commit analysis:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch commit analysis";

      toast.error("Failed to load commit analysis", {
        description: errorMessage,
      });

      set({
        loading: false,
        error: errorMessage,
        commitAnalysis: [],
      });
    }
  },

  /**
   * Fetch all metrics for a repository (convenience method)
   */
  fetchAllMetrics: async (repoId: string) => {
    set({ loading: true, error: null });

    const loadingToast = toast.loading("Loading all metrics...");

    try {
      console.log("[Analysis] Fetching all metrics for repo:", repoId);

      const results = await Promise.allSettled([
        get().fetchFileMetrics(repoId),
        get().fetchPushMetrics(repoId),
        get().fetchCommits(repoId),
        get().fetchCommitAnalysis(repoId),
      ]);

      const failedCount = results.filter((r) => r.status === "rejected").length;

      set({ loading: false });

      if (failedCount === 0) {
        toast.success("All metrics loaded successfully", {
          id: loadingToast,
          description: "Repository data is ready",
        });
      } else if (failedCount < results.length) {
        toast.warning("Some metrics failed to load", {
          id: loadingToast,
          description: `${results.length - failedCount} out of ${
            results.length
          } loaded`,
        });
      } else {
        toast.error("Failed to load metrics", {
          id: loadingToast,
          description: "All metric requests failed",
        });
      }

      console.log("[Analysis] All metrics fetched");
    } catch (error: any) {
      console.error("[Analysis] Failed to fetch all metrics:", error);

      toast.error("Failed to load metrics", {
        id: loadingToast,
        description: "An unexpected error occurred",
      });

      set({
        loading: false,
        error: "Failed to fetch some metrics",
      });
    }
  },

  // UTILITY ACTIONS
  clearError: () => {
    set({ error: null });
  },

  clearHistory: () => {
    set({ jobHistory: [] });
    toast.info("Job history cleared");
  },

  clearAllData: () => {
    get().stopPolling();
    set({
      currentJob: null,
      jobHistory: [],
      fileMetrics: [],
      pushMetrics: [],
      commits: [],
      commitAnalysis: [],
      loading: false,
      error: null,
    });
    toast.info("All analysis data cleared");
  },

  // POLLING MANAGEMENT
  startPolling: (jobId: string) => {
    // Clear any existing polling
    get().stopPolling();

    console.log("[Analysis] Starting polling for job:", jobId);

    pollingInterval = setInterval(async () => {
      const { currentJob } = get();

      // Stop if no job or job completed
      if (!currentJob || ["completed", "failed"].includes(currentJob.status)) {
        get().stopPolling();
        return;
      }

      await get().checkJobStatus(jobId);
    }, 5000); // Poll every 5 seconds
  },

  stopPolling: () => {
    if (pollingInterval) {
      console.log("[Analysis] Stopping polling");
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  },
}));

// CLEANUP ON PAGE UNLOAD
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    useAnalysisStore.getState().stopPolling();
  });
}