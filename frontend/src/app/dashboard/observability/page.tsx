"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  Zap,
  FileCode,
  TestTube,
  BookOpen,
  GitCommit,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronDown,
  Clock,
  User,
  Folder,
  File,
  Bell,
  BellOff,
  Sparkles,
  Target,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  AlertCircle,
  Trophy,
  Medal,
  Award,
  Flame,
  Brain,
  Lightbulb,
  Wrench,
} from "lucide-react";
import {
  useObservabilityStore,
  HealthPulseMetric,
  CommitImpact,
  HeatmapNode,
  ContributorHealth,
  Prediction,
  SmartRecommendation,
  HealthAlert,
} from "@/store/observabilityStore";
import { useGitHubStore } from "@/store/githubStore";
import "../dashboard.css";


const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-500" />;
  if (trend === "down")
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-gray-500" />;
};

const HealthScoreColor = (score: number): string => {
  if (score >= 90) return "var(--color-success, #10b981)";
  if (score >= 80) return "var(--color-success, #22c55e)";
  if (score >= 60) return "var(--color-warning, #eab308)";
  if (score >= 40) return "var(--color-warning, #f97316)";
  return "var(--color-error, #ef4444)";
};

const RiskBadge = ({
  level,
}: {
  level: "low" | "medium" | "high" | "critical";
}) => {
  const colors = {
    low: "bg-green-500/10 text-green-500",
    medium: "bg-yellow-500/10 text-yellow-500",
    high: "bg-orange-500/10 text-orange-500",
    critical: "bg-red-500/10 text-red-500",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[level]}`}
    >
      {level}
    </span>
  );
};

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return "Just now";
};


const HealthPulseCard = ({
  metric,
  icon,
}: {
  metric: HealthPulseMetric;
  icon: React.ReactNode;
}) => (
  <div
    className="p-4 rounded-xl border transition-all hover:border-[var(--color-fg-secondary)] cursor-pointer group"
    style={{
      background: "var(--color-bg-secondary)",
      borderColor: "var(--color-border)",
    }}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "var(--color-bg-tertiary)" }}
        >
          {icon}
        </div>
        <span
          className="text-sm font-medium"
          style={{ color: "var(--color-fg-secondary)" }}
        >
          {metric.label}
        </span>
      </div>
      <TrendIcon trend={metric.trend} />
    </div>
    <div className="flex items-end justify-between">
      <span
        className="text-3xl font-bold"
        style={{ color: HealthScoreColor(metric.score) }}
      >
        {metric.score}
      </span>
      <span
        className={`text-sm font-medium ${
          metric.change > 0
            ? "text-green-500"
            : metric.change < 0
            ? "text-red-500"
            : "text-gray-500"
        }`}
      >
        {metric.change > 0 ? "+" : ""}
        {metric.change}%
      </span>
    </div>
    <div
      className="mt-3 h-1 rounded-full overflow-hidden"
      style={{ background: "var(--color-bg-tertiary)" }}
    >
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{
          width: `${metric.score}%`,
          background: HealthScoreColor(metric.score),
        }}
      />
    </div>
  </div>
);

const TimelineChart = ({
  data,
  timeRange,
  onTimeRangeChange,
}: {
  data: { date: string; overallScore: number }[];
  timeRange: string;
  onTimeRangeChange: (range: "1w" | "1m" | "3m" | "6m" | "1y" | "all") => void;
}) => {
  const ranges = ["1w", "1m", "3m", "6m", "1y", "all"] as const;

  return (
    <div
      className="p-5 rounded-xl border"
      style={{
        background: "var(--color-bg-secondary)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-base font-semibold flex items-center gap-2"
          style={{ color: "var(--color-fg)" }}
        >
          <TrendingUp size={18} style={{ color: "var(--color-primary)" }} />
          Health Timeline
        </h3>
        <div className="flex gap-1">
          {ranges.map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                timeRange === range
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-tertiary)]"
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="h-48 relative">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 150"
          preserveAspectRatio="none"
        >
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={150 - (y / 100) * 150}
              x2="400"
              y2={150 - (y / 100) * 150}
              stroke="var(--color-border)"
              strokeWidth="0.5"
              strokeDasharray="4"
            />
          ))}

          <path
            d={`M0,${150 - ((data[0]?.overallScore || 0) / 100) * 150} ${data
              .map(
                (d, i) =>
                  `L${(i / (data.length - 1)) * 400},${
                    150 - (d.overallScore / 100) * 150
                  }`
              )
              .join(" ")} L400,150 L0,150 Z`}
            fill="url(#gradient)"
            opacity="0.3"
          />

          <path
            d={`M0,${150 - ((data[0]?.overallScore || 0) / 100) * 150} ${data
              .map(
                (d, i) =>
                  `L${(i / (data.length - 1)) * 400},${
                    150 - (d.overallScore / 100) * 150
                  }`
              )
              .join(" ")}`}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2"
          />

          {data.map((d, i) => (
            <circle
              key={i}
              cx={(i / (data.length - 1)) * 400}
              cy={150 - (d.overallScore / 100) * 150}
              r="3"
              fill="var(--color-primary)"
              className="cursor-pointer hover:r-5 transition-all"
            />
          ))}

          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>

        <div
          className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs"
          style={{ color: "var(--color-fg-muted)" }}
        >
          <span>100</span>
          <span>75</span>
          <span>50</span>
          <span>25</span>
          <span>0</span>
        </div>
      </div>

      <p className="text-xs mt-2" style={{ color: "var(--color-fg-muted)" }}>
        📍 Click any point to see what changed that day
      </p>
    </div>
  );
};


const CommitImpactCard = ({ commit }: { commit: CommitImpact }) => (
  <div
    className="p-4 rounded-xl border transition-all hover:border-[var(--color-fg-secondary)]"
    style={{
      background: "var(--color-bg-secondary)",
      borderColor: "var(--color-border)",
    }}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            commit.healthDelta > 0
              ? "bg-green-500/10"
              : commit.healthDelta < 0
              ? "bg-red-500/10"
              : "bg-gray-500/10"
          }`}
        >
          {commit.healthDelta > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : commit.healthDelta < 0 ? (
            <TrendingDown className="w-4 h-4 text-red-500" />
          ) : (
            <Minus className="w-4 h-4 text-gray-500" />
          )}
        </div>
        <div className="flex-1">
          <p
            className="text-sm font-medium"
            style={{ color: "var(--color-fg)" }}
          >
            {commit.message.length > 50
              ? commit.message.substring(0, 50) + "..."
              : commit.message}
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "var(--color-fg-secondary)" }}
          >
            @{commit.author} · {formatTimeAgo(commit.timestamp)} ·{" "}
            {commit.filesChanged} files changed
          </p>
          <div className="flex items-center gap-3 mt-2">
            {commit.issues.introduced > 0 && (
              <span className="text-xs text-red-500">
                +{commit.issues.introduced} issues
              </span>
            )}
            {commit.issues.resolved > 0 && (
              <span className="text-xs text-green-500">
                -{commit.issues.resolved} issues
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <span
          className={`text-lg font-bold ${
            commit.healthDelta > 0
              ? "text-green-500"
              : commit.healthDelta < 0
              ? "text-red-500"
              : "text-gray-500"
          }`}
        >
          {commit.healthDelta > 0 ? "+" : ""}
          {commit.healthDelta}
        </span>
        <div className="mt-1">
          <RiskBadge level={commit.riskLevel} />
        </div>
      </div>
    </div>
    <div className="flex gap-2 mt-3">
      <button
        className="text-xs px-3 py-1 rounded-lg transition-colors hover:bg-[var(--color-bg-tertiary)]"
        style={{ color: "var(--color-fg-secondary)" }}
      >
        View Details
      </button>
      <button
        className="text-xs px-3 py-1 rounded-lg transition-colors hover:bg-[var(--color-bg-tertiary)]"
        style={{ color: "var(--color-fg-secondary)" }}
      >
        Compare Before/After
      </button>
    </div>
  </div>
);


const HeatmapTreeNode = ({
  node,
  depth = 0,
}: {
  node: HeatmapNode;
  depth?: number;
}) => {
  const [expanded, setExpanded] = useState(depth < 2);

  const getHealthBar = (score: number) => {
    const segments = 8;
    const filled = Math.round((score / 100) * segments);
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-2 rounded-sm"
            style={{
              background:
                i < filled
                  ? HealthScoreColor(score)
                  : "var(--color-bg-tertiary)",
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] cursor-pointer transition-colors"
        onClick={() => node.children && setExpanded(!expanded)}
      >
        {node.children && node.children.length > 0 ? (
          expanded ? (
            <ChevronDown
              className="w-4 h-4"
              style={{ color: "var(--color-fg-secondary)" }}
            />
          ) : (
            <ChevronRight
              className="w-4 h-4"
              style={{ color: "var(--color-fg-secondary)" }}
            />
          )
        ) : (
          <div className="w-4" />
        )}
        {node.type === "directory" ? (
          <Folder
            className="w-4 h-4"
            style={{ color: "var(--color-fg-secondary)" }}
          />
        ) : (
          <File
            className="w-4 h-4"
            style={{ color: "var(--color-fg-secondary)" }}
          />
        )}
        <span className="text-sm flex-1" style={{ color: "var(--color-fg)" }}>
          {node.name}
        </span>
        {getHealthBar(node.healthScore)}
        <span
          className="text-xs w-8 text-right"
          style={{ color: HealthScoreColor(node.healthScore) }}
        >
          {node.healthScore}
        </span>
      </div>
      {expanded &&
        node.children?.map((child) => (
          <HeatmapTreeNode key={child.path} node={child} depth={depth + 1} />
        ))}
    </div>
  );
};


const ContributorCard = ({
  contributor,
  index,
}: {
  contributor: ContributorHealth;
  index: number;
}) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />;
    if (rank === 3) return <Award className="w-4 h-4 text-orange-400" />;
    return (
      <span className="text-xs" style={{ color: "var(--color-fg-secondary)" }}>
        #{rank}
      </span>
    );
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-6 flex justify-center">
        {getRankIcon(contributor.rank)}
      </div>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
        style={{
          background: "var(--color-bg-tertiary)",
          color: "var(--color-fg)",
        }}
      >
        {contributor.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>
          {contributor.name}
        </p>
        <div className="flex items-center gap-2">
          {contributor.streak > 0 && (
            <span className="flex items-center gap-1 text-xs text-orange-500">
              <Flame className="w-3 h-3" />
              {contributor.streak}d
            </span>
          )}
          {contributor.badges.slice(0, 2).map((badge) => (
            <span
              key={badge}
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                background: "var(--color-bg-tertiary)",
                color: "var(--color-fg-secondary)",
              }}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
      <span
        className={`text-sm font-bold ${
          contributor.healthPoints > 0
            ? "text-green-500"
            : contributor.healthPoints < 0
            ? "text-red-500"
            : "text-gray-500"
        }`}
      >
        {contributor.healthPoints > 0 ? "+" : ""}
        {contributor.healthPoints}
      </span>
    </div>
  );
};


const PredictionCard = ({ prediction }: { prediction: Prediction }) => (
  <div
    className="p-4 rounded-xl border"
    style={{
      background: "var(--color-bg-secondary)",
      borderColor: "var(--color-border)",
    }}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        {prediction.riskLevel === "high" && (
          <AlertTriangle className="w-4 h-4 text-red-500" />
        )}
        {prediction.riskLevel === "medium" && (
          <AlertCircle className="w-4 h-4 text-yellow-500" />
        )}
        {prediction.riskLevel === "low" && (
          <CheckCircle className="w-4 h-4 text-green-500" />
        )}
        <span
          className="text-sm font-medium"
          style={{ color: "var(--color-fg)" }}
        >
          {prediction.metric}
        </span>
      </div>
      <RiskBadge level={prediction.riskLevel} />
    </div>
    <div className="flex items-center gap-2 mb-2">
      <span className="text-2xl font-bold" style={{ color: "var(--color-fg)" }}>
        {prediction.currentValue}
      </span>
      <ArrowDownRight
        className={`w-5 h-5 ${
          prediction.trend === "declining"
            ? "text-red-500"
            : prediction.trend === "improving"
            ? "text-green-500 rotate-180"
            : "text-gray-500"
        }`}
      />
      <span
        className="text-lg"
        style={{
          color:
            prediction.trend === "declining"
              ? "#ef4444"
              : prediction.trend === "improving"
              ? "#22c55e"
              : "var(--color-fg-secondary)",
        }}
      >
        {prediction.predictedValue}
      </span>
      <span className="text-xs" style={{ color: "var(--color-fg-muted)" }}>
        in {prediction.timeframe}
      </span>
    </div>
    <p className="text-xs mb-2" style={{ color: "var(--color-fg-secondary)" }}>
      {prediction.factors[0]}
    </p>
    <div
      className="flex items-center gap-1 text-xs"
      style={{ color: "var(--color-fg-muted)" }}
    >
      <span>Confidence: {prediction.confidence}%</span>
    </div>
  </div>
);


const RecommendationCard = ({
  recommendation,
}: {
  recommendation: SmartRecommendation;
}) => {
  const typeConfig = {
    critical: {
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    "quick-win": {
      icon: <Zap className="w-4 h-4" />,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    improvement: {
      icon: <Wrench className="w-4 h-4" />,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    documentation: {
      icon: <BookOpen className="w-4 h-4" />,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  };

  const config = typeConfig[recommendation.type];

  return (
    <div
      className="p-4 rounded-xl border"
      style={{
        background: "var(--color-bg-secondary)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bg} ${config.color}`}
        >
          {config.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium uppercase ${config.color}`}>
              {recommendation.type}
            </span>
          </div>
          <h4
            className="text-sm font-medium mb-1"
            style={{ color: "var(--color-fg)" }}
          >
            {recommendation.title}
          </h4>
          <p
            className="text-xs mb-3"
            style={{ color: "var(--color-fg-secondary)" }}
          >
            {recommendation.description}
          </p>
          <div
            className="flex items-center gap-4 text-xs"
            style={{ color: "var(--color-fg-muted)" }}
          >
            <span>
              Impact: {recommendation.impact.metric} +
              {recommendation.impact.expectedValue -
                recommendation.impact.currentValue}
            </span>
            <span>Effort: {recommendation.effort}</span>
            <span>~{recommendation.timeEstimate}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: "var(--color-primary)", color: "white" }}
            >
              View Details
            </button>
            <button
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{
                background: "var(--color-bg-tertiary)",
                color: "var(--color-fg)",
              }}
            >
              Create Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const AlertItem = ({
  alert,
  onAcknowledge,
}: {
  alert: HealthAlert;
  onAcknowledge: (id: string) => void;
}) => {
  const severityConfig = {
    info: {
      icon: <Info className="w-4 h-4" />,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    warning: {
      icon: <AlertCircle className="w-4 h-4" />,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    critical: {
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
  };

  const config = severityConfig[alert.severity];

  return (
    <div
      className={`flex items-start gap-3 py-3 ${
        alert.acknowledged ? "opacity-50" : ""
      }`}
    >
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center ${config.bg} ${config.color}`}
      >
        {config.icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium" style={{ color: "var(--color-fg)" }}>
          {alert.title}
        </p>
        <p className="text-xs" style={{ color: "var(--color-fg-secondary)" }}>
          {alert.message}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--color-fg-muted)" }}>
          {formatTimeAgo(alert.timestamp)}
        </p>
      </div>
      {!alert.acknowledged && (
        <button
          onClick={() => onAcknowledge(alert.id)}
          className="p-1.5 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
        >
          <BellOff
            className="w-4 h-4"
            style={{ color: "var(--color-fg-secondary)" }}
          />
        </button>
      )}
    </div>
  );
};


export default function ObservabilityPage() {
  const searchParams = useSearchParams();
  const repoIdParam = searchParams.get("repo");

  const {
    data,
    loading,
    error,
    timeRange,
    fetchObservabilityData,
    setTimeRange,
    acknowledgeAlert,
  } = useObservabilityStore();

  const { repositories } = useGitHubStore();

  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(
    repoIdParam
  );
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);

  const initializedRepos = useMemo(
    () => repositories.filter((r) => r.initialised),
    [repositories]
  );

  useEffect(() => {
    if (!selectedRepoId && initializedRepos.length > 0) {
      setSelectedRepoId(initializedRepos[0].repoId.toString());
    }
  }, [initializedRepos, selectedRepoId]);

  useEffect(() => {
    if (selectedRepoId) {
      fetchObservabilityData(selectedRepoId);
    }
  }, [selectedRepoId, fetchObservabilityData]);

  const selectedRepo = repositories.find(
    (r) => r.repoId.toString() === selectedRepoId
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <RefreshCw
          className="w-8 h-8 animate-spin mb-4"
          style={{ color: "var(--color-primary)" }}
        />
        <p style={{ color: "var(--color-fg-secondary)" }}>
          Loading observability data...
        </p>
      </div>
    );
  }

  if (!data && !loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Activity
          className="w-12 h-12 mb-4"
          style={{ color: "var(--color-fg-secondary)" }}
        />
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: "var(--color-fg)" }}
        >
          No Repository Selected
        </h2>
        <p
          className="text-sm mb-4"
          style={{ color: "var(--color-fg-secondary)" }}
        >
          Select an initialized repository to view observability data
        </p>
        {initializedRepos.length === 0 && (
          <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>
            Initialize a repository from the Projects page first
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: "var(--color-fg)" }}
          >
            🔭 Observability
          </h1>
          <p className="text-sm" style={{ color: "var(--color-fg-secondary)" }}>
            Real-time code health monitoring & insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowRepoDropdown(!showRepoDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all"
              style={{
                background: "var(--color-bg-secondary)",
                borderColor: "var(--color-border)",
                color: "var(--color-fg)",
              }}
            >
              <GitCommit className="w-4 h-4" />
              <span className="text-sm">
                {selectedRepo?.repoName || "Select Repository"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showRepoDropdown && (
              <div
                className="absolute top-full mt-2 right-0 w-64 rounded-lg border shadow-lg z-50"
                style={{
                  background: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                }}
              >
                {initializedRepos.length === 0 ? (
                  <p
                    className="px-4 py-3 text-sm"
                    style={{ color: "var(--color-fg-secondary)" }}
                  >
                    No initialized repositories
                  </p>
                ) : (
                  initializedRepos.map((repo) => (
                    <button
                      key={repo.repoId}
                      onClick={() => {
                        setSelectedRepoId(repo.repoId.toString());
                        setShowRepoDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-bg-secondary)] transition-colors flex items-center justify-between"
                      style={{ color: "var(--color-fg)" }}
                    >
                      <span>{repo.repoName}</span>
                      {repo.repoId.toString() === selectedRepoId && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            onClick={() =>
              selectedRepoId && fetchObservabilityData(selectedRepoId)
            }
            className="p-2 rounded-lg border transition-colors hover:bg-[var(--color-bg-secondary)]"
            style={{ borderColor: "var(--color-border)" }}
          >
            <RefreshCw
              className="w-4 h-4"
              style={{ color: "var(--color-fg-secondary)" }}
            />
          </button>
        </div>
      </div>

      {data && (
        <>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity
                className="w-5 h-5"
                style={{ color: "var(--color-primary)" }}
              />
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--color-fg)" }}
              >
                Health Pulse
              </h2>
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                style={{
                  background: "var(--color-bg-tertiary)",
                  color: "var(--color-fg-secondary)",
                }}
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <HealthPulseCard
                metric={data.healthPulse.overall}
                icon={
                  <Activity
                    className="w-4 h-4"
                    style={{ color: "var(--color-primary)" }}
                  />
                }
              />
              <HealthPulseCard
                metric={data.healthPulse.security}
                icon={
                  <Shield
                    className="w-4 h-4"
                    style={{ color: "var(--color-fg-secondary)" }}
                  />
                }
              />
              <HealthPulseCard
                metric={data.healthPulse.performance}
                icon={
                  <Zap
                    className="w-4 h-4"
                    style={{ color: "var(--color-fg-secondary)" }}
                  />
                }
              />
              <HealthPulseCard
                metric={data.healthPulse.maintainability}
                icon={
                  <FileCode
                    className="w-4 h-4"
                    style={{ color: "var(--color-fg-secondary)" }}
                  />
                }
              />
              <HealthPulseCard
                metric={data.healthPulse.testCoverage}
                icon={
                  <TestTube
                    className="w-4 h-4"
                    style={{ color: "var(--color-fg-secondary)" }}
                  />
                }
              />
              <HealthPulseCard
                metric={data.healthPulse.documentation}
                icon={
                  <BookOpen
                    className="w-4 h-4"
                    style={{ color: "var(--color-fg-secondary)" }}
                  />
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <TimelineChart
                data={data.timeline}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
              />
            </div>
            <div
              className="p-5 rounded-xl border"
              style={{
                background: "var(--color-bg-secondary)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Brain
                  className="w-5 h-5"
                  style={{ color: "var(--color-primary)" }}
                />
                <h3
                  className="text-base font-semibold"
                  style={{ color: "var(--color-fg)" }}
                >
                  🔮 Predictions
                </h3>
              </div>
              <div className="space-y-4">
                {data.predictions.slice(0, 3).map((prediction, i) => (
                  <PredictionCard key={i} prediction={prediction} />
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <GitCommit
                className="w-5 h-5"
                style={{ color: "var(--color-primary)" }}
              />
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--color-fg)" }}
              >
                🔬 Change Impact Analysis
              </h2>
            </div>
            <div className="space-y-3">
              {data.recentCommits.map((commit) => (
                <CommitImpactCard key={commit.sha} commit={commit} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div
              className="p-5 rounded-xl border"
              style={{
                background: "var(--color-bg-secondary)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Folder
                  className="w-5 h-5"
                  style={{ color: "var(--color-primary)" }}
                />
                <h3
                  className="text-base font-semibold"
                  style={{ color: "var(--color-fg)" }}
                >
                  🗺️ Codebase Heatmap
                </h3>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <HeatmapTreeNode node={data.heatmap} />
              </div>
            </div>

            <div
              className="p-5 rounded-xl border"
              style={{
                background: "var(--color-bg-secondary)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <User
                  className="w-5 h-5"
                  style={{ color: "var(--color-primary)" }}
                />
                <h3
                  className="text-base font-semibold flex items-center gap-2"
                  style={{ color: "var(--color-fg)" }}
                >
                  <User size={18} style={{ color: "var(--color-primary)" }} />
                  Contributor Health
                </h3>
                <span
                  className="text-xs"
                  style={{ color: "var(--color-fg-muted)" }}
                >
                  This week
                </span>
              </div>
              <div
                className="divide-y"
                style={{ borderColor: "var(--color-border)" }}
              >
                {data.contributors.map((contributor, i) => (
                  <ContributorCard
                    key={contributor.userId}
                    contributor={contributor}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb
                className="w-5 h-5"
                style={{ color: "var(--color-primary)" }}
              />
              <h2
                className="text-lg font-semibold flex items-center gap-2"
                style={{ color: "var(--color-fg)" }}
              >
                <Target size={20} style={{ color: "var(--color-primary)" }} />
                Smart Recommendations
              </h2>
              <span
                className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: "var(--color-primary)", color: "white" }}
              >
                AI-Powered
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.recommendations.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </div>
          </div>

          <div
            className="p-5 rounded-xl border"
            style={{
              background: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell
                  className="w-5 h-5"
                  style={{ color: "var(--color-primary)" }}
                />
                <h3
                  className="text-base font-semibold"
                  style={{ color: "var(--color-fg)" }}
                >
                  ⏰ Health Alerts & Anomalies
                </h3>
                <span
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    background: "var(--color-bg-tertiary)",
                    color: "var(--color-fg-secondary)",
                  }}
                >
                  {data.alerts.filter((a) => !a.acknowledged).length} active
                </span>
              </div>
              <button
                className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  background: "var(--color-bg-tertiary)",
                  color: "var(--color-fg-secondary)",
                }}
              >
                Configure Alerts
              </button>
            </div>
            <div
              className="divide-y"
              style={{ borderColor: "var(--color-border)" }}
            >
              {data.alerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={acknowledgeAlert}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
