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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {isTrendingUp ? (
            <FiTrendingUp
              size={16}
              style={{ color: "var(--analytics-success)" }}
            />
          ) : (
            <FiTrendingDown
              size={16}
              style={{ color: "var(--analytics-error)" }}
            />
          )}
          <span
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
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
          style={{ fontSize: "0.6875rem" }}
        >
          {consistency}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <VelocityMetric
          label="Daily Avg"
          value={dailyAverage}
          unit="commits/day"
          icon={<FiActivity />}
        />
        <VelocityMetric
          label="30 Days"
          value={monthlyRate.toString()}
          unit="commits"
          icon={<FiActivity />}
        />
        <VelocityMetric
          label="Total"
          value={totalCommits.toLocaleString()}
          unit="lifetime"
          icon={<FiActivity />}
        />
        <VelocityMetric
          label="Active"
          value={activityRate}
          unit="% of year"
          icon={<FiActivity />}
        />
      </div>

      <div className="space-y-1.5">
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
      className="p-2 rounded"
      style={{
        background: "var(--analytics-card-hover)",
        border: "1px solid var(--analytics-border)",
      }}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <span style={{ color: "var(--analytics-accent)" }}>
          {React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 12 })}
        </span>
        <p
          style={{
            fontSize: "0.625rem",
            color: "var(--analytics-text-secondary)",
          }}
        >
          {label}
        </p>
      </div>
      <p
        style={{
          fontSize: "1rem",
          fontWeight: 700,
          color: "var(--analytics-text-primary)",
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: "0.625rem",
          color: "var(--analytics-text-tertiary)",
        }}
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
      <div className="flex items-center justify-between mb-0.5">
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--analytics-text-secondary)",
          }}
        >
          {label}
        </p>
        <span style={{ fontSize: "0.75rem", fontWeight: 600, color }}>
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
