import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";

// ==================== INTERFACES ====================

export interface RefactorPriorityFile {
  path: string;
  riskScore: number;
  cyclomaticComplexity: number;
  maintainabilityIndex: number;
  halsteadVolume: number;
  locTotal: number;
  reason: string;
}

export interface RepoMetrics {
  avgCyclomaticComplexity: number;
  avgMaintainabilityIndex: number;
  avgHalsteadVolume: number;
  weightedCyclomaticComplexity: number;
  weightedMaintainabilityIndex: number;
  weightedHalsteadVolume: number;
  technicalDebtScore: number;
  totalLOC: number;
  totalFiles: number;
  refactorPriorityFiles: RefactorPriorityFile[];
}

export interface CommitAnalysis {
  totalCommits: number;
  daysActive: number;
  activeDays: number;
  activityRatio: number;
  avgCommitsPerDay: number;
  recentCommits30Days: number;
  contributorCount: number;
  topContributorRatio: number;
  busFactor: "low" | "medium" | "high" | "unknown";
  avgMessageLength: number;
  firstCommit: string;
  lastCommit: string;
  velocity: {
    trend: "increasing" | "decreasing" | "stable" | "insufficient_data";
    consistency: number;
  };
}

export interface RepoHealthScore {
  overallHealthScore: number;
  healthRating: "excellent" | "good" | "fair" | "needs_improvement";
  componentScores: {
    codeQuality: number;
    developmentActivity: number;
    busFactor: number;
    community: number;
  };
  strengths: string[];
  weaknesses: string[];
}

export interface Distributions {
  maintainabilityDistribution: number[];
  complexityDistribution: number[];
}

export interface FullRepoAnalysis {
  result: RepoMetrics;
  commitAnalysis: CommitAnalysis;
  repoHealthScore: RepoHealthScore;
  distributions: Distributions;
}

// ==================== STORE STATE INTERFACE ====================

interface AnalysisState {
  // Analysis Data
  fullAnalysis: FullRepoAnalysis | null;

  // UI State
  loading: boolean;
  error: string | null;

  // Actions - Fetch Analysis (3 backend routes)
  fetchFullAnalysis: (repoId: string) => Promise<void>;
  fetchAiInsights: (repoId: string) => Promise<any>;
  validateAiInsights: (repoId: string) => Promise<any>;

  // Actions - Utility
  clearError: () => void;
  clearAllData: () => void;

  // Actions - Export
  exportToCSV: () => string | null;
  exportToPDF: () => void;
}

// ==================== ZUSTAND STORE ====================

