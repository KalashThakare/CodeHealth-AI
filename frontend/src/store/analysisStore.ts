import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";

export interface AnalysisJob {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  repoId: string;
  estimatedWaitTime?: string;
  progress?: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  result?: any;
}

export interface AnalysisResult {
  jobId: string;
  repoId: string;
  analysisData: {
    codeQuality: {
      score: number;
      issues: Array<{
        type: string;
        severity: "low" | "medium" | "high" | "critical";
        message: string;
        file: string;
        line?: number;
      }>;
    };
    security: {
      score: number;
      vulnerabilities: Array<{
        type: string;
        severity: "low" | "medium" | "high" | "critical";
        description: string;
        file: string;
        recommendation: string;
      }>;
    };
    performance: {
      score: number;
      metrics: {
        complexity: number;
        maintainability: number;
        testCoverage: number;
      };
    };
    summary: {
      overallScore: number;
      totalIssues: number;
      criticalIssues: number;
      recommendations: string[];
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface AnalysisState {
  // State
  currentJob: AnalysisJob | null;
  analysisHistory: AnalysisJob[];
  analysisResults: Record<string, AnalysisResult>;
  loading: boolean;
  error: string | null;

  // Computed states
  isAnalyzing: boolean;
  hasActiveJob: boolean;

  // Actions
  startAnalysis: (repoId: string) => Promise<AnalysisJob | null>;
  checkJobStatus: (jobId: string) => Promise<void>;
  getAnalysisResult: (jobId: string) => Promise<AnalysisResult | null>;
  cancelAnalysis: (jobId: string) => Promise<boolean>;
  clearCurrentJob: () => void;
  clearError: () => void;
  clearHistory: () => void;

  // Polling
  startPolling: (jobId: string) => void;
  stopPolling: () => void;

  // Utils
  getJobById: (jobId: string) => AnalysisJob | null;
  getLatestJobForRepo: (repoId: string) => AnalysisJob | null;
}

let pollingInterval: NodeJS.Timeout | null = null;

export const useAnalysisStore = create<AnalysisState>()((set, get) => ({
  // Initial state
  currentJob: null,
  analysisHistory: [],
  analysisResults: {},
  loading: false,
  error: null,

  // Computed getters
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

  // Start repository analysis
  startAnalysis: async (repoId: string) => {
    set({ loading: true, error: null });

    try {
      console.log("Starting analysis for repo:", repoId);

      const response = await axiosInstance.post("/analyze/full-repo", {
        repoId: repoId,
      });

      if (response.status === 202) {
        const jobData: AnalysisJob = {
          jobId: response.data.data.jobId,
          status: "queued",
          repoId: response.data.data.repoId,
          estimatedWaitTime: response.data.data.estimatedWaitTime,
          startedAt: new Date().toISOString(),
        };

        set((state) => ({
          currentJob: jobData,
          analysisHistory: [
            jobData,
            ...state.analysisHistory.filter(
              (job) => job.jobId !== jobData.jobId
            ),
          ],
          loading: false,
          error: null,
        }));

        // Start polling for job status
        get().startPolling(jobData.jobId);

        console.log("Analysis job created:", jobData);
        return jobData;
      }

      throw new Error("Failed to start analysis");
    } catch (error: any) {
      console.error("Failed to start analysis:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to start repository analysis";

      set({
        loading: false,
        error: errorMessage,
        currentJob: null,
      });

      return null;
    }
  },

  // Check job status
  checkJobStatus: async (jobId: string) => {
    try {
      console.log("Checking status for job:", jobId);

      const response = await axiosInstance.get(`/analysis/status/${jobId}`);
      const jobStatus = response.data.data;

      set((state) => {
        const updatedJob: AnalysisJob = {
          ...state.currentJob,
          ...jobStatus,
          jobId: jobId,
        } as AnalysisJob;

        // Update completed timestamp if job is done
        if (
          ["completed", "failed"].includes(jobStatus.status) &&
          !updatedJob.completedAt
        ) {
          updatedJob.completedAt = new Date().toISOString();
        }

        // Update history
        const updatedHistory = state.analysisHistory.map((job) =>
          job.jobId === jobId ? updatedJob : job
        );

        return {
          currentJob:
            state.currentJob?.jobId === jobId ? updatedJob : state.currentJob,
          analysisHistory: updatedHistory,
        };
      });

      // Stop polling if job is complete
      if (["completed", "failed"].includes(jobStatus.status)) {
        get().stopPolling();

        // Fetch results if completed successfully
        if (jobStatus.status === "completed") {
          await get().getAnalysisResult(jobId);
        }
      }
    } catch (error: any) {
      console.error("Failed to check job status:", error);
    }
  },

  // Get analysis results
  getAnalysisResult: async (jobId: string) => {
    try {
      console.log("Fetching results for job:", jobId);

      const response = await axiosInstance.get(`/analysis/result/${jobId}`);
      const result: AnalysisResult = response.data.data;

      set((state) => ({
        analysisResults: {
          ...state.analysisResults,
          [jobId]: result,
        },
      }));

      console.log("Analysis results retrieved:", result);
      return result;
    } catch (error: any) {
      console.error("Failed to get analysis result:", error);

      const errorMessage =
        error.response?.data?.message || "Failed to retrieve analysis results";

      set({ error: errorMessage });
      return null;
    }
  },

  // Cancel analysis
  cancelAnalysis: async (jobId: string) => {
    try {
      console.log("Cancelling job:", jobId);

      const response = await axiosInstance.post(`/analysis/cancel/${jobId}`);

      if (response.status === 200) {
        get().stopPolling();

        set((state) => {
          const updatedJob =
            state.currentJob?.jobId === jobId
              ? {
                  ...state.currentJob,
                  status: "failed" as const,
                  error: "Cancelled by user",
                }
              : state.currentJob;

          const updatedHistory = state.analysisHistory.map((job) =>
            job.jobId === jobId
              ? {
                  ...job,
                  status: "failed" as const,
                  error: "Cancelled by user",
                }
              : job
          );

          return {
            currentJob: updatedJob,
            analysisHistory: updatedHistory,
          };
        });

        console.log("Analysis cancelled successfully");
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Failed to cancel analysis:", error);

      const errorMessage =
        error.response?.data?.message || "Failed to cancel analysis";

      set({ error: errorMessage });
      return false;
    }
  },

  // Polling management
  startPolling: (jobId: string) => {
    // Clear any existing polling
    get().stopPolling();

    console.log("Starting polling for job:", jobId);

    pollingInterval = setInterval(async () => {
      const { currentJob } = get();

      // Stop polling if no current job or job is complete
      if (!currentJob || ["completed", "failed"].includes(currentJob.status)) {
        get().stopPolling();
        return;
      }

      await get().checkJobStatus(jobId);
    }, 3000); // Poll every 3 seconds
  },

  stopPolling: () => {
    if (pollingInterval) {
      console.log("Stopping polling");
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  },

  // Utility actions
  clearCurrentJob: () => {
    get().stopPolling();
    set({ currentJob: null });
  },

  clearError: () => {
    set({ error: null });
  },

  clearHistory: () => {
    set({ analysisHistory: [], analysisResults: {} });
  },

  // Utility getters
  getJobById: (jobId: string) => {
    const { analysisHistory } = get();
    return analysisHistory.find((job) => job.jobId === jobId) || null;
  },

  getLatestJobForRepo: (repoId: string) => {
    const { analysisHistory } = get();
    const repoJobs = analysisHistory.filter((job) => job.repoId === repoId);
    return repoJobs.length > 0 ? repoJobs[0] : null;
  },
}));

// Cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    useAnalysisStore.getState().stopPolling();
  });
}
