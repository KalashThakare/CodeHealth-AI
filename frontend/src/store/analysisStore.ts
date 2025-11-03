import { create } from "zustand";
import { axiosInstance, axiosAIInstance } from "@/lib/axios";
import { toast } from "sonner";
import {
  saveCachedAnalysis,
  loadCachedAnalysis,
  loadMostRecentAnalysis,
  getCachedAnalysesList,
  clearCachedAnalysis,
  clearAllCachedAnalyses,
  type CacheMetadata,
} from "@/utils/analysisCache";

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
    consistency: "low" | "medium" | "high" | "stable";
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

// AI Insights Interfaces
export interface RefactoringSuggestion {
  file: string;
  priority: string;
  currentIssues: string[];
  recommendations: Array<{
    action: string;
    benefit: string;
    effort: string;
  }>;
  estimatedEffort: string;
  risks: string;
  businessImpact: {
    currentCost: string;
    incidentRisk: string;
    velocitySlowdown: string;
    postRefactoringGain: string;
  };
  teamHealthImpact: {
    ownershipRisk: string;
    burnoutIndicator: string;
    knowledgeGap: string;
  };
}

export interface CodeSmell {
  type: string;
  severity: string;
  affectedFiles: string[];
  rootCause: string;
  impact: string;
  estimatedFixTime: string;
}

export interface CodeSmells {
  codeSmells: CodeSmell[];
  overallCodeHealth: string;
}

export interface QuickWin {
  action: string;
  estimatedTime: string;
  impact: string;
  effort: string;
  risk: string;
  steps: string[];
  priority: number;
}

export interface Architectural {
  recommendations: string[];
  roadmap: any;
  strategy: any;
}

export interface AIInsights {
  repoId: string | null;
  repoName: string;
  branch: string;
  timestamp: string;
  inputSummary: {
    healthScore: number;
    technicalDebt: number;
    totalFiles: number;
    highRiskFiles: number;
  };
  insights: {
    refactoringSuggestions: RefactoringSuggestion[];
    codeSmells: {
      codeSmells: CodeSmell[];
      overallCodeHealth: string;
    };
    architectural: Architectural;
    quickWins: {
      quickWins: QuickWin[];
      totalEstimatedTime: string;
      expectedImpact: string;
    };
  };
  overallAssessment: {
    recommendations: string[];
    strategy: string;
  };
}

export interface FullRepoAnalysis {
  result: RepoMetrics;
  commitAnalysis: CommitAnalysis;
  repoHealthScore: RepoHealthScore;
  distributions: Distributions;
  aiInsights?: AIInsights;
}

// ==================== STORE STATE INTERFACE ====================

interface AnalysisState {
  // Analysis Data
  fullAnalysis: FullRepoAnalysis | null;
  currentAnalysisTimestamp: number | null; // Track which cached version is displayed

  // Cache Management
  cachedAnalysesList: CacheMetadata[];
  isViewingCached: boolean; // Flag to show if viewing historical data

  // UI State
  loading: boolean; // For main analysis loading
  loadingAiInsights: boolean; // For AI insights loading only
  error: string | null;
  aiInsightsError: string | null; // Separate error for AI insights

  // Actions - Fetch Analysis (3 backend routes)
  fetchFullAnalysis: (repoId: string, useCache?: boolean) => Promise<void>;
  fetchAiInsights: (repoId: string) => Promise<any>;
  validateAiInsights: (repoId: string) => Promise<any>;

  // Actions - Cache Management
  loadCachedAnalyses: (repoId: string) => void;
  loadSpecificCachedAnalysis: (repoId: string, timestamp: number) => void;
  deleteCachedAnalysis: (repoId: string, timestamp: number) => void;
  clearRepoCache: (repoId: string) => void;

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
  currentAnalysisTimestamp: null,
  cachedAnalysesList: [],
  isViewingCached: false,
  loading: false,
  loadingAiInsights: false,
  error: null,
  aiInsightsError: null,

