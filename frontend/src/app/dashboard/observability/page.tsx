"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  LayoutGrid,
  GitPullRequest,
  Users,
  AlertTriangle,
  BarChart3,
  Calendar,
  RefreshCw,
  GitCommit,
  Zap,
  Target,
  FileCode,
  PieChart,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { useGitHubStore } from "@/store/githubStore";
import { useObservabilityStore } from "@/store/observabilityStore";
import "./observability.css";

const NAV_SECTIONS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "activity", label: "Push Activity", icon: Activity },
  { id: "heatmap", label: "Activity Heatmap", icon: Calendar },
  { id: "velocity", label: "PR Velocity", icon: Zap },
  { id: "stale", label: "Stale PRs", icon: AlertTriangle },
  { id: "reviewers", label: "Reviewers", icon: Users },
  { id: "distribution", label: "PR Distribution", icon: PieChart },
];

const TIME_RANGES = [
  { value: 7, label: "Last 7 days" },
  { value: 14, label: "Last 14 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
];

const DAYS_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const CHART_COLORS = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#06b6d4",
  gray: "#6b7280",
};

const PIE_COLORS = ["#10b981", "#22c55e", "#f59e0b", "#f97316", "#ef4444"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="obs-recharts-tooltip">
      <p className="obs-tooltip-label">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p
          key={index}
          className="obs-tooltip-value"
          style={{ color: entry.color }}
        >
          {entry.name}:{" "}
          {typeof entry.value === "number"
            ? entry.value.toFixed(1)
            : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function ObservabilityPage() {
  const searchParams = useSearchParams();
  const repoIdParam = searchParams.get("repoId");
  const [expandedRepo, setExpandedRepo] = useState(false);
  const [expandedTime, setExpandedTime] = useState(false);

  const { repositories, selectedRepo, selectRepository, fetchGitHubRepos } =
    useGitHubStore();

  const {
    trendData,
    pushActivityData,
    heatmapData,
    prVelocityData,
    stalePRsData,
    reviewerData,
    prDistributionData,
    loading,
    error,
    timeRange,
    activeSection,
    setTimeRange,
    setActiveSection,
    fetchAllData,
  } = useObservabilityStore();

  const currentRepoId = repoIdParam || selectedRepo?.repoId;

  useEffect(() => {
    if (repositories.length === 0) {
      fetchGitHubRepos();
    }
  }, [repositories.length, fetchGitHubRepos]);

  useEffect(() => {
    if (repoIdParam && repositories.length > 0) {
      const repo = repositories.find((r) => String(r.repoId) === repoIdParam);
      if (repo && repo.repoId !== selectedRepo?.repoId) {
        selectRepository(repo);
      }
    }
  }, [repoIdParam, repositories, selectedRepo, selectRepository]);

  useEffect(() => {
    if (currentRepoId) {
      fetchAllData(String(currentRepoId));
    }
  }, [currentRepoId, fetchAllData]);

  const handleRefresh = () => {
    if (currentRepoId) {
      fetchAllData(String(currentRepoId));
    }
  };

  const handleRepoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const repo = repositories.find((r) => String(r.repoId) === e.target.value);
    if (repo) {
      selectRepository(repo);
    }
  };

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(parseInt(e.target.value));
  };

  if (!currentRepoId) {
    return (
      <div className="observability-page">
        <div className="observability-container">
          <div className="obs-no-repo">
            <BarChart3 />
            <h2>Select a Repository</h2>
            <p>
              Choose a repository from the dropdown to view observability
              metrics and insights.
            </p>
            {repositories.length > 0 && (
              <select
                className="obs-select"
                style={{ marginTop: "1rem" }}
                onChange={handleRepoChange}
              >
                <option value="">Select repository...</option>
                {repositories.map((repo: any) => (
                  <option key={repo.repoId} value={repo.repoId}>
                    {repo.repoName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="observability-page">
      <div className="observability-header">
        <div className="observability-container">
          <div className="observability-header-content">
            <h1>Observability</h1>
            <div className="observability-controls">
              <div className="obs-filter-group">
                <button
                  className={`obs-filter-btn ${expandedRepo ? "active" : ""}`}
                  onClick={() => setExpandedRepo(!expandedRepo)}
                >
                  <span>{selectedRepo?.repoName || "Select Repository"}</span>
                  <ChevronDown
                    size={16}
                    style={{
                      transition: "transform 0.2s ease",
                      transform: expandedRepo
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  />
                </button>
                {expandedRepo && (
                  <div className="obs-filter-dropdown">
                    {repositories.map((repo) => (
                      <div
                        key={repo.repoId}
                        className="obs-dropdown-item"
                        onClick={() => {
                          selectRepository(repo);
                          setExpandedRepo(false);
                        }}
                      >
                        {repo.repoName}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="obs-filter-group">
                <button
                  className={`obs-filter-btn ${expandedTime ? "active" : ""}`}
                  onClick={() => setExpandedTime(!expandedTime)}
                >
                  <span>
                    {TIME_RANGES.find((r) => r.value === timeRange)?.label ||
                      "Select Time Range"}
                  </span>
                  <ChevronDown
                    size={16}
                    style={{
                      transition: "transform 0.2s ease",
                      transform: expandedTime
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  />
                </button>
                {expandedTime && (
                  <div className="obs-filter-dropdown">
                    {TIME_RANGES.map((range) => (
                      <div
                        key={range.value}
                        className="obs-dropdown-item"
                        onClick={() => {
                          setTimeRange(range.value);
                          setExpandedTime(false);
                        }}
                      >
                        {range.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="observability-container">
        <div className="obs-main">
          <aside className="obs-sidebar">
            <nav>
              {NAV_SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    className={`obs-nav-btn ${
                      activeSection === section.id ? "active" : ""
                    }`}
                    onClick={() => setActiveSection(section.id)}
                    type="button"
                  >
                    <Icon />
                    <span>{section.label}</span>
                    {section.id === "stale" &&
                      stalePRsData &&
                      stalePRsData.count > 0 && (
                        <span className="obs-nav-badge">
                          {stalePRsData.count}
                        </span>
                      )}
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="obs-content">
            {loading && !trendData ? (
              <LoadingSkeleton />
            ) : error ? (
              <ErrorState error={error} onRetry={handleRefresh} />
            ) : (
              <>
                <NoDataWarning
                  trendData={trendData}
                  pushActivityData={pushActivityData}
                  prVelocityData={prVelocityData}
                />

                {activeSection === "overview" && (
                  <>
                    <SummaryMetrics
                      trendData={trendData}
                      pushActivityData={pushActivityData}
                      prVelocityData={prVelocityData}
                    />
                    <HealthTimelineChart trendData={trendData} />
                    <RiskTimelineChart trendData={trendData} />
                    <VelocityOverviewChart prVelocityData={prVelocityData} />
                  </>
                )}

                {activeSection === "activity" && (
                  <>
                    <SummaryMetrics
                      trendData={trendData}
                      pushActivityData={pushActivityData}
                      prVelocityData={prVelocityData}
                    />
                    <PushActivitySection data={pushActivityData} />
                  </>
                )}

                {activeSection === "heatmap" && (
                  <ActivityHeatmapSection data={heatmapData} />
                )}

                {activeSection === "velocity" && (
                  <PRVelocitySection data={prVelocityData} />
                )}

                {activeSection === "stale" && (
                  <StalePRsSection data={stalePRsData} />
                )}

                {activeSection === "reviewers" && (
                  <ReviewerPerformanceSection data={reviewerData} />
                )}

                {activeSection === "distribution" && (
                  <PRDistributionSection data={prDistributionData} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NoDataWarning({
  trendData,
  pushActivityData,
  prVelocityData,
}: {
  trendData: any;
  pushActivityData: any;
  prVelocityData: any;
}) {
  const hasNoData =
    !trendData?.quickSummary &&
    !pushActivityData?.summary &&
    !prVelocityData?.summary;

  if (!hasNoData) return null;

  return (
    <div className="obs-card obs-card-warning" style={{ marginBottom: "1rem" }}>
      <div className="obs-card-body">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <AlertTriangle
            style={{ color: "#f59e0b", width: 20, height: 20, flexShrink: 0 }}
          />
          <div>
            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
              No Data Available
            </div>
            <div
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-fg-secondary)",
              }}
            >
              Run a repository analysis to populate observability metrics.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="obs-empty-state">
      <AlertCircle style={{ color: "#ef4444" }} />
      <h3>Error Loading Data</h3>
      <p>{error}</p>
      <button
        className="obs-btn"
        onClick={onRetry}
        style={{ marginTop: "1rem" }}
      >
        <RefreshCw />
        Try Again
      </button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div>
      <div className="obs-summary-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="obs-skeleton-card">
            <div className="obs-skeleton-text" style={{ width: "60%" }} />
            <div className="obs-skeleton-value" />
            <div className="obs-skeleton-text" style={{ width: "40%" }} />
          </div>
        ))}
      </div>
      <div className="obs-section">
        <div className="obs-card">
          <div className="obs-card-body" style={{ height: 200 }}>
            <div className="obs-loading">
              <div className="obs-loading-spinner" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryMetrics({
  trendData,
  pushActivityData,
  prVelocityData,
}: {
  trendData: any;
  pushActivityData: any;
  prVelocityData: any;
}) {
  const summary = trendData?.quickSummary;
  const pushSummary = pushActivityData?.summary;
  const prSummary = prVelocityData?.summary;

  const getHealthColor = (score: number | null) => {
    if (score === null || score === undefined)
      return "var(--color-fg-secondary)";
    if (score >= 80) return CHART_COLORS.success;
    if (score >= 60) return CHART_COLORS.warning;
    return CHART_COLORS.danger;
  };

  const healthScore = summary?.currentHealthScore;
  const hasHealthScore = healthScore !== null && healthScore !== undefined;

  const healthRadialData = [
    {
      name: "Health",
      value: hasHealthScore ? healthScore : 0,
      fill: getHealthColor(healthScore),
    },
  ];

  return (
    <div className="obs-summary-grid">
      <div className="obs-metric-card obs-metric-card-large">
        <div className="obs-metric-header">
          <Target
            className="obs-metric-icon"
            // style={{ color: getHealthColor(healthScore) }}
          />
          <span className="obs-metric-label">Health Score</span>
        </div>
        <div className="obs-radial-container">
          <ResponsiveContainer width="100%" height={80}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="100%"
              data={healthRadialData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar background dataKey="value" cornerRadius={5} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div
            className="obs-radial-value"
            style={{ color: getHealthColor(healthScore) }}
          >
            {hasHealthScore ? Math.round(healthScore) : "—"}
            <span className="obs-metric-footer">/100</span>
          </div>
        </div>
      </div>

      <div className="obs-metric-card">
        <div className="obs-metric-header">
          <FileCode
            className="obs-metric-icon"
          />
          <span className="obs-metric-label">Code Quality</span>
        </div>
        <div
          className="obs-metric-value"
          style={{
            color: summary?.currentCodeQuality
              ? CHART_COLORS.secondary
              : "var(--color-fg-secondary)",
          }}
        >
          {summary?.currentCodeQuality?.toFixed(0) ?? "—"}
        </div>
        <div className="obs-metric-footer">
          <span>quality score</span>
        </div>
      </div>

      <div className="obs-metric-card">
        <div className="obs-metric-header">
          <AlertTriangle
            className="obs-metric-icon"
          />
          <span className="obs-metric-label">Tech Debt</span>
        </div>
        <div
          className="obs-metric-value"
          style={{
            color:
              (summary?.currentTechnicalDebt ?? 0) > 0
                ? CHART_COLORS.warning
                : "var(--color-fg-secondary)",
          }}
        >
          {summary?.currentTechnicalDebt?.toFixed(0) ?? "—"}
        </div>
        <div className="obs-metric-footer">
          <span>issues to address</span>
        </div>
      </div>

      <div className="obs-metric-card">
        <div className="obs-metric-header">
          <GitCommit
            className="obs-metric-icon"
          />
          <span className="obs-metric-label">Commits</span>
        </div>
        <div className="obs-metric-value" style={{ color: CHART_COLORS.info }}>
          {pushSummary?.totalCommits ?? "—"}
        </div>
        <div className="obs-metric-footer">
          <span>
            {pushSummary?.avgCommitsPerDay
              ? `~${pushSummary.avgCommitsPerDay}/day`
              : "in period"}
          </span>
        </div>
      </div>

      <div className="obs-metric-card">
        <div className="obs-metric-header">
          <GitPullRequest
            className="obs-metric-icon"
          />
          <span className="obs-metric-label">Open PRs</span>
        </div>
        <div
          className="obs-metric-value"
          style={{ color: CHART_COLORS.primary }}
        >
          {prSummary?.currentOpenPRs ?? "—"}
        </div>
        <div className="obs-metric-footer">
          <span>awaiting review</span>
        </div>
      </div>

      <div className="obs-metric-card">
        <div className="obs-metric-header">
          <Clock
            className="obs-metric-icon"
          />
          <span className="obs-metric-label">Avg Merge Time</span>
        </div>
        <div
          className="obs-metric-value"
          style={{ fontSize: "1.5rem", color: CHART_COLORS.success }}
        >
          {prSummary?.avgTimeToMergeFormatted ?? "—"}
        </div>
        <div className="obs-metric-footer">
          <span>to merge PRs</span>
        </div>
      </div>
    </div>
  );
}

function HealthTimelineChart({ trendData }: { trendData: any }) {
  const timeline = trendData?.healthTimeline || [];

  const chartData = useMemo(() => {
    return timeline.map((t: any) => ({
      date: new Date(t.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      healthScore: t.healthScore,
      codeQuality: t.codeQuality,
    }));
  }, [timeline]);

  if (chartData.length === 0) {
    return (
      <div className="obs-section">
        <div className="obs-section-header">
          <h2 className="obs-section-title">
            {/* <Activity /> */}
            Code Health Timeline
          </h2>
        </div>
        <div className="obs-card">
          <div className="obs-card-body">
            <div className="obs-empty-state">
              <Activity />
              <h3>No health data available</h3>
              <p>Run an analysis to see health trends over time</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="obs-section">
      <div className="obs-section-header">
        <h2 className="obs-section-title">
          {/* <Activity /> */}
          Code Health Timeline
        </h2>
      </div>
      <div className="obs-card">
        <div className="obs-card-body">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={CHART_COLORS.success}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_COLORS.success}
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id="qualityGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={CHART_COLORS.primary}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_COLORS.primary}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="date"
                stroke="var(--color-fg-secondary)"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                stroke="var(--color-fg-secondary)"
                fontSize={11}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="healthScore"
                name="Health Score"
                stroke={CHART_COLORS.success}
                fill="url(#healthGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="codeQuality"
                name="Code Quality"
                stroke={CHART_COLORS.primary}
                fill="url(#qualityGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function RiskTimelineChart({ trendData }: { trendData: any }) {
  const timeline = trendData?.riskTimeline || [];

  const chartData = useMemo(() => {
    return timeline.map((t: any) => ({
      date: new Date(t.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      technicalDebt: t.technicalDebt,
      highRiskFiles: t.highRiskFiles,
    }));
  }, [timeline]);

  if (chartData.length === 0) return null;

  return (
    <div className="obs-section">
      <div className="obs-section-header">
        <h2 className="obs-section-title">
          {/* <AlertTriangle /> */}
          Risk & Technical Debt
        </h2>
      </div>
      <div className="obs-card">
        <div className="obs-card-body">
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="date"
                stroke="var(--color-fg-secondary)"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="var(--color-fg-secondary)"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="var(--color-fg-secondary)"
                fontSize={11}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="technicalDebt"
                name="Technical Debt"
                fill={CHART_COLORS.warning}
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="highRiskFiles"
                name="High Risk Files"
                stroke={CHART_COLORS.danger}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.danger }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function VelocityOverviewChart({ prVelocityData }: { prVelocityData: any }) {
  if (!prVelocityData) return null;

  const { summary, trend } = prVelocityData;

  const getTrendIcon = (trendValue: string) => {
    if (trendValue === "improving")
      return <TrendingUp className="obs-trend-icon success" />;
    if (trendValue === "declining")
      return <TrendingDown className="obs-trend-icon danger" />;
    return null;
  };

  return (
    <div className="obs-section">
      <div className="obs-section-header">
        <h2 className="obs-section-title">
          {/* <Zap /> */}
          PR Velocity Overview
        </h2>
      </div>
      <div className="obs-grid-2">
        <div className="obs-card">
          <div className="obs-card-header">
            <div>
              <div className="obs-card-title">Time to Merge</div>
              <div className="obs-card-subtitle">Average merge time</div>
            </div>
            <div className="obs-trend-badge">
              {getTrendIcon(trend?.mergeTime)}
              <span
                className={`obs-badge ${
                  trend?.mergeTime === "improving"
                    ? "success"
                    : trend?.mergeTime === "declining"
                    ? "danger"
                    : "neutral"
                }`}
              >
                {trend?.mergeTime || "stable"}
              </span>
            </div>
          </div>
          <div className="obs-card-body">
            <div
              className="obs-metric-value"
              style={{ fontSize: "2rem", 
                // color: CHART_COLORS.primary 
              }}
            >
              {summary?.avgTimeToMergeFormatted || "—"}
            </div>
          </div>
        </div>

        <div className="obs-card">
          <div className="obs-card-header">
            <div>
              <div className="obs-card-title">Time to First Review</div>
              <div className="obs-card-subtitle">Average review response</div>
            </div>
            <div className="obs-trend-badge">
              {getTrendIcon(trend?.reviewTime)}
              <span
                className={`obs-badge ${
                  trend?.reviewTime === "improving"
                    ? "success"
                    : trend?.reviewTime === "declining"
                    ? "danger"
                    : "neutral"
                }`}
              >
                {trend?.reviewTime || "stable"}
              </span>
            </div>
          </div>
          <div className="obs-card-body">
            <div
              className="obs-metric-value"
              style={{ fontSize: "2rem", 
                // color: CHART_COLORS.info 
              }}
            >
              {summary?.avgTimeToFirstReviewFormatted || "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PushActivitySection({ data }: { data: any }) {
  if (!data) {
    return (
      <div className="obs-section">
        <div className="obs-card">
          <div className="obs-card-body">
            <div className="obs-empty-state">
              {/* <Activity /> */}
              <h3>No push activity data</h3>
              <p>Push activity will appear here once available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { summary, dailyMetrics, topContributors } = data;

  const chartData = useMemo(() => {
    return dailyMetrics.slice(-30).map((d: any) => ({
      date: new Date(d.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      commits: d.totalCommits,
      pushes: d.totalPushes,
    }));
  }, [dailyMetrics]);

  return (
    <div className="obs-section">
      <div className="obs-section-header">
        <h2 className="obs-section-title">
          {/* <GitCommit /> */}
          Codebase Activity Timeline
        </h2>
      </div>

      <div className="obs-grid-3" style={{ marginBottom: "1rem" }}>
        <div className="obs-card">
          <div className="obs-card-header">
            <div className="obs-card-title">Total Commits</div>
          </div>
          <div className="obs-card-body">
            <div
              className="obs-metric-value"
              style={{ color: CHART_COLORS.primary }}
            >
              {summary.totalCommits}
            </div>
            <div className="obs-metric-footer">
              <span>~{summary.avgCommitsPerDay} per day</span>
            </div>
          </div>
        </div>

        <div className="obs-card">
          <div className="obs-card-header">
            <div className="obs-card-title">Contributors</div>
          </div>
          <div className="obs-card-body">
            <div
              className="obs-metric-value"
              style={{ color: CHART_COLORS.secondary }}
            >
              {summary.uniqueContributors}
            </div>
            <div className="obs-metric-footer">
              <span>{summary.activeDays} active days</span>
            </div>
          </div>
        </div>

        <div className="obs-card">
          <div className="obs-card-header">
            <div className="obs-card-title">Total Pushes</div>
          </div>
          <div className="obs-card-body">
            <div
              className="obs-metric-value"
              style={{ color: CHART_COLORS.success }}
            >
              {summary.totalPushes}
            </div>
            <div className="obs-metric-footer">
              <span>~{summary.avgPushesPerDay} per day</span>
            </div>
          </div>
        </div>
      </div>

      <div className="obs-card">
        <div className="obs-card-header">
          <div className="obs-card-title">Daily Activity</div>
        </div>
        <div className="obs-card-body">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="var(--color-fg-secondary)"
                fontSize={10}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="var(--color-fg-secondary)"
                fontSize={10}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="commits"
                name="Commits"
                fill={CHART_COLORS.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {topContributors?.length > 0 && (
        <div className="obs-card" style={{ marginTop: "1rem" }}>
          <div className="obs-card-header">
            <div className="obs-card-title">Top Contributors</div>
          </div>
          <div className="obs-card-body" style={{ padding: 0 }}>
            <table className="obs-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Contributor</th>
                  <th>Commits</th>
                  <th>Pushes</th>
                </tr>
              </thead>
              <tbody>
                {topContributors.slice(0, 5).map((c: any, i: number) => (
                  <tr key={c.userId}>
                    <td>
                      <span
                        className={`obs-badge ${
                          i === 0
                            ? "warning"
                            : i === 1
                            ? "info"
                            : i === 2
                            ? "success"
                            : "neutral"
                        }`}
                      >
                        #{i + 1}
                      </span>
                    </td>
                    <td>
                      <div className="obs-reviewer-row">
                        <div className="obs-reviewer-avatar">
                          {c.userId.charAt(0).toUpperCase()}
                        </div>
                        <span className="obs-reviewer-name">
                          User {c.userId.slice(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.totalCommits}</td>
                    <td>{c.totalPushes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityHeatmapSection({ data }: { data: any }) {
  if (!data?.heatmapData?.length) {
    return (
      <div className="obs-section">
        <div className="obs-card">
          <div className="obs-card-body">
            <div className="obs-empty-state">
              {/* <Calendar /> */}
              <h3>No heatmap data</h3>
              <p>Activity heatmap will appear here once available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const heatmapMap: Record<string, number> = {};
  data.heatmapData.forEach((item: any) => {
    const key = `${item.day}-${item.hour}`;
    heatmapMap[key] = (heatmapMap[key] || 0) + item.count;
  });

  const maxCount = Math.max(...Object.values(heatmapMap), 1);

  const getLevel = (count: number) => {
    if (count === 0) return 0;
    const ratio = count / maxCount;
    if (ratio < 0.25) return 1;
    if (ratio < 0.5) return 2;
    if (ratio < 0.75) return 3;
    return 4;
  };

  return (
    <div className="obs-section">
      <div className="obs-section-header">
        <h2 className="obs-section-title">
          {/* <Calendar /> */}
          Activity Heatmap
        </h2>
      </div>
      <div className="obs-card">
        <div className="obs-card-header">
          <div className="obs-card-title">Commits by Day & Hour (UTC)</div>
        </div>
        <div className="obs-card-body">
          <div className="obs-activity-heatmap">
            <div className="obs-heatmap-hour-labels">
              <div />
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="obs-heatmap-hour-label">
                  {h % 4 === 0 ? `${h}h` : ""}
                </div>
              ))}
            </div>
            {DAYS_ORDER.map((day) => (
              <div key={day} style={{ display: "contents" }}>
                <div className="obs-heatmap-day-label">{day.slice(0, 3)}</div>
                {Array.from({ length: 24 }, (_, hour) => {
                  const count = heatmapMap[`${day}-${hour}`] || 0;
                  return (
                    <div
                      key={hour}
                      className={`obs-heatmap-cell level-${getLevel(count)}`}
                      title={`${day} ${hour}:00 - ${count} commits`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="obs-heatmap-legend">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`obs-heatmap-legend-cell obs-heatmap-cell level-${level}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PRVelocitySection({ data }: { data: any }) {
  if (!data) {
    return (
      <div className="obs-section">
        <div className="obs-card">
          <div className="obs-card-body">
            <div className="obs-empty-state">
              {/* <Zap /> */}
              <h3>No PR velocity data</h3>
              <p>PR metrics will appear here once PRs are tracked</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { summary, chartData } = data;

  const formattedChartData = useMemo(() => {
    return chartData.slice(-30).map((d: any) => ({
      date: new Date(d.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      opened: d.opened,
      merged: d.merged,
    }));
  }, [chartData]);

  return (
    <div className="obs-section">
      <div className="obs-section-header">
        <h2 className="obs-section-title">
          {/* <Zap /> */}
          PR Velocity & Performance
        </h2>
      </div>

      <div className="obs-summary-grid" style={{ marginBottom: "1rem" }}>
        <div className="obs-metric-card">
          <div className="obs-metric-label">PRs Opened</div>
          <div
            className="obs-metric-value"
            style={{ color: CHART_COLORS.primary }}
          >
            {summary.totalPRsOpened}
          </div>
        </div>
        <div className="obs-metric-card">
          <div className="obs-metric-label">PRs Merged</div>
          <div
            className="obs-metric-value"
            style={{ color: CHART_COLORS.success }}
          >
            {summary.totalPRsMerged}
          </div>
        </div>
        <div className="obs-metric-card">
          <div className="obs-metric-label">PRs Closed</div>
          <div className="obs-metric-value">{summary.totalPRsClosed}</div>
        </div>
        <div className="obs-metric-card">
          <div className="obs-metric-label">Avg Time to Merge</div>
          <div className="obs-metric-value" style={{ fontSize: "1.25rem" }}>
            {summary.avgTimeToMergeFormatted}
          </div>
        </div>
        <div className="obs-metric-card">
          <div className="obs-metric-label">Avg Time to Review</div>
          <div className="obs-metric-value" style={{ fontSize: "1.25rem" }}>
            {summary.avgTimeToFirstReviewFormatted}
          </div>
        </div>
        <div className="obs-metric-card">
          <div className="obs-metric-label">Stale PRs</div>
          <div
            className="obs-metric-value"
            style={{
              color:
                summary.currentStalePRs > 0 ? CHART_COLORS.warning : "inherit",
            }}
          >
            {summary.currentStalePRs}
          </div>
        </div>
      </div>

      <div className="obs-card">
        <div className="obs-card-header">
          <div className="obs-card-title">PR Activity Over Time</div>
        </div>
        <div className="obs-card-body">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={formattedChartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="var(--color-fg-secondary)"
                fontSize={10}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="var(--color-fg-secondary)"
                fontSize={10}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="merged"
                name="Merged"
                fill={CHART_COLORS.success}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="opened"
                name="Opened"
                fill={CHART_COLORS.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StalePRsSection({ data }: { data: any }) {
  if (!data || data.stalePRs?.length === 0) {
    return (
      <div className="obs-section">
        <div className="obs-card">
          <div className="obs-card-body">
            <div className="obs-empty-state">
              {/* <CheckCircle style={{ color: CHART_COLORS.success }} /> */}
              <h3>No stale PRs</h3>
              <p>All pull requests are active and up to date</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getDaysBadge = (days: number) => {
    if (days > 14) return "danger";
    if (days > 7) return "warning";
    return "info";
  };

  return (
    <div className="obs-section">
      <div className="obs-section-header">
        <h2 className="obs-section-title">
          {/* <AlertTriangle /> */}
          Stale Pull Requests
          <span className="obs-badge danger" style={{ marginLeft: "0.5rem" }}>
            {data.count}
          </span>
        </h2>
      </div>
      <div className="obs-card">
        <div className="obs-card-body" style={{ padding: 0 }}>
          <table className="obs-table">
            <thead>
              <tr>
                <th>PR #</th>
                <th>Title</th>
                <th>Days Open</th>
                <th>Reviews</th>
                <th>Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {data.stalePRs.map((pr: any) => (
                <tr key={pr.id}>
                  <td>
                    <span className="obs-badge info">#{pr.prNumber}</span>
                  </td>
                  <td className="obs-table-title-cell">{pr.title}</td>
                  <td>
                    <span
                      className={`obs-badge ${getDaysBadge(
                        pr.daysSinceCreated
                      )}`}
                    >
                      {pr.daysSinceCreated} days
                    </span>
                  </td>
                  <td>{pr.reviewCount}</td>
                  <td style={{ color: "var(--color-fg-secondary)" }}>
                    {pr.lastReviewDate
                      ? new Date(pr.lastReviewDate).toLocaleDateString()
                      : "No reviews"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReviewerPerformanceSection({ data }: { data: any }) {
  if (!data) {
    return (
      <div className="obs-section">
        <div className="obs-card">
          <div className="obs-card-body">
            <div className="obs-empty-state">
              {/* <Users /> */}
              <h3>No reviewer data</h3>
              <p>
                Reviewer performance will appear here once reviews are tracked
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { teamStats, reviewers, bottlenecks, recommendations } = data;

  const reviewerChartData = useMemo(() => {
    return reviewers.slice(0, 10).map((r: any) => ({
      name: r.reviewerName || `User ${r.reviewerId.slice(0, 6)}`,
      reviews: r.totalReviews,
      approvals: r.approvals,
      changes: r.changesRequested,
    }));
  }, [reviewers]);

  const getResponseBadge = (time: number) => {
    if (time < 60) return "success";
    if (time < 240) return "warning";
    return "danger";
  };

  return (
    <div className="obs-section">
      <div className="obs-section-header">
        <h2 className="obs-section-title">
          {/* <Users /> */}
          Reviewer Performance
        </h2>
      </div>

      <div className="obs-summary-grid" style={{ marginBottom: "1rem" }}>
        <div className="obs-metric-card">
          <div className="obs-metric-label">Total Reviewers</div>
          <div
            className="obs-metric-value"
            style={{ color: CHART_COLORS.primary }}
          >
            {teamStats.totalReviewers}
          </div>
        </div>
        <div className="obs-metric-card">
          <div className="obs-metric-label">Total Reviews</div>
          <div
            className="obs-metric-value"
            style={{ color: CHART_COLORS.success }}
          >
            {teamStats.totalReviews}
          </div>
        </div>
        <div className="obs-metric-card">
          <div className="obs-metric-label">Avg Response Time</div>
          <div className="obs-metric-value" style={{ fontSize: "1.25rem" }}>
            {teamStats.avgTeamResponseTimeFormatted}
          </div>
        </div>
        <div className="obs-metric-card">
          <div className="obs-metric-label">Pending Reviews</div>
          <div
            className="obs-metric-value"
            style={{
              color:
                teamStats.totalPendingReviews > 5
                  ? CHART_COLORS.warning
                  : "inherit",
            }}
          >
            {teamStats.totalPendingReviews}
          </div>
        </div>
      </div>

      {bottlenecks?.length > 0 && (
        <div
          className="obs-card obs-card-danger"
          style={{ marginBottom: "1rem" }}
        >
          <div className="obs-card-header">
            <div
              className="obs-card-title"
              style={{
                color: CHART_COLORS.danger,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <AlertTriangle />
              Bottlenecks Detected ({bottlenecks.length})
            </div>
          </div>
          <div className="obs-card-body">
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-fg-secondary)",
                marginBottom: "0.5rem",
              }}
            >
              The following reviewers have been identified as bottlenecks due to
              slow response times.
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {bottlenecks.map((b: any) => (
                <span key={b.reviewerId} className="obs-badge danger">
                  {b.reviewerName || b.reviewerId} - {b.pendingReviews} pending
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {reviewerChartData.length > 0 && (
        <div className="obs-card" style={{ marginBottom: "1rem" }}>
          <div className="obs-card-header">
            <div className="obs-card-title">Review Activity by Reviewer</div>
          </div>
          <div className="obs-card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={reviewerChartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="var(--color-fg-secondary)"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="var(--color-fg-secondary)"
                  fontSize={10}
                  tickLine={false}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="approvals"
                  name="Approvals"
                  fill={CHART_COLORS.success}
                  stackId="a"
                />
                <Bar
                  dataKey="changes"
                  name="Changes Requested"
                  fill={CHART_COLORS.warning}
                  stackId="a"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="obs-card">
        <div className="obs-card-header">
          <div className="obs-card-title">Reviewer Leaderboard</div>
        </div>
        <div className="obs-card-body" style={{ padding: 0 }}>
          <table className="obs-table">
            <thead>
              <tr>
                <th>Reviewer</th>
                <th>Reviews</th>
                <th>Avg Response</th>
                <th>Approvals</th>
                <th>Changes Req.</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reviewers.map((reviewer: any) => (
                <tr key={reviewer.reviewerId}>
                  <td>
                    <div className="obs-reviewer-row">
                      <div className="obs-reviewer-avatar">
                        {reviewer.reviewerName?.charAt(0) || "?"}
                      </div>
                      <span className="obs-reviewer-name">
                        {reviewer.reviewerName || `User ${reviewer.reviewerId}`}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{reviewer.totalReviews}</td>
                  <td>
                    <span
                      className={`obs-badge ${getResponseBadge(
                        reviewer.avgResponseTime
                      )}`}
                    >
                      {reviewer.avgResponseTimeFormatted}
                    </span>
                  </td>
                  <td style={{ color: CHART_COLORS.success }}>
                    {reviewer.approvals}
                  </td>
                  <td style={{ color: CHART_COLORS.warning }}>
                    {reviewer.changesRequested}
                  </td>
                  <td>
                    {reviewer.isBottleneck ? (
                      <span className="obs-badge danger">Bottleneck</span>
                    ) : (
                      <span className="obs-badge success">Good</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {recommendations?.length > 0 && (
        <div className="obs-card" style={{ marginTop: "1rem" }}>
          <div className="obs-card-header">
            <div className="obs-card-title">Recommendations</div>
          </div>
          <div className="obs-card-body">
            <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
              {recommendations.map((rec: any, i: number) => (
                <li
                  key={i}
                  style={{
                    marginBottom: "0.5rem",
                    color: "var(--color-fg-secondary)",
                  }}
                >
                  {typeof rec === "string" ? rec : rec.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function PRDistributionSection({ data }: { data: any }) {
  if (!data) {
    return (
      <div className="obs-section">
        <div className="obs-card">
          <div className="obs-card-body">
            <div className="obs-empty-state">
              {/* <PieChart /> */}
              <h3>No distribution data</h3>
              <p>PR distribution will appear here once PRs are tracked</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { mergeTimeDistribution, reviewTimeDistribution } = data;

  const mergeLabels: Record<string, string> = {
    under1Hour: "< 1 hour",
    under4Hours: "1-4 hours",
    under1Day: "4-24 hours",
    under1Week: "1-7 days",
    over1Week: "> 1 week",
  };

  const reviewLabels: Record<string, string> = {
    under1Hour: "< 1 hour",
    under4Hours: "1-4 hours",
    under1Day: "4-24 hours",
    over1Day: "> 1 day",
  };

  const mergePieData = Object.entries(mergeTimeDistribution).map(
    ([key, value], index) => ({
      name: mergeLabels[key],
      value: value as number,
      fill: PIE_COLORS[index % PIE_COLORS.length],
    })
  );

  const reviewPieData = Object.entries(reviewTimeDistribution).map(
    ([key, value], index) => ({
      name: reviewLabels[key],
      value: value as number,
      fill: PIE_COLORS[index % PIE_COLORS.length],
    })
  );

  const mergeTotal =
    Object.values(mergeTimeDistribution).reduce(
      (a: number, b: any) => a + b,
      0
    ) || 1;
  const reviewTotal =
    Object.values(reviewTimeDistribution).reduce(
      (a: number, b: any) => a + b,
      0
    ) || 1;

  return (
    <div className="obs-section">
      <div className="obs-section-header">
        <h2 className="obs-section-title">
          {/* <PieChart /> */}
          PR Distribution Summary
        </h2>
      </div>

      <div className="obs-grid-2">
        <div className="obs-card">
          <div className="obs-card-header">
            <div className="obs-card-title">Merge Time Distribution</div>
          </div>
          <div className="obs-card-body">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <ResponsiveContainer width={140} height={140}>
                <RechartsPie>
                  <Pie
                    data={mergePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {mergePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="obs-distribution-legend">
                {mergePieData.map((item, index) => (
                  <div key={index} className="obs-distribution-legend-item">
                    <span
                      className="obs-legend-dot"
                      style={{ background: item.fill }}
                    />
                    <span className="obs-legend-label">{item.name}</span>
                    <span className="obs-legend-value">
                      {item.value} (
                      {((item.value / mergeTotal) * 100).toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="obs-card">
          <div className="obs-card-header">
            <div className="obs-card-title">Review Time Distribution</div>
          </div>
          <div className="obs-card-body">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <ResponsiveContainer width={140} height={140}>
                <RechartsPie>
                  <Pie
                    data={reviewPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {reviewPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="obs-distribution-legend">
                {reviewPieData.map((item, index) => (
                  <div key={index} className="obs-distribution-legend-item">
                    <span
                      className="obs-legend-dot"
                      style={{ background: item.fill }}
                    />
                    <span className="obs-legend-label">{item.name}</span>
                    <span className="obs-legend-value">
                      {item.value} (
                      {((item.value / reviewTotal) * 100).toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
