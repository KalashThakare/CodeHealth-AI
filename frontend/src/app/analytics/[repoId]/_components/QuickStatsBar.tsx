import React from "react";
import { FiClock, FiArrowUp, FiArrowDown, FiMinus } from "react-icons/fi";
import { formatRelativeTime } from "./utils/helpers";

interface TrendIndicatorProps {
  current: number;
  baseline: number;
  higherIsBetter?: boolean;
  suffix?: string;
}

export function TrendIndicator({
  current,
  baseline,
  higherIsBetter = true,
  suffix = "",
}: TrendIndicatorProps) {
  const diff = current - baseline;
  const percentChange = baseline !== 0 ? (diff / baseline) * 100 : 0;
  const isPositive = higherIsBetter ? diff > 0 : diff < 0;
  const isNeutral = Math.abs(percentChange) < 1;

  if (isNeutral) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "2px",
          fontSize: "0.7rem",
          color: "var(--analytics-text-tertiary)",
          marginLeft: "6px",
        }}
      >
        <FiMinus size={10} />
        <span>stable</span>
      </span>
    );
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        fontSize: "0.7rem",
        color: isPositive
          ? "var(--analytics-success)"
          : "var(--analytics-error)",
        marginLeft: "6px",
      }}
    >
      {diff > 0 ? <FiArrowUp size={10} /> : <FiArrowDown size={10} />}
      <span>
        {Math.abs(percentChange).toFixed(1)}%{suffix}
      </span>
    </span>
  );
}

interface QuickStatsBarProps {
  stats: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: { current: number; baseline: number; higherIsBetter?: boolean };
  }[];
  lastAnalyzed?: string;
}

export function QuickStatsBar({ stats, lastAnalyzed }: QuickStatsBarProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      {lastAnalyzed && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            background: "var(--analytics-card-hover)",
            borderRadius: "20px",
            border: "1px solid var(--analytics-border)",
          }}
        >
          <FiClock size={12} style={{ color: "var(--analytics-accent)" }} />
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--analytics-text-secondary)",
            }}
          >
            Analyzed {formatRelativeTime(lastAnalyzed)}
          </span>
        </div>
      )}

      <div className="quick-stats-bar">
        {stats.map((stat, idx) => (
          <div key={idx} className="quick-stat-item">
            <span className="quick-stat-icon">{stat.icon}</span>
            <span className="quick-stat-value">
              {stat.value}
              {stat.trend && (
                <TrendIndicator
                  current={stat.trend.current}
                  baseline={stat.trend.baseline}
                  higherIsBetter={stat.trend.higherIsBetter}
                />
              )}
            </span>
            <span className="quick-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
