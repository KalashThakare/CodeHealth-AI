"use client";

import React from "react";
import { FiTrendingUp, FiTrendingDown, FiActivity } from "react-icons/fi";

interface VelocityTrendChartProps {
  commitAnalysis: {
    totalCommits: number;
    avgCommitsPerDay: number;
    recentCommits30Days: number;
    activeDays: number;
    velocity?: {
      trend: string;
      consistency: string;
    };
  };
}

export default function VelocityTrendChart({
  commitAnalysis,
}: VelocityTrendChartProps) {
  const {
    totalCommits,
    avgCommitsPerDay,
    recentCommits30Days,
    activeDays,
    velocity,
  } = commitAnalysis;

  // Calculate velocity metrics
  const dailyAverage = avgCommitsPerDay.toFixed(2);
  const monthlyRate = recentCommits30Days;
  const activityRate = ((activeDays / 365) * 100).toFixed(1);

  const trend = velocity?.trend || "Stable";
  const consistency = velocity?.consistency || "Medium";

  const isTrendingUp =
    trend.toLowerCase().includes("increas") ||
    trend.toLowerCase().includes("improv");
  const isConsistent =
    consistency.toLowerCase() === "high" ||
    consistency.toLowerCase() === "stable";

  return (
    <div className="space-y-3">
      {/* Trend Indicator - Compact */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isTrendingUp ? (
            <FiTrendingUp
              size={20}
              style={{ color: "var(--analytics-success)" }}
            />
          ) : (
            <FiTrendingDown
              size={20}
              style={{ color: "var(--analytics-error)" }}
            />
          )}
          <span
            className="analytics-text-base font-semibold"
            style={{
              color: isTrendingUp
                ? "var(--analytics-success)"
                : "var(--analytics-error)",
            }}
          >
            {trend}
          </span>
        </div>
        <span
          className={`analytics-badge ${
            isConsistent ? "analytics-badge-success" : "analytics-badge-warning"
          }`}
        >
          Consistency: {consistency}
        </span>
      </div>

      {/* Metrics Grid - Compact */}
      <div className="grid grid-cols-2 gap-2">
        <VelocityMetric
          label="Daily Average"
          value={dailyAverage}
          unit="commits/day"
          icon={<FiActivity />}
        />
        <VelocityMetric
          label="Last 30 Days"
          value={monthlyRate.toString()}
          unit="commits"
          icon={<FiActivity />}
        />
        <VelocityMetric
          label="Total Commits"
          value={totalCommits.toLocaleString()}
          unit="lifetime"
          icon={<FiActivity />}
        />
        <VelocityMetric
          label="Active Days"
          value={activityRate}
          unit="% of year"
          icon={<FiActivity />}
        />
      </div>

      {/* Visual Bar Chart - Compact */}
      <div className="space-y-2">
        <VelocityBar
          label="Recent Activity"
          percentage={(recentCommits30Days / (totalCommits || 1)) * 100}
          color="var(--analytics-accent)"
        />
        <VelocityBar
          label="Activity Rate"
          percentage={parseFloat(activityRate)}
          color="var(--analytics-success)"
        />
        <VelocityBar
          label="Consistency Score"
          percentage={isConsistent ? 85 : 60}
          color="var(--analytics-info)"
        />
      </div>

      {/* Insight - Compact */}
      <div
        className="p-3 rounded-lg"
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
            Insight:
          </strong>{" "}
          {avgCommitsPerDay > 2
            ? "High development velocity indicates active feature development."
            : avgCommitsPerDay > 1
            ? "Moderate development pace with room for optimization."
            : "Low commit frequency may indicate infrequent updates or large batch commits."}
        </p>
      </div>
    </div>
  );
}

function VelocityMetric({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="p-2.5 rounded-lg"
      style={{
        background: "var(--analytics-card-hover)",
        border: "1px solid var(--analytics-border)",
      }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ color: "var(--analytics-accent)" }}>
          {React.cloneElement(icon as React.ReactElement, { size: 14 })}
        </span>
        <p
          className="analytics-text-xs"
          style={{ color: "var(--analytics-text-secondary)" }}
        >
          {label}
        </p>
      </div>
      <p
        className="analytics-text-lg font-bold"
        style={{ color: "var(--analytics-text-primary)" }}
      >
        {value}
      </p>
      <p
        className="analytics-text-xs"
        style={{ color: "var(--analytics-text-tertiary)" }}
      >
        {unit}
      </p>
    </div>
  );
}

function VelocityBar({
  label,
  percentage,
  color,
}: {
  label: string;
  percentage: number;
  color: string;
}) {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p
          className="analytics-text-sm"
          style={{ color: "var(--analytics-text-secondary)" }}
        >
          {label}
        </p>
        <span className="analytics-text-sm font-semibold" style={{ color }}>
          {clampedPercentage.toFixed(1)}%
        </span>
      </div>
      <div className="analytics-progress-bar">
        <div
          className="analytics-progress-fill"
          style={{
            width: `${clampedPercentage}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}
