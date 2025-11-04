"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAnalysisStore } from "@/store/analysisStore";
import { DashboardNavbar } from "@/app/dashboard/_components/DashboardNavbar";
import { toast } from "sonner";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiCode,
  FiGitBranch,
  FiUsers,
  FiZap,
  FiBarChart2,
  FiDownload,
  FiRefreshCw,
  FiClock,
  FiTrash2,
  FiChevronDown,
} from "react-icons/fi";
import "./analytics.css";

// Import analytics components
import HealthGaugeChart from "@/components/analytics/HealthGaugeChart";
import DistributionChart from "@/components/analytics/DistributionChart";
import RadarChart from "@/components/analytics/RadarChart";
import RiskFilesTable from "@/components/analytics/RiskFilesTable";
import BusinessMetrics from "@/components/analytics/BusinessMetrics";
import VelocityTrendChart from "@/components/analytics/VelocityTrendChart";
import TechnicalDebtChart from "@/components/analytics/TechnicalDebtChart";
import RefactoringSuggestionsTable from "@/components/analytics/RefactoringSuggestionsTable";
import CodeSmellsChart from "@/components/analytics/CodeSmellsChart";
import TeamHealthDashboard from "@/components/analytics/TeamHealthDashboard";
import RiskMatrixD3 from "@/components/analytics/RiskMatrixD3";

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const repoId = params.repoId as string;

  const {
    fullAnalysis,
    loading,
    loadingAiInsights,
    error,
    aiInsightsError,
    cachedAnalysesList,
    isViewingCached,
    currentAnalysisTimestamp,
    fetchFullAnalysis,
    fetchAiInsights,
    loadCachedAnalyses,
    loadSpecificCachedAnalysis,
    deleteCachedAnalysis,
    clearRepoCache,
    exportToCSV,
  } = useAnalysisStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCacheDropdown, setShowCacheDropdown] = useState(false);

  useEffect(() => {
    if (repoId) {
      // Load cached analyses list
      loadCachedAnalyses(repoId);

      // Fetch analysis (will use cache if available)
      fetchFullAnalysis(repoId, true);
    }
  }, [repoId, fetchFullAnalysis, loadCachedAnalyses]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Force fresh fetch (bypass cache) - this triggers new analysis
      await fetchFullAnalysis(repoId, false);
      toast.success("New analysis completed and cached");
    } catch (error) {
      // Error already handled by store
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoadCachedAnalysis = (timestamp: number) => {
    loadSpecificCachedAnalysis(repoId, timestamp);
    setShowCacheDropdown(false);
  };

  const handleDeleteCache = (timestamp: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCachedAnalysis(repoId, timestamp);
  };

  const handleClearAllCache = () => {
    if (confirm("Are you sure you want to clear all cached analyses?")) {
      clearRepoCache(repoId);
      setShowCacheDropdown(false);
    }
  };

  const handleLoadLatest = () => {
    // Load the most recent cached analysis
    const mostRecent = cachedAnalysesList[0];
    if (mostRecent && mostRecent.timestamp !== currentAnalysisTimestamp) {
      loadSpecificCachedAnalysis(repoId, mostRecent.timestamp);
    }
    setShowCacheDropdown(false);
  };

  const handleRefreshAiInsights = async () => {
    // Show informative toast for longer operations
    const loadingToast = toast.loading("Loading AI insights...", {
      description: "This may take up to 2 minutes for complex analysis",
    });

    try {
      const aiInsights = await fetchAiInsights(repoId);
      if (aiInsights) {
        toast.dismiss(loadingToast);
        toast.success("AI insights loaded successfully", {
          description: "Advanced insights are now available",
        });
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);

      let errorMsg = "Failed to load AI insights";
      if (error.code === "ECONNABORTED") {
        errorMsg = "Request timed out - Analysis may still be processing";
      } else {
        errorMsg = error.message || errorMsg;
      }

      // Error state is already managed in the store
    }
  };

  const handleExport = () => {
    const csv = exportToCSV();
    if (csv) {
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${repoId}-${Date.now()}.csv`;
      a.click();
    }
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <DashboardNavbar currentTeam={null} />
        <div className="analytics-loading">
          <div className="text-center">
            <div
              className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-3"
              style={{
                borderColor: "var(--analytics-border)",
                borderTopColor: "var(--analytics-accent)",
              }}
            />
            <p style={{ color: "var(--analytics-text-secondary)" }}>
              Loading analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <DashboardNavbar currentTeam={null} />
        <div className="analytics-container">
          <div
            className="analytics-card text-center py-12"
            style={{
              borderColor: "var(--analytics-error)",
              background: "var(--color-card)",
            }}
          >
            <FiAlertTriangle
              className="mx-auto analytics-mb-2"
              size={40}
              style={{ color: "var(--analytics-error)" }}
            />
            <h2
              className="analytics-text-xl font-bold analytics-mb-1"
              style={{ color: "var(--analytics-text-primary)" }}
            >
              Failed to Load Analytics
            </h2>
            <p
              className="analytics-mb-3"
              style={{ color: "var(--analytics-text-secondary)" }}
            >
              {error}
            </p>
            <button className="analytics-btn" onClick={() => router.back()}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!fullAnalysis) {
    return (
      <div className="analytics-page">
        <DashboardNavbar currentTeam={null} />
        <div className="analytics-container">
          <div className="analytics-card text-center py-12">
            <FiBarChart2
              className="mx-auto analytics-mb-2"
              size={40}
              style={{ color: "var(--analytics-text-tertiary)" }}
            />
            <h2
              className="analytics-text-xl font-bold analytics-mb-1"
              style={{ color: "var(--analytics-text-primary)" }}
            >
              No Analytics Data
            </h2>
            <p
              className="analytics-mb-3"
              style={{ color: "var(--analytics-text-secondary)" }}
            >
              Run an analysis first to see detailed metrics.
            </p>
            <button
              className="analytics-btn"
              onClick={() => router.push("/gitProject")}
            >
              Start Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { result, commitAnalysis, repoHealthScore, distributions, aiInsights } =
    fullAnalysis;

  // Check if we have AI insights data - updated to match backend structure
  const hasAIInsights =
    aiInsights &&
    aiInsights.insights &&
    ((aiInsights.insights.refactoringSuggestions &&
      aiInsights.insights.refactoringSuggestions.length > 0) ||
      (aiInsights.insights.codeSmells &&
        aiInsights.insights.codeSmells.codeSmells &&
        aiInsights.insights.codeSmells.codeSmells.length > 0) ||
      (aiInsights.insights.quickWins &&
        aiInsights.insights.quickWins.quickWins &&
        aiInsights.insights.quickWins.quickWins.length > 0));

  console.log("AI Insights Check:", {
    hasAIInsights,
    aiInsights,
    refactoringSuggestions:
      aiInsights?.insights?.refactoringSuggestions?.length || 0,
    codeSmells: aiInsights?.insights?.codeSmells?.codeSmells?.length || 0,
    quickWins: aiInsights?.insights?.quickWins?.quickWins?.length || 0,
  });

  const currentCacheMetadata = cachedAnalysesList.find(
    (m) => m.timestamp === currentAnalysisTimestamp
  );

  return (
    <div className="analytics-page">
      <DashboardNavbar currentTeam={null} />

      <div className="analytics-container">
        {/* Header Section with Actions */}
        <div className="analytics-header">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h1
                  className="font-title"
                  style={{ color: "var(--analytics-text-primary)" }}
                >
                  Repository Analytics
                </h1>
                {isViewingCached && (
                  <span
                    className="analytics-badge"
                    style={{
                      background: "var(--analytics-info)",
                      color: "var(--analytics-bg)",
                      fontSize: "0.75rem",
                      padding: "0.25rem 0.5rem",
                    }}
                  >
                    Historical View
                  </span>
                )}
              </div>
              <p style={{ color: "var(--analytics-text-secondary)" }}>
                Comprehensive insights and business metrics{" "}
                {hasAIInsights && "with AI-powered recommendations"}
                {currentCacheMetadata && (
                  <span className="ml-2 analytics-text-xs">
                    • Analysis from {currentCacheMetadata.label}
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {/* Cache History Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowCacheDropdown(!showCacheDropdown)}
                  className="analytics-btn-secondary flex items-center gap-2"
                >
                  <FiClock size={16} />
                  History ({cachedAnalysesList.length})
                  <FiChevronDown
                    size={14}
                    className={`transition-transform ${
                      showCacheDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showCacheDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-80 rounded-lg shadow-xl z-50"
                    style={{
                      background: "var(--analytics-card)",
                      border: "1px solid var(--analytics-border)",
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    <div
                      className="p-3 border-b"
                      style={{ borderColor: "var(--analytics-border)" }}
                    >
                      <h4
                        className="analytics-text-sm font-semibold"
                        style={{ color: "var(--analytics-text-primary)" }}
                      >
                        Analysis History (Last 2)
                      </h4>
                      <p
                        className="analytics-text-xs mt-1"
                        style={{ color: "var(--analytics-text-tertiary)" }}
                      >
                        Cached for 24 hours
                      </p>
                    </div>

                    {cachedAnalysesList.length === 0 ? (
                      <div className="p-4 text-center">
                        <p
                          className="analytics-text-sm"
                          style={{ color: "var(--analytics-text-secondary)" }}
                        >
                          No cached analyses available. Click Refresh to run a
                          new analysis.
                        </p>
                      </div>
                    ) : (
                      <>
                        {!isViewingCached && (
                          <div
                            className="px-3 py-2 border-b"
                            style={{
                              background: "var(--analytics-card-hover)",
                              borderColor: "var(--analytics-border)",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p
                                  className="analytics-text-sm font-medium"
                                  style={{
                                    color: "var(--analytics-text-primary)",
                                  }}
                                >
                                  Current (Latest)
                                </p>
                                <p
                                  className="analytics-text-xs"
                                  style={{
                                    color: "var(--analytics-text-secondary)",
                                  }}
                                >
                                  {currentCacheMetadata?.label || "Just now"}
                                </p>
                              </div>
                              <span
                                className="analytics-badge analytics-badge-success"
                                style={{ fontSize: "0.625rem" }}
                              >
                                Active
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="py-1">
                          {cachedAnalysesList.map((cache) => {
                            const isCurrent =
                              cache.timestamp === currentAnalysisTimestamp;

                            return (
                              <div
                                key={cache.timestamp}
                                className={`px-3 py-2 hover:bg-opacity-50 cursor-pointer transition-colors ${
                                  isCurrent ? "bg-opacity-20" : ""
                                }`}
                                style={{
                                  background: isCurrent
                                    ? "var(--analytics-accent)"
                                    : "transparent",
                                }}
                                onClick={() =>
                                  !isCurrent &&
                                  handleLoadCachedAnalysis(cache.timestamp)
                                }
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p
                                        className="analytics-text-sm font-medium truncate"
                                        style={{
                                          color:
                                            "var(--analytics-text-primary)",
                                        }}
                                      >
                                        {cache.label}
                                      </p>
                                      {isCurrent && isViewingCached && (
                                        <span
                                          className="analytics-badge"
                                          style={{
                                            background:
                                              "var(--analytics-success)",
                                            color: "var(--analytics-bg)",
                                            fontSize: "0.625rem",
                                            padding: "0.125rem 0.375rem",
                                          }}
                                        >
                                          Viewing
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 analytics-text-xs">
                                      <span
                                        style={{
                                          color:
                                            "var(--analytics-text-tertiary)",
                                        }}
                                      >
                                        Health: {cache.healthScore.toFixed(1)}%
                                      </span>
                                      <span
                                        style={{
                                          color:
                                            "var(--analytics-text-tertiary)",
                                        }}
                                      >
                                        {cache.totalFiles} files
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) =>
                                      handleDeleteCache(cache.timestamp, e)
                                    }
                                    className="p-1 rounded hover:bg-red-500 hover:bg-opacity-20 transition-colors"
                                    title="Delete cached analysis"
                                  >
                                    <FiTrash2
                                      size={14}
                                      style={{
                                        color: "var(--analytics-error)",
                                      }}
                                    />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div
                          className="p-2 border-t"
                          style={{ borderColor: "var(--analytics-border)" }}
                        >
                          {cachedAnalysesList.length > 1 && isViewingCached && (
                            <button
                              onClick={handleLoadLatest}
                              className="w-full analytics-btn-secondary analytics-text-xs py-1.5 mb-2"
                            >
                              Switch to Latest Analysis
                            </button>
                          )}
                          <button
                            onClick={handleClearAllCache}
                            className="w-full analytics-text-xs py-1.5 px-3 rounded"
                            style={{
                              background: "var(--analytics-error)",
                              color: "white",
                            }}
                          >
                            Clear All History
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="analytics-btn-secondary flex gap-2 items-center justify-center"
              >
                <FiRefreshCw
                  className={isRefreshing ? "animate-spin" : ""}
                  size={16}
                />
                {isRefreshing ? "Analyzing..." : "Run New Analysis"}
              </button>
              <button onClick={handleExport} className="analytics-btn">
                <FiDownload size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Cache Info Banner (when viewing historical analysis) */}
        {isViewingCached && currentCacheMetadata && (
          <div
            className="analytics-card analytics-section"
            style={{
              background: "var(--analytics-info)",
              borderColor: "var(--analytics-info)",
              color: "var(--analytics-bg)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiClock size={20} />
                <div>
                  <p className="font-semibold">Viewing Historical Analysis</p>
                  <p className="analytics-text-sm opacity-90">
                    From {currentCacheMetadata.label} • Health Score:{" "}
                    {currentCacheMetadata.healthScore.toFixed(1)}% •{" "}
                    {currentCacheMetadata.totalFiles} files
                  </p>
                </div>
              </div>
              <button
                onClick={handleLoadLatest}
                className="px-4 py-2 rounded font-medium"
                style={{
                  background: "var(--analytics-bg)",
                  color: "var(--analytics-info)",
                }}
              >
                Switch to Latest
              </button>
            </div>
          </div>
        )}

        {/* Critical Metrics Overview - Hero Section */}
        <div className="analytics-grid-4 analytics-section">
          <MetricCard
            icon={<FiCheckCircle size={20} />}
            label="Health Score"
            value={`${repoHealthScore.overallHealthScore.toFixed(1)}%`}
            trend={repoHealthScore.healthRating}
            trendUp={repoHealthScore.overallHealthScore >= 70}
            color="var(--analytics-accent)"
          />
          <MetricCard
            icon={<FiCode size={20} />}
            label="Code Quality"
            value={`${result.avgMaintainabilityIndex.toFixed(1)}/100`}
            subtitle={`${result.totalFiles} files analyzed`}
            color="var(--analytics-info)"
          />
          <MetricCard
            icon={<FiActivity size={20} />}
            label="Complexity Score"
            value={result.avgCyclomaticComplexity.toFixed(1)}
            subtitle={`${result.totalLOC.toLocaleString()} LOC`}
            color="var(--analytics-warning)"
          />
          <MetricCard
            icon={<FiAlertTriangle size={20} />}
            label="Technical Debt"
            value={`${result.technicalDebtScore.toFixed(1)}%`}
            subtitle={`${result.refactorPriorityFiles.length} files at risk`}
            color="var(--analytics-error)"
          />
        </div>

        {/* Primary Analytics Row - Most Impactful */}
        <div className="analytics-grid-3 analytics-section">
          {/* Health Gauge - Center of Attention */}
          <div>
            <div className="analytics-card">
              <div className="analytics-card-header">
                <h3 className="analytics-card-title">Repository Health</h3>
              </div>
              <HealthGaugeChart
                score={repoHealthScore.overallHealthScore}
                rating={repoHealthScore.healthRating}
              />
              <div className="mt-3 space-y-1.5">
                {repoHealthScore.strengths?.slice(0, 2).map((strength, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 analytics-text-sm"
                    style={{ color: "var(--analytics-success)" }}
                  >
                    <FiCheckCircle className="mt-0.5 flex-shrink-0" size={14} />
                    <span>{strength}</span>
                  </div>
                ))}
                {repoHealthScore.weaknesses
                  ?.slice(0, 2)
                  .map((weakness, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 analytics-text-sm"
                      style={{ color: "var(--analytics-error)" }}
                    >
                      <FiAlertTriangle
                        className="mt-0.5 flex-shrink-0"
                        size={14}
                      />
                      <span>{weakness}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Radar Chart - Comprehensive View */}
          <div className="lg:col-span-2">
            <div className="analytics-card">
              <div className="analytics-card-header">
                <h3 className="analytics-card-title">Quality Dimensions</h3>
              </div>
              <RadarChart componentScores={repoHealthScore.componentScores} />
            </div>
          </div>
        </div>

        {/* Business Impact Section */}
        <div className="analytics-section">
          <h2 className="analytics-section-title font-title">
            Business Impact Analysis
          </h2>
          <BusinessMetrics
            analysis={fullAnalysis}
            totalFiles={result.totalFiles || 0}
            totalLOC={result.totalLOC || 0}
          />
        </div>

        {/* Development Velocity & Technical Debt */}
        <div className="analytics-grid-2 analytics-section">
          <div className="analytics-card">
            <div className="analytics-card-header">
              <h3 className="analytics-card-title flex items-center gap-2">
                <FiTrendingUp style={{ color: "var(--analytics-accent)" }} />
                Development Velocity
              </h3>
            </div>
            <VelocityTrendChart commitAnalysis={commitAnalysis} />
          </div>

          <div className="analytics-card">
            <div className="analytics-card-header">
              <h3 className="analytics-card-title flex items-center gap-2">
                <FiAlertTriangle style={{ color: "var(--analytics-error)" }} />
                Technical Debt Breakdown
              </h3>
            </div>
            <TechnicalDebtChart result={result} />
          </div>
        </div>

        {/* Distribution Charts */}
        <div className="analytics-grid-2 analytics-section">
          <div className="analytics-card">
            <div className="analytics-card-header">
              <h3 className="analytics-card-title">
                Maintainability Distribution
              </h3>
            </div>
            <DistributionChart
              data={distributions.maintainabilityDistribution}
              label="Maintainability Index"
              color="var(--analytics-success)"
            />
          </div>

          <div className="analytics-card">
            <div className="analytics-card-header">
              <h3 className="analytics-card-title">Complexity Distribution</h3>
            </div>
            <DistributionChart
              data={distributions.complexityDistribution}
              label="Cyclomatic Complexity"
              color="var(--analytics-warning)"
            />
          </div>
        </div>

        {/* Team Collaboration Insights */}
        <div className="analytics-card analytics-section">
          <div className="analytics-card-header">
            <h3 className="analytics-card-title flex items-center gap-2">
              <FiUsers style={{ color: "var(--analytics-accent)" }} />
              Team Collaboration Insights
            </h3>
          </div>
          <div className="analytics-grid-3 mt-3">
            <CollaborationMetric
              icon={<FiGitBranch size={18} />}
              label="Total Commits"
              value={commitAnalysis.totalCommits.toLocaleString()}
              subtitle={`${commitAnalysis.recentCommits30Days} in last 30 days`}
            />
            <CollaborationMetric
              icon={<FiUsers size={18} />}
              label="Contributors"
              value={commitAnalysis.contributorCount}
              subtitle={`Bus Factor: ${commitAnalysis.busFactor}`}
            />
            <CollaborationMetric
              icon={<FiActivity size={18} />}
              label="Velocity Trend"
              value={commitAnalysis.velocity?.trend || "N/A"}
              subtitle={`Consistency: ${
                commitAnalysis.velocity?.consistency || "N/A"
              }`}
            />
          </div>
        </div>

        {/* High-Risk Files Table - Action Required */}
        <div className="analytics-card analytics-section">
          <div className="flex items-center justify-between analytics-mb-2">
            <h3 className="analytics-card-title flex items-center gap-2">
              <FiAlertTriangle style={{ color: "var(--analytics-error)" }} />
              High-Priority Refactoring Targets
            </h3>
            <span className="analytics-badge analytics-badge-error">
              {result.refactorPriorityFiles.length} files need attention
            </span>
          </div>
          <RiskFilesTable files={result.refactorPriorityFiles} />
        </div>

        {/* AI-Powered Insights Section - Updated with loading states */}
        <div className="analytics-section">
          <div className="flex items-center justify-between analytics-mb-3">
            <div>
              <h2 className="analytics-section-title font-title">
                AI-Powered Insights
              </h2>
              <p style={{ color: "var(--analytics-text-secondary)" }}>
                Advanced refactoring recommendations and code health analysis
              </p>
            </div>
          </div>

          {/* Loading State */}
          {loadingAiInsights && (
            <div className="analytics-card analytics-section">
              <div className="py-8">
                <div className="text-center mb-6">
                  <div
                    className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-3"
                    style={{
                      borderColor: "var(--analytics-border)",
                      borderTopColor: "var(--analytics-accent)",
                    }}
                  />
                  <p
                    className="analytics-text-sm font-medium"
                    style={{ color: "var(--analytics-text-primary)" }}
                  >
                    Loading AI insights...
                  </p>
                  <p
                    className="analytics-text-xs mt-1"
                    style={{ color: "var(--analytics-text-secondary)" }}
                  >
                    This may take a few moments
                  </p>
                </div>

                {/* Skeleton Loaders */}
                <div className="space-y-4">
                  {/* Refactoring Suggestions Skeleton */}
                  <div className="analytics-card-compact">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-8 h-8 rounded animate-pulse"
                        style={{ background: "var(--analytics-border)" }}
                      />
                      <div className="flex-1">
                        <div
                          className="h-4 w-48 rounded animate-pulse mb-2"
                          style={{ background: "var(--analytics-border)" }}
                        />
                        <div
                          className="h-3 w-64 rounded animate-pulse"
                          style={{ background: "var(--analytics-border)" }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-16 rounded animate-pulse"
                          style={{ background: "var(--analytics-border)" }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Code Smells Skeleton */}
                  <div className="analytics-card-compact">
                    <div
                      className="h-4 w-40 rounded animate-pulse mb-4"
                      style={{ background: "var(--analytics-border)" }}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-24 rounded animate-pulse"
                          style={{ background: "var(--analytics-border)" }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Quick Wins Skeleton */}
                  <div className="analytics-card-compact">
                    <div
                      className="h-4 w-32 rounded animate-pulse mb-4"
                      style={{ background: "var(--analytics-border)" }}
                    />
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-20 rounded animate-pulse"
                          style={{ background: "var(--analytics-border)" }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {!loadingAiInsights && aiInsightsError && (
            <div className="analytics-card analytics-section">
              <div className="text-center py-8">
                <FiAlertTriangle
                  className="mx-auto analytics-mb-2"
                  size={40}
                  style={{ color: "var(--analytics-error)" }}
                />
                <h3
                  className="analytics-text-lg font-semibold analytics-mb-1"
                  style={{ color: "var(--analytics-text-primary)" }}
                >
                  Failed to Load AI Insights
                </h3>
                <p
                  className="analytics-text-sm analytics-mb-3"
                  style={{ color: "var(--analytics-text-secondary)" }}
                >
                  {aiInsightsError}
                </p>
                <button
                  onClick={handleRefreshAiInsights}
                  className="analytics-btn"
                >
                  <FiRefreshCw size={16} />
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* AI Insights Content */}
          {!loadingAiInsights && !aiInsightsError && hasAIInsights && (
            <>
              {/* Refactoring Suggestions */}
              {aiInsights?.insights?.refactoringSuggestions &&
                aiInsights.insights.refactoringSuggestions.length > 0 && (
                  <div className="analytics-card analytics-section">
                    <div className="analytics-card-header">
                      <h3 className="analytics-card-title">
                        Refactoring Recommendations
                      </h3>
                      <p
                        className="analytics-text-sm mt-1"
                        style={{ color: "var(--analytics-text-secondary)" }}
                      >
                        Prioritized refactoring suggestions with business impact
                        analysis
                      </p>
                    </div>

                    <RefactoringSuggestionsTable
                      suggestions={aiInsights.insights.refactoringSuggestions}
                    />

                    <div className="mt-4">
                      <RiskMatrixD3
                        suggestions={aiInsights.insights.refactoringSuggestions}
                      />
                    </div>
                  </div>
                )}

              {/* Code Smells */}
              {aiInsights?.insights?.codeSmells?.codeSmells &&
                aiInsights.insights.codeSmells.codeSmells.length > 0 && (
                  <div className="analytics-card analytics-section">
                    <div className="analytics-card-header">
                      <h3 className="analytics-card-title">
                        Code Smells Analysis
                      </h3>
                      <p
                        className="analytics-text-sm mt-1"
                        style={{ color: "var(--analytics-text-secondary)" }}
                      >
                        Detected code quality issues and anti-patterns
                      </p>
                    </div>

                    <CodeSmellsChart
                      codeSmells={aiInsights.insights.codeSmells.codeSmells}
                      overallHealth={
                        aiInsights.insights.codeSmells.overallCodeHealth
                      }
                    />
                  </div>
                )}

              {/* Quick Wins & Team Health */}
              {aiInsights?.insights?.quickWins?.quickWins &&
                aiInsights.insights.quickWins.quickWins.length > 0 && (
                  <div className="analytics-card analytics-section">
                    <div className="analytics-card-header">
                      <h3 className="analytics-card-title">
                        Quick Wins & Team Health
                      </h3>
                      <p
                        className="analytics-text-sm mt-1"
                        style={{ color: "var(--analytics-text-secondary)" }}
                      >
                        Low-effort, high-impact improvements and team health
                        indicators
                      </p>
                    </div>

                    <TeamHealthDashboard
                      teamHealthImpacts={aiInsights.insights.refactoringSuggestions.map(
                        (s) => s.teamHealthImpact
                      )}
                      quickWins={aiInsights.insights.quickWins.quickWins}
                    />
                  </div>
                )}
            </>
          )}

          {/* Empty State - No AI Insights Available */}
          {!loadingAiInsights && !aiInsightsError && !hasAIInsights && (
            <div className="analytics-card analytics-section">
              <div className="text-center py-8">
                <FiZap
                  className="mx-auto analytics-mb-2"
                  size={40}
                  style={{ color: "var(--analytics-text-tertiary)" }}
                />
                <h3
                  className="analytics-text-lg font-semibold analytics-mb-1"
                  style={{ color: "var(--analytics-text-primary)" }}
                >
                  AI Insights Not Loaded
                </h3>

                {!loadingAiInsights && (
                  <div className="w-full flex items-center justify-center my-4">
                    <button
                      onClick={handleRefreshAiInsights}
                      className="analytics-btn-secondary flex items-center justify-center gap-4"
                      disabled={loadingAiInsights}
                    >
                      <FiRefreshCw size={20} />
                      Load AI Insights
                    </button>
                  </div>
                )}

                <p
                  className="analytics-text-sm analytics-mb-3"
                  style={{ color: "var(--analytics-text-secondary)" }}
                >
                  Click the button above to load AI-powered insights including
                  refactoring suggestions, code smells, and quick wins.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Executive Summary Footer */}
        <div
          className="analytics-card analytics-section"
          style={{
            background: "var(--analytics-card-hover)",
            borderColor: "var(--analytics-accent)",
          }}
        >
          <div className="analytics-card-header">
            <h3 className="analytics-card-title flex items-center gap-2">
              <FiZap style={{ color: "var(--analytics-accent)" }} />
              Executive Summary
            </h3>
          </div>
          <div className="analytics-grid-2 mt-3">
            <div>
              <h4
                className="analytics-text-sm font-semibold analytics-mb-2"
                style={{ color: "var(--analytics-text-primary)" }}
              >
                Key Strengths
              </h4>
              <ul className="space-y-1">
                {repoHealthScore.strengths?.map((strength, idx) => (
                  <li
                    key={idx}
                    className="analytics-text-sm flex items-start gap-2"
                    style={{ color: "var(--analytics-text-secondary)" }}
                  >
                    <FiCheckCircle
                      className="mt-0.5 flex-shrink-0"
                      size={14}
                      style={{ color: "var(--terminal-success)" }}
                    />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4
                className="analytics-text-sm font-semibold analytics-mb-2"
                style={{ color: "var(--analytics-text-primary)" }}
              >
                Areas for Improvement
              </h4>
              <ul className="space-y-1">
                {repoHealthScore.weaknesses?.map((weakness, idx) => (
                  <li
                    key={idx}
                    className="analytics-text-sm flex items-start gap-2"
                    style={{ color: "var(--analytics-text-secondary)" }}
                  >
                    <FiAlertTriangle
                      className="mt-0.5 flex-shrink-0"
                      size={12}
                      style={{ color: "var(--analytics-warning)" }}
                    />
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  color: string;
}

function MetricCard({
  icon,
  label,
  value,
  subtitle,
  trend,
  trendUp,
  color,
}: MetricCardProps) {
  return (
    <div className="analytics-metric-card">
      <div className="flex items-start justify-between analytics-mb-1">
        <div
          className="analytics-icon"
          style={{ background: `${color}20`, color }}
        >
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1">
            {trendUp ? (
              <FiTrendingUp
                size={14}
                style={{ color: "var(--analytics-success)" }}
              />
            ) : (
              <FiTrendingDown
                size={14}
                style={{ color: "var(--analytics-error)" }}
              />
            )}
            <span
              className="analytics-text-xs font-medium"
              style={{
                color: trendUp
                  ? "var(--analytics-success)"
                  : "var(--analytics-error)",
              }}
            >
              {trend}
            </span>
          </div>
        )}
      </div>
      <p className="analytics-metric-label">{label}</p>
      <p className="analytics-metric-value">{value}</p>
      {subtitle && (
        <p
          className="analytics-text-xs"
          style={{ color: "var(--analytics-text-tertiary)" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

interface CollaborationMetricProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle: string;
}

function CollaborationMetric({
  icon,
  label,
  value,
  subtitle,
}: CollaborationMetricProps) {
  return (
    <div className="analytics-card-compact">
      <div className="flex items-center gap-2 analytics-mb-1">
        <span style={{ color: "var(--analytics-accent)" }}>{icon}</span>
        <p
          className="analytics-text-sm"
          style={{ color: "var(--analytics-text-secondary)" }}
        >
          {label}
        </p>
      </div>
      <p
        className="analytics-text-xl font-bold"
        style={{ color: "var(--analytics-text-primary)" }}
      >
        {value}
      </p>
      <p
        className="analytics-text-xs"
        style={{ color: "var(--analytics-text-tertiary)" }}
      >
        {subtitle}
      </p>
    </div>
  );
}
