import React from "react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  color: string;
}

export function MetricCard({
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

export function CollaborationMetric({
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
