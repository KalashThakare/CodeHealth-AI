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
  FiClock,
  FiDollarSign,
  FiZap,
  FiBarChart2,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";
import "../analytics.css";

// Import analytics components
import HealthGaugeChart from "@/components/analytics/HealthGaugeChart";
import DistributionChart from "@/components/analytics/DistributionChart";
import RadarChart from "@/components/analytics/RadarChart";
import RiskFilesTable from "@/components/analytics/RiskFilesTable";
import BusinessMetrics from "@/components/analytics/BusinessMetrics";
import VelocityTrendChart from "@/components/analytics/VelocityTrendChart";
import TechnicalDebtChart from "@/components/analytics/TechnicalDebtChart";

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const repoId = params.repoId as string;

  const { fullAnalysis, loading, error, fetchFullAnalysis, exportToCSV } =
    useAnalysisStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (repoId) {
      fetchFullAnalysis(repoId);
    }
  }, [repoId, fetchFullAnalysis]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFullAnalysis(repoId);
    setIsRefreshing(false);
    toast.success("Analytics refreshed");
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

  const { result, commitAnalysis, repoHealthScore, distributions } =
    fullAnalysis;

  return (
    <div className="analytics-page">
      <DashboardNavbar currentTeam={null} />

      <div className="analytics-container">
        {/* Header Section with Actions */}
        <div className="analytics-header">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1
                className="font-title"
                style={{ color: "var(--analytics-text-primary)" }}
              >
                Repository Analytics
              </h1>
              <p style={{ color: "var(--analytics-text-secondary)" }}>
                Comprehensive insights and business metrics
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="analytics-btn-secondary"
              >
                <FiRefreshCw
                  className={isRefreshing ? "animate-spin" : ""}
                  size={16}
                />
                Refresh
              </button>
              <button onClick={handleExport} className="analytics-btn">
                <FiDownload size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Critical Metrics Overview - Hero Section */}
        <div className="analytics-grid-4 analytics-section">
          <MetricCard
            icon={<FiCheckCircle />}
            label="Health Score"
            value={`${repoHealthScore.overallHealthScore.toFixed(1)}%`}
            trend={repoHealthScore.healthRating}
            trendUp={repoHealthScore.overallHealthScore >= 70}
            color="var(--analytics-accent)"
          />
          <MetricCard
            icon={<FiCode />}
            label="Code Quality"
            value={`${result.avgMaintainabilityIndex.toFixed(1)}/100`}
            subtitle={`${result.totalFiles} files analyzed`}
            color="var(--analytics-info)"
          />
          <MetricCard
            icon={<FiActivity />}
            label="Complexity Score"
            value={result.avgCyclomaticComplexity.toFixed(1)}
            subtitle={`${result.totalLOC.toLocaleString()} LOC`}
            color="var(--analytics-warning)"
          />
          <MetricCard
            icon={<FiAlertTriangle />}
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
            totalLOC={result.totalLinesOfCode || 0}
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
              icon={<FiGitBranch />}
              label="Total Commits"
              value={commitAnalysis.totalCommits.toLocaleString()}
              subtitle={`${commitAnalysis.recentCommits30Days} in last 30 days`}
            />
            <CollaborationMetric
              icon={<FiUsers />}
              label="Contributors"
              value={commitAnalysis.contributorCount}
              subtitle={`Bus Factor: ${commitAnalysis.busFactor}`}
            />
            <CollaborationMetric
              icon={<FiActivity />}
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
          {React.cloneElement(icon as React.ReactElement, { size: 20 })}
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
        <span style={{ color: "var(--analytics-accent)" }}>
          {React.cloneElement(icon as React.ReactElement, { size: 18 })}
        </span>
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
