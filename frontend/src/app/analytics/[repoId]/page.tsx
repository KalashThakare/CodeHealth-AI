"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAnalysisStore } from "@/store/analysisStore";
import { DashboardNavbar } from "@/app/dashboard/_components/DashboardNavbar";
import { toast } from "sonner";
import {
  FiTrendingUp,
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
  FiTarget,
  FiDollarSign,
  FiHeart,
  FiChevronDown,
  FiPieChart,
  FiFileText,
  FiCpu,
  FiTool,
  FiClipboard,
} from "react-icons/fi";
import "./analytics.css";
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

import {
  EducationalTooltip,
  InsightCard,
  ScoreRing,
  StorySection,
  MetricExplainCard,
  WhatThisMeansCard,
  QuickStatsBar,
  HealthStatusBanner,
  getHealthStatus,
  getHealthExplanation,
} from "./_components";
import { Span } from "next/dist/trace";

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
    fetchFullAnalysis,
    fetchAiInsights,
    exportToCSV,
  } = useAnalysisStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    if (repoId) {
      fetchFullAnalysis(repoId, true);
    }
  }, [repoId, fetchFullAnalysis]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchFullAnalysis(repoId, false);
      toast.success("New analysis completed");
    } catch (error) {
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshAiInsights = async () => {
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
    }
  };

  const handleExport = (format: "csv" | "pdf" = "csv") => {
    if (format === "csv") {
      const csv = exportToCSV();
      if (csv) {
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics-${repoId}-${Date.now()}.csv`;
        a.click();
        toast.success("CSV exported successfully!");
      }
    } else {
      toast.info("Preparing PDF export...");
      setTimeout(() => {
        window.print();
      }, 300);
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

  const healthScore = repoHealthScore.overallHealthScore;

  return (
    <div className="analytics-page">
      <DashboardNavbar currentTeam={null} />

      <div className="analytics-container">
        <div
          className="analytics-hero"
          style={{ display: "flex", position: "relative" }}
        >
          <div
            className="analytics-hero-content"
            style={{ width: "50%", zIndex: 1 }}
          >
            <span className="analytics-hero-badge">
              <FiZap size={12} />
              AI-Powered Analysis
            </span>
            <h1>Your Code Health Story</h1>
            <p>
              We analyzed{" "}
              <strong>{result.totalFiles.toLocaleString()} files</strong>{" "}
              containing{" "}
              <strong>{result.totalLOC.toLocaleString()} lines of code</strong>.
              Here's what we found and what it means for your team.
            </p>
            <div style={{ marginTop: "16px" }}>
              <WhatThisMeansCard score={healthScore} type="health" />
            </div>
          </div>

          <div
            style={{
              width: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              gap: "24px",
            }}
          >
            <ScoreRing score={healthScore} size="2xl" showGrade />
            <div
              style={{
                maxWidth: "200px",
                padding: "16px 20px",
                borderLeft: "3px solid var(--accent-primary)",
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: "0 8px 8px 0",
              }}
            >
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  lineHeight: "1.6",
                  margin: 0,
                  fontStyle: "italic",
                }}
              >
                "Your overall code health score combines maintainability,
                complexity, documentation, and best practices into a single
                metric."
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <QuickStatsBar
            // lastAnalyzed={aiInsights?.timestamp || new Date().toISOString()}
            stats={[
              {
                label: "Files",
                value: result.totalFiles.toLocaleString(),
                icon: <FiFileText size={16} />,
              },
              {
                label: "LOC",
                value: result.totalLOC.toLocaleString(),
                icon: <FiCode size={16} />,
              },
              {
                label: "Commits",
                value: commitAnalysis.totalCommits.toLocaleString(),
                icon: <FiGitBranch size={16} />,
              },
              {
                label: "Contributors",
                value: commitAnalysis.contributorCount,
                icon: <FiUsers size={16} />,
              },
            ]}
          />
          <div className="flex items-center gap-2">
            <QuickStatsBar
            lastAnalyzed={aiInsights?.timestamp || new Date().toISOString()}
            stats={[]}
            />
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="analytics-btn-secondary !inline-flex gap-2 !items-center !justify-center"
            >
              <FiRefreshCw
                className={isRefreshing ? "animate-spin" : ""}
                size={16}
              />
              {isRefreshing ? (
                <span className="!truncate !text-nowrap">Analyzing...</span>
              ) : (
                <span className="!truncate !text-nowrap">Re-analyze</span>
              )}
            </button>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="analytics-btn flex gap-2 items-center"
              >
                <FiDownload size={16} />
                Export
                <FiChevronDown size={14} />
              </button>

              {showExportMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "4px",
                    background: "var(--analytics-card-bg)",
                    border: "1px solid var(--analytics-border)",
                    borderRadius: "8px",
                    padding: "4px",
                    minWidth: "140px",
                    zIndex: 50,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  }}
                  onMouseLeave={() => setShowExportMenu(false)}
                >
                  <button
                    onClick={() => {
                      handleExport("csv");
                      setShowExportMenu(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "8px 12px",
                      background: "transparent",
                      border: "none",
                      borderRadius: "6px",
                      color: "var(--analytics-text-primary)",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--analytics-card-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <FiFileText size={14} />
                    Export CSV
                  </button>
                  <button
                    onClick={() => {
                      handleExport("pdf");
                      setShowExportMenu(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "8px 12px",
                      background: "transparent",
                      border: "none",
                      borderRadius: "6px",
                      color: "var(--analytics-text-primary)",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--analytics-card-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <FiDownload size={14} />
                    Export PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <HealthStatusBanner
          healthScore={healthScore}
          strength={repoHealthScore.strengths[0] || ""}
          refactorCount={result.refactorPriorityFiles.length}
          avgComplexity={result.avgCyclomaticComplexity}
        />

        <StorySection
          icon={<FiBarChart2 size={18} />}
          title="The Big Picture"
          subtitle="Key metrics at a glance"
        >
          <div className="analytics-grid-4">
            <MetricExplainCard
              icon={<FiHeart size={18} />}
              title="Health Score"
              value={`${healthScore.toFixed(0)}%`}
              status={getHealthStatus(healthScore)}
              explanation={getHealthExplanation(healthScore)}
              glossaryKey="healthScore"
              trend={
                healthScore >= 70 ? "up" : healthScore >= 50 ? "stable" : "down"
              }
              recommendation={
                healthScore < 70
                  ? "Focus on high-priority refactoring targets"
                  : undefined
              }
            />
            <MetricExplainCard
              icon={<FiCode size={18} />}
              title="Maintainability"
              value={`${result.avgMaintainabilityIndex.toFixed(0)}/100`}
              status={getHealthStatus(result.avgMaintainabilityIndex)}
              trend={
                result.avgMaintainabilityIndex >= 65
                  ? "up"
                  : result.avgMaintainabilityIndex >= 50
                  ? "stable"
                  : "down"
              }
              explanation={
                result.avgMaintainabilityIndex >= 70
                  ? "Your code is well-structured and easy to modify"
                  : "Some code may be difficult to understand or change"
              }
              glossaryKey="maintainabilityIndex"
            />
            <MetricExplainCard
              icon={<FiActivity size={18} />}
              title="Complexity"
              value={result.avgCyclomaticComplexity.toFixed(1)}
              status={
                result.avgCyclomaticComplexity <= 10
                  ? "good"
                  : result.avgCyclomaticComplexity <= 20
                  ? "fair"
                  : result.avgCyclomaticComplexity <= 30
                  ? "poor"
                  : "critical"
              }
              trend={
                result.avgCyclomaticComplexity <= 15
                  ? "up"
                  : result.avgCyclomaticComplexity <= 25
                  ? "stable"
                  : "down"
              }
              explanation={
                result.avgCyclomaticComplexity <= 10
                  ? "Code logic is simple and easy to test"
                  : result.avgCyclomaticComplexity <= 20
                  ? "Average complexity - some functions may need simplification"
                  : "High complexity makes testing and debugging harder"
              }
              glossaryKey="cyclomaticComplexity"
            />
            <MetricExplainCard
              icon={<FiAlertTriangle size={18} />}
              title="Technical Debt"
              value={`${result.technicalDebtScore.toFixed(0)}%`}
              status={
                result.technicalDebtScore <= 15
                  ? "excellent"
                  : result.technicalDebtScore <= 30
                  ? "good"
                  : result.technicalDebtScore <= 50
                  ? "fair"
                  : "poor"
              }
              trend={
                result.technicalDebtScore <= 25
                  ? "up"
                  : result.technicalDebtScore <= 40
                  ? "stable"
                  : "down"
              }
              explanation={
                result.technicalDebtScore <= 30
                  ? "Low debt means faster feature development"
                  : "Accumulated shortcuts may slow down future work"
              }
              glossaryKey="technicalDebt"
              recommendation={
                result.technicalDebtScore > 30
                  ? `${result.refactorPriorityFiles.length} files need attention`
                  : undefined
              }
            />
          </div>
        </StorySection>

        <StorySection
          icon={<FiTarget size={18} />}
          title="Quality Dimensions"
          subtitle="Multi-dimensional view of code health"
        >
          <div className="analytics-grid-3">
            <div className="analytics-card">
              <div className="analytics-card-header">
                <h3 className="analytics-card-title flex items-center gap-2">
                  <EducationalTooltip termKey="healthScore">
                    <span>Overall Health</span>
                  </EducationalTooltip>
                </h3>
              </div>
              <HealthGaugeChart
                score={repoHealthScore.overallHealthScore}
                rating={repoHealthScore.healthRating}
              />
              <div className="mt-2 space-y-1">
                {repoHealthScore.strengths?.slice(0, 2).map((strength, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-1.5"
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--analytics-success)",
                    }}
                  >
                    <FiCheckCircle className="mt-0.5 flex-shrink-0" size={12} />
                    <span>{strength}</span>
                  </div>
                ))}
                {repoHealthScore.weaknesses
                  ?.slice(0, 2)
                  .map((weakness, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-1.5"
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--analytics-warning)",
                      }}
                    >
                      <FiTarget className="mt-0.5 flex-shrink-0" size={12} />
                      <span>{weakness}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="lg:col-span-2 h-full">
              <div className="analytics-card h-full flex flex-col">
                <div className="analytics-card-header">
                  <h3 className="analytics-card-title">Quality Radar</h3>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--analytics-text-secondary)",
                    }}
                  >
                    Each axis represents a quality dimension. Larger area =
                    better health.
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 flex-1">
                  <div className="flex-1 space-y-3 flex flex-col">
                    <div>
                      <h4
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "var(--analytics-text-primary)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Dimension Breakdown
                      </h4>
                      <div className="space-y-2">
                        <div
                          className="flex items-center justify-between p-2 rounded"
                          style={{ background: "var(--analytics-card-hover)" }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--analytics-text-secondary)",
                            }}
                          >
                            Code Quality
                          </span>
                          <span
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              color: "var(--analytics-accent)",
                            }}
                          >
                            {repoHealthScore.componentScores.codeQuality.toFixed(
                              0
                            )}
                            %
                          </span>
                        </div>
                        <div
                          className="flex items-center justify-between p-2 rounded"
                          style={{ background: "var(--analytics-card-hover)" }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--analytics-text-secondary)",
                            }}
                          >
                            Development Activity
                          </span>
                          <span
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              color: "var(--analytics-success)",
                            }}
                          >
                            {repoHealthScore.componentScores.developmentActivity.toFixed(
                              0
                            )}
                            %
                          </span>
                        </div>
                        <div
                          className="flex items-center justify-between p-2 rounded"
                          style={{ background: "var(--analytics-card-hover)" }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--analytics-text-secondary)",
                            }}
                          >
                            Bus Factor
                          </span>
                          <span
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              color:
                                repoHealthScore.componentScores.busFactor < 40
                                  ? "var(--analytics-warning)"
                                  : "var(--analytics-success)",
                            }}
                          >
                            {repoHealthScore.componentScores.busFactor.toFixed(
                              0
                            )}
                            %
                          </span>
                        </div>
                        <div
                          className="flex items-center justify-between p-2 rounded"
                          style={{ background: "var(--analytics-card-hover)" }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--analytics-text-secondary)",
                            }}
                          >
                            Community
                          </span>
                          <span
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              color:
                                repoHealthScore.componentScores.community < 40
                                  ? "var(--analytics-warning)"
                                  : "var(--analytics-accent)",
                            }}
                          >
                            {repoHealthScore.componentScores.community.toFixed(
                              0
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        paddingTop: "0.5rem",
                        borderTop: "1px solid var(--analytics-border)",
                        marginTop: "auto",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--analytics-text-tertiary)",
                          lineHeight: 1.5,
                        }}
                      >
                        <strong
                          style={{ color: "var(--analytics-text-secondary)" }}
                        >
                          Tip:
                        </strong>{" "}
                        Focus on improving dimensions with lower scores. A
                        balanced radar indicates well-rounded project health.
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <RadarChart
                      componentScores={repoHealthScore.componentScores}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </StorySection>

        <StorySection
          icon={<FiDollarSign size={18} />}
          title="Business Impact"
          subtitle="How code quality affects your bottom line"
        >
          <BusinessMetrics
            analysis={fullAnalysis}
            totalFiles={result.totalFiles || 0}
            totalLOC={result.totalLOC || 0}
          />
        </StorySection>

        <StorySection
          icon={<FiTrendingUp size={18} />}
          title="Trends & Patterns"
          subtitle="How your codebase is evolving"
        >
          <div style={{ display: "flex", gap: "24px", alignItems: "stretch" }}>
            <div className="analytics-card" style={{ width: "50%", margin: 0 }}>
              <div className="analytics-card-header">
                <h3 className="analytics-card-title flex items-center gap-2">
                  <FiTrendingUp
                    size={14}
                    style={{ color: "var(--analytics-accent)" }}
                  />
                  <EducationalTooltip termKey="velocity">
                    <span>Development Velocity</span>
                  </EducationalTooltip>
                </h3>
              </div>
              <VelocityTrendChart commitAnalysis={commitAnalysis} />
            </div>

            <div className="analytics-card" style={{ width: "50%", margin: 0 }}>
              <div className="analytics-card-header">
                <h3 className="analytics-card-title flex items-center gap-2">
                  <FiAlertTriangle
                    size={14}
                    style={{ color: "var(--analytics-warning)" }}
                  />
                  <EducationalTooltip termKey="technicalDebt">
                    <span>Technical Debt</span>
                  </EducationalTooltip>
                </h3>
              </div>
              <TechnicalDebtChart result={result} />
            </div>
          </div>
        </StorySection>

        <StorySection
          icon={<FiPieChart size={20} />}
          title="Code Distribution"
          subtitle="How your code quality is spread across files"
          expandable
          defaultExpanded={true}
        >
          <div className="analytics-grid-2" style={{ alignItems: "stretch" }}>
            <div
              className="analytics-card"
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "280px",
              }}
            >
              <div className="analytics-card-header">
                <h3 className="analytics-card-title">
                  <EducationalTooltip termKey="maintainabilityIndex">
                    <span>Maintainability Distribution</span>
                  </EducationalTooltip>
                </h3>
                <p
                  className="analytics-text-sm"
                  style={{ color: "var(--analytics-text-secondary)" }}
                >
                  Higher values = easier to maintain
                </p>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <DistributionChart
                  data={distributions.maintainabilityDistribution}
                  label="Maintainability Index"
                  color="var(--analytics-success)"
                  type="maintainability"
                />
              </div>
            </div>

            <div
              className="analytics-card"
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "280px",
              }}
            >
              <div className="analytics-card-header">
                <h3 className="analytics-card-title">
                  <EducationalTooltip termKey="cyclomaticComplexity">
                    <span>Complexity Distribution</span>
                  </EducationalTooltip>
                </h3>
                <p
                  className="analytics-text-sm"
                  style={{ color: "var(--analytics-text-secondary)" }}
                >
                  Lower values = simpler, more testable code
                </p>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <DistributionChart
                  data={distributions.complexityDistribution}
                  label="Cyclomatic Complexity"
                  color="var(--analytics-warning)"
                  type="complexity"
                />
              </div>
            </div>
          </div>
        </StorySection>

        <StorySection
          icon={<FiUsers size={20} />}
          title="Team Collaboration"
          subtitle="How your team works together on this codebase"
        >
          <div className="analytics-grid-3">
            <div className="analytics-card-compact">
              <div className="flex items-center gap-2 analytics-mb-1">
                <span style={{ color: "var(--analytics-accent)" }}>
                  <FiGitBranch size={18} />
                </span>
                <p
                  className="analytics-text-sm"
                  style={{ color: "var(--analytics-text-secondary)" }}
                >
                  Total Commits
                </p>
              </div>
              <p
                className="analytics-text-xl font-bold"
                style={{ color: "var(--analytics-text-primary)" }}
              >
                {commitAnalysis.totalCommits.toLocaleString()}
              </p>
              <p
                className="analytics-text-xs"
                style={{ color: "var(--analytics-text-tertiary)" }}
              >
                {commitAnalysis.recentCommits30Days} in last 30 days
              </p>
            </div>

            <div className="analytics-card-compact">
              <div className="flex items-center gap-2 analytics-mb-1">
                <span style={{ color: "var(--analytics-accent)" }}>
                  <FiUsers size={18} />
                </span>
                <p
                  className="analytics-text-sm"
                  style={{ color: "var(--analytics-text-secondary)" }}
                >
                  Contributors
                </p>
              </div>
              <p
                className="analytics-text-xl font-bold"
                style={{ color: "var(--analytics-text-primary)" }}
              >
                {commitAnalysis.contributorCount}
              </p>
              <p
                className="analytics-text-xs"
                style={{ color: "var(--analytics-text-tertiary)" }}
              >
                <EducationalTooltip termKey="busFactor">
                  <span>Bus Factor: {commitAnalysis.busFactor}</span>
                </EducationalTooltip>
              </p>
            </div>

            <div className="analytics-card-compact">
              <div className="flex items-center gap-2 analytics-mb-1">
                <span style={{ color: "var(--analytics-accent)" }}>
                  <FiActivity size={18} />
                </span>
                <p
                  className="analytics-text-sm"
                  style={{ color: "var(--analytics-text-secondary)" }}
                >
                  <EducationalTooltip termKey="velocity">
                    <span>Velocity Trend</span>
                  </EducationalTooltip>
                </p>
              </div>
              <p
                className="analytics-text-xl font-bold"
                style={{ color: "var(--analytics-text-primary)" }}
              >
                {commitAnalysis.velocity?.trend || "N/A"}
              </p>
              <p
                className="analytics-text-xs"
                style={{ color: "var(--analytics-text-tertiary)" }}
              >
                Consistency: {commitAnalysis.velocity?.consistency || "N/A"}
              </p>
            </div>
          </div>

          {Number(commitAnalysis.busFactor) <= 2 && (
            <div className="mt-4">
              <InsightCard
                type="warning"
                title="Knowledge Concentration Risk"
                message={`Only ${commitAnalysis.busFactor} developer(s) have significant knowledge of this codebase. Consider pair programming or code reviews to spread knowledge.`}
                action="Learn about bus factor"
              />
            </div>
          )}
        </StorySection>

        <StorySection
          icon={<FiTool size={20} />}
          title="Action Items"
          subtitle="Files that need your attention, prioritized by impact"
        >
          <div className="mb-4">
            <InsightCard
              type={
                result.refactorPriorityFiles.length > 10
                  ? "danger"
                  : result.refactorPriorityFiles.length > 5
                  ? "warning"
                  : "info"
              }
              title={`${result.refactorPriorityFiles.length} files need refactoring`}
              message={
                result.refactorPriorityFiles.length > 10
                  ? "Multiple files have accumulated technical debt. Consider dedicating a sprint to cleanup."
                  : result.refactorPriorityFiles.length > 5
                  ? "Some files would benefit from refactoring. Address highest-priority items first."
                  : "Your codebase is relatively clean. Address these files when you have time."
              }
              icon={<FiTarget size={20} />}
            />
          </div>
          <RiskFilesTable files={result.refactorPriorityFiles} />
        </StorySection>

        <StorySection
          icon={<FiCpu size={20} />}
          title="AI-Powered Insights"
          subtitle="Advanced recommendations powered by machine learning"
        >
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

                <div className="space-y-4">
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

          {!loadingAiInsights && !aiInsightsError && hasAIInsights && (
            <>
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
        </StorySection>

        <StorySection
          icon={<FiClipboard size={20} />}
          title="Executive Summary"
          subtitle="Key takeaways for decision makers"
        >
          <div className="analytics-grid-2">
            <div>
              <h4
                className="analytics-text-sm font-semibold analytics-mb-2 flex items-center gap-2"
                style={{ color: "var(--analytics-text-primary)" }}
              >
                <FiCheckCircle style={{ color: "var(--analytics-success)" }} />
                Key Strengths
              </h4>
              <ul className="space-y-2">
                {repoHealthScore.strengths?.map((strength, idx) => (
                  <li
                    key={idx}
                    className="analytics-text-sm flex items-start gap-2"
                    style={{ color: "var(--analytics-text-secondary)" }}
                  >
                    <span style={{ color: "var(--analytics-success)" }}>✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4
                className="analytics-text-sm font-semibold analytics-mb-2 flex items-center gap-2"
                style={{ color: "var(--analytics-text-primary)" }}
              >
                <FiTarget style={{ color: "var(--analytics-warning)" }} />
                Areas for Improvement
              </h4>
              <ul className="space-y-2">
                {repoHealthScore.weaknesses?.map((weakness, idx) => (
                  <li
                    key={idx}
                    className="analytics-text-sm flex items-start gap-2"
                    style={{ color: "var(--analytics-text-secondary)" }}
                  >
                    <span style={{ color: "var(--analytics-warning)" }}>→</span>
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className="mt-4 p-4 rounded-lg"
            style={{
              background: "var(--analytics-card-hover)",
              border: "1px solid var(--analytics-border)",
            }}
          >
            <p
              className="analytics-text-sm"
              style={{ color: "var(--analytics-text-secondary)" }}
            >
              <strong style={{ color: "var(--analytics-text-primary)" }}>
                Bottom Line:
              </strong>{" "}
              {healthScore >= 80
                ? "Your codebase is in excellent shape. Continue your current practices and address minor issues as they arise."
                : healthScore >= 60
                ? "Your codebase is healthy but has room for improvement. Consider addressing the top 3 high-priority items this quarter."
                : "Your codebase needs attention. We recommend dedicating time to address technical debt before it impacts development velocity."}
            </p>
          </div>
        </StorySection>
      </div>
    </div>
  );
}