  // ==================== FETCH FULL ANALYSIS ====================
  /**
   * Fetch full repository analysis
   * GET /analyze/:repoId/full-repo
   *
   * Backend: analyze_repo controller
   * Returns: { message: "Success", analysis: {...all fields...} }
   */
  fetchFullAnalysis: async (repoId: string, useCache: boolean = true) => {
    set({ loading: true, error: null });

    try {
      console.log("[Analysis] Fetching full analysis for repo:", repoId);

      // 1) If useCache is true, load and show cached data ONLY (no background fetch)
      if (useCache) {
        const cached = loadMostRecentAnalysis<FullRepoAnalysis>(repoId);
        if (cached) {
          set({
            fullAnalysis: cached.data,
            currentAnalysisTimestamp: cached.metadata.timestamp,
            isViewingCached: false, // Show as current, not historical
            loading: false,
          });
          console.log("[Analysis] Loaded most recent cached analysis");

          // Update cached list
          get().loadCachedAnalyses(repoId);

          toast.success("Loaded cached analysis", {
            description: `From ${cached.metadata.label}`,
          });

          // STOP HERE - do not fetch from network when using cache
          return;
        } else {
          // No cache found, proceed to network fetch
          console.log(
            "[Analysis] No cached analysis found, fetching from network"
          );
        }
      }

      // 2) Network fetch (only when useCache=false OR no cache exists)
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
              consistency:
                typeof analysis.velocityConsistency === "number"
                  ? analysis.velocityConsistency > 0.7
                    ? "high"
                    : analysis.velocityConsistency > 0.4
                    ? "medium"
                    : "low"
                  : analysis.velocityConsistency || "medium",
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

        // Save to cache with metadata
        const timestamp = saveCachedAnalysis(repoId, analysisData, {
          healthScore: analysisData.repoHealthScore.overallHealthScore,
          totalFiles: analysisData.result.totalFiles,
        });

        set({
          fullAnalysis: analysisData,
          currentAnalysisTimestamp: timestamp,
          isViewingCached: false,
          loading: false,
          error: null,
        });

        // Update cached list
        get().loadCachedAnalyses(repoId);

        // Don't automatically load AI insights - let user trigger it manually
        // This prevents unnecessary API calls and provides better UX with lazy loading

        toast.success("Analysis refreshed successfully", {
          description: `${analysisData.result.totalFiles} files analyzed`,
        });

        console.log("[Analysis] Full analysis loaded and cached successfully");
      } else {
        throw new Error("Invalid response structure from backend");
      }
    } catch (error: any) {
      console.error("[Analysis] Failed to fetch full analysis:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch repository analysis";

      // If using cache and network failed, try to show cached data
      if (useCache) {
        const cached = loadMostRecentAnalysis<FullRepoAnalysis>(repoId);
        if (cached) {
          set({
            fullAnalysis: cached.data,
            currentAnalysisTimestamp: cached.metadata.timestamp,
            isViewingCached: false,
            loading: false,
          });
          get().loadCachedAnalyses(repoId);
          toast.info("Loaded cached analysis (network unavailable)", {
            description: `From ${cached.metadata.label}`,
          });
          return;
        }
      }

      // No cache available or not using cache - show error
      toast.error("Failed to load analysis", { description: errorMessage });
      set({ loading: false, error: errorMessage, fullAnalysis: null });

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
    set({ loadingAiInsights: true, aiInsightsError: null });

    try {
      console.log("[Analysis] Fetching AI insights for repo:", repoId);

      // Use AI instance with longer timeout
      const response = await axiosAIInstance.get(
        `/analyze/${repoId}/insights`,
        { timeout: 120000 } // 2 minutes timeout
      );

      if (response.data?.message === "Success" && response.data?.aiInsights) {
        // Update the full analysis with AI insights
        const currentAnalysis = get().fullAnalysis;
        const currentTimestamp = get().currentAnalysisTimestamp;

        if (currentAnalysis) {
          const updatedAnalysis = {
            ...currentAnalysis,
            aiInsights: response.data.aiInsights,
          };

          set({
            fullAnalysis: updatedAnalysis,
            loadingAiInsights: false,
            aiInsightsError: null,
          });

          // Update cache with AI insights if we have a timestamp
          if (currentTimestamp && !get().isViewingCached) {
            saveCachedAnalysis(repoId, updatedAnalysis, {
              healthScore: currentAnalysis.repoHealthScore.overallHealthScore,
              totalFiles: currentAnalysis.result.totalFiles,
            });
          }
        } else {
          set({ loadingAiInsights: false, aiInsightsError: null });
        }

        toast.success("AI insights loaded successfully", {
          description: "Advanced insights are now available",
        });

        console.log("[Analysis] AI insights loaded:", response.data.aiInsights);
        return response.data.aiInsights;
      } else {
        throw new Error("Invalid AI insights response");
      }
    } catch (error: any) {
      console.error("[Analysis] Failed to fetch AI insights:", error);

      let errorMessage = "Failed to fetch AI insights";
      let errorDescription = "";

      if (error.code === "ECONNABORTED") {
        errorMessage = "AI insights request timed out";
        errorDescription =
          "The analysis is taking longer than expected. Please try again in a few moments.";
      } else {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
        errorDescription = "Please check your connection and try again.";
      }

      toast.error(errorMessage, {
        description: errorDescription,
      });

      set({
        loadingAiInsights: false,
        aiInsightsError: errorMessage,
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

  // ==================== CACHE MANAGEMENT ====================

  /**
   * Load list of cached analyses for display
   */
  loadCachedAnalyses: (repoId: string) => {
    const list = getCachedAnalysesList(repoId);
    set({ cachedAnalysesList: list });
    console.log(`[Cache] Loaded ${list.length} cached analyses for ${repoId}`);
  },

  /**
   * Load a specific cached analysis by timestamp
   */
  loadSpecificCachedAnalysis: (repoId: string, timestamp: number) => {
    const cached = loadCachedAnalysis<FullRepoAnalysis>(repoId, timestamp);

    if (cached) {
      set({
        fullAnalysis: cached,
        currentAnalysisTimestamp: timestamp,
        isViewingCached: true,
      });

      const metadata = get().cachedAnalysesList.find(
        (m) => m.timestamp === timestamp
      );

      toast.success("Loaded cached analysis", {
        description: metadata ? `From ${metadata.label}` : undefined,
      });

      console.log(
        `[Cache] Loaded analysis from ${new Date(timestamp).toLocaleString()}`
      );
    } else {
      toast.error("Failed to load cached analysis", {
        description: "The cached data may have expired",
      });
    }
  },

  /**
   * Delete a specific cached analysis
   */
  deleteCachedAnalysis: (repoId: string, timestamp: number) => {
    clearCachedAnalysis(repoId, timestamp);
    get().loadCachedAnalyses(repoId);

    // If we're viewing the deleted analysis, clear it
    if (get().currentAnalysisTimestamp === timestamp) {
      set({
        fullAnalysis: null,
        currentAnalysisTimestamp: null,
        isViewingCached: false,
      });
    }

    toast.success("Cached analysis deleted");
  },

  /**
   * Clear all cached analyses for a repository
   */
  clearRepoCache: (repoId: string) => {
    clearAllCachedAnalyses(repoId);
    set({
      cachedAnalysesList: [],
      fullAnalysis: null,
      currentAnalysisTimestamp: null,
      isViewingCached: false,
    });
    toast.success("All cached analyses cleared");
  },

  // ==================== UTILITY ACTIONS ====================

  clearError: () => {
    set({ error: null });
  },

  clearAllData: () => {
    set({
      fullAnalysis: null,
      currentAnalysisTimestamp: null,
      isViewingCached: false,
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