export const useAnalysisStore = create<AnalysisState>()((set, get) => ({
  // ==================== INITIAL STATE ====================
  fullAnalysis: null,
  loading: false,
  error: null,

  // ==================== FETCH FULL ANALYSIS ====================
  /**
   * Fetch full repository analysis
   * GET /analyze/:repoId/full-repo
   *
   * Backend: analyze_repo controller
   * Returns: { message: "Success", analysis: {...all fields...} }
   */
  fetchFullAnalysis: async (repoId: string) => {
    set({ loading: true, error: null });

    try {
      console.log("[Analysis] Fetching full analysis for repo:", repoId);

      const response = await axiosInstance.get(`/analyze/${repoId}/full-repo`);

      if (response.data?.message === "Success" && response.data?.analysis) {
        const analysis = response.data.analysis;

        // Map database fields to TypeScript interface
        const analysisData: FullRepoAnalysis = {
          result: {
            avgCyclomaticComplexity: analysis.avgCyclomaticComplexity || 0,
            avgMaintainabilityIndex: analysis.avgMaintainabilityIndex || 0,
            avgHalsteadVolume: analysis.avgHalsteadVolume || 0,
            weightedCyclomaticComplexity:
              analysis.weightedCyclomaticComplexity || 0,
            weightedMaintainabilityIndex:
              analysis.weightedMaintainabilityIndex || 0,
            weightedHalsteadVolume: analysis.weightedHalsteadVolume || 0,
            technicalDebtScore: analysis.technicalDebtScore || 0,
            totalLOC: analysis.totalLOC || 0,
            totalFiles: analysis.totalFiles || 0,
            refactorPriorityFiles: Array.isArray(analysis.refactorPriorityFiles)
              ? analysis.refactorPriorityFiles
              : [],
          },
          commitAnalysis: {
            totalCommits: analysis.totalCommits || 0,
            daysActive: analysis.daysActive || 0,
            activeDays: analysis.activeDays || 0,
            activityRatio: analysis.activityRatio || 0,
            avgCommitsPerDay: analysis.avgCommitsPerDay || 0,
            recentCommits30Days: analysis.recentCommits30Days || 0,
            contributorCount: analysis.contributorCount || 0,
            topContributorRatio: analysis.topContributorRatio || 0,
            busFactor: analysis.busFactor || "unknown",
            avgMessageLength: analysis.avgMessageLength || 0,
            firstCommit: analysis.firstCommit || new Date().toISOString(),
            lastCommit: analysis.lastCommit || new Date().toISOString(),
            velocity: {
              trend: analysis.velocityTrend || "insufficient_data",
              consistency: analysis.velocityConsistency || 0,
            },
          },
          repoHealthScore: {
            overallHealthScore: analysis.overallHealthScore || 0,
            healthRating: analysis.healthRating || "needs_improvement",
            componentScores: {
              codeQuality: analysis.codeQualityScore || 0,
              developmentActivity: analysis.developmentActivityScore || 0,
              busFactor: analysis.busFactorScore || 0,
              community: analysis.communityScore || 0,
            },
            strengths: Array.isArray(analysis.strengths)
              ? analysis.strengths
              : [],
            weaknesses: Array.isArray(analysis.weaknesses)
              ? analysis.weaknesses
              : [],
          },
          distributions: {
            maintainabilityDistribution: Array.isArray(
              analysis.maintainabilityDistribution
            )
              ? analysis.maintainabilityDistribution
              : [0, 0, 0, 0, 0],
            complexityDistribution: Array.isArray(
              analysis.complexityDistribution
            )
              ? analysis.complexityDistribution
              : [0, 0, 0, 0, 0],
          },
        };

        set({
          fullAnalysis: analysisData,
          loading: false,
          error: null,
        });

        toast.success("Analysis loaded successfully", {
          description: `${analysisData.result.totalFiles} files analyzed`,
        });

        console.log("[Analysis] Full analysis loaded successfully");
      } else {
        throw new Error("Invalid response structure from backend");
      }
    } catch (error: any) {
      console.error("[Analysis] Failed to fetch full analysis:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch repository analysis";

      toast.error("Failed to load analysis", {
        description: errorMessage,
      });

      set({
        loading: false,
        error: errorMessage,
        fullAnalysis: null,
      });

      throw error;
    }
  },

  // ==================== FETCH AI INSIGHTS ====================
  /**
   * Fetch AI-generated insights for repository
   * GET /analyze/:repoId/insights
   *
   * Backend: getAiInsights controller
   * Returns: { message: "Success", repoId, aiInsights: {...} }
   */
  fetchAiInsights: async (repoId: string) => {
    set({ loading: true, error: null });

    try {
      console.log("[Analysis] Fetching AI insights for repo:", repoId);

      const response = await axiosInstance.get(`/analyze/${repoId}/insights`);

      if (response.data?.message === "Success" && response.data?.aiInsights) {
        set({ loading: false, error: null });

        toast.success("AI insights loaded successfully");

        console.log("[Analysis] AI insights loaded:", response.data.aiInsights);
        return response.data.aiInsights;
      } else {
        throw new Error("Invalid AI insights response");
      }
    } catch (error: any) {
      console.error("[Analysis] Failed to fetch AI insights:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch AI insights";

      toast.error("Failed to load AI insights", {
        description: errorMessage,
      });

      set({
        loading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  // ==================== VALIDATE AI INSIGHTS ====================
  /**
   * Validate if AI insights exist for repository
   * GET /analyze/:repoId/fetchInsights
   *
   * Backend: fetchAiInsights controller
   * Returns: { success: boolean, message: string }
   */
  validateAiInsights: async (repoId: string) => {
    try {
      console.log("[Analysis] Validating AI insights for repo:", repoId);

      const response = await axiosInstance.get(
        `/analyze/${repoId}/fetchInsights`
      );

      if (response.data) {
        console.log("[Analysis] AI insights validation result:", response.data);
        return response.data;
      } else {
        throw new Error("Invalid validation response");
      }
    } catch (error: any) {
      console.error("[Analysis] Failed to validate AI insights:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to validate AI insights";

      toast.error("Validation failed", {
        description: errorMessage,
      });

      throw error;
    }
  },

  // ==================== UTILITY ACTIONS ====================

  clearError: () => {
    set({ error: null });
  },

  clearAllData: () => {
    set({
      fullAnalysis: null,
      loading: false,
      error: null,
    });
    toast.info("All analysis data cleared");
  },

  // ==================== EXPORT ACTIONS ====================

  /**
   * Export analysis data to CSV format
   */
  exportToCSV: () => {
    const { fullAnalysis } = get();

    if (!fullAnalysis) {
      toast.error("No data to export");
      return null;
    }

    try {
      const { result, commitAnalysis, repoHealthScore } = fullAnalysis;

      // Create CSV content
      let csv = "Code Health Analytics Report\n\n";

      // Overall Metrics
      csv += "Overall Metrics\n";
      csv += "Metric,Value\n";
      csv += `Overall Health Score,${repoHealthScore.overallHealthScore}\n`;
      csv += `Health Rating,${repoHealthScore.healthRating}\n`;
      csv += `Technical Debt Score,${result.technicalDebtScore}\n`;
      csv += `Total Files,${result.totalFiles}\n`;
      csv += `Total Lines of Code,${result.totalLOC}\n`;
      csv += `Avg Maintainability Index,${result.avgMaintainabilityIndex.toFixed(
        2
      )}\n`;
      csv += `Avg Cyclomatic Complexity,${result.avgCyclomaticComplexity.toFixed(
        2
      )}\n\n`;

      // Commit Analysis
      csv += "Development Activity\n";
      csv += "Metric,Value\n";
      csv += `Total Commits,${commitAnalysis.totalCommits}\n`;
      csv += `Active Days,${commitAnalysis.activeDays}\n`;
      csv += `Avg Commits/Day,${commitAnalysis.avgCommitsPerDay.toFixed(2)}\n`;
      csv += `Recent Commits (30d),${commitAnalysis.recentCommits30Days}\n`;
      csv += `Contributors,${commitAnalysis.contributorCount}\n`;
      csv += `Bus Factor,${commitAnalysis.busFactor}\n`;
      csv += `Velocity Trend,${commitAnalysis.velocity.trend}\n\n`;

      // High Risk Files
      csv += "High Risk Files\n";
      csv += "Path,Risk Score,Complexity,Maintainability,Reason\n";
      result.refactorPriorityFiles.forEach((file) => {
        csv += `"${file.path}",${file.riskScore},${file.cyclomaticComplexity},${file.maintainabilityIndex},"${file.reason}"\n`;
      });

      toast.success("CSV generated successfully");
      return csv;
    } catch (error) {
      console.error("[Export] Failed to generate CSV:", error);
      toast.error("Failed to generate CSV");
      return null;
    }
  },

  /**
   * Export analysis data to PDF (placeholder for future implementation)
   */
  exportToPDF: () => {
    toast.info("PDF export feature coming soon!");
  },
}));
