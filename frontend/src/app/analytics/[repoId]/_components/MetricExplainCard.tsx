import React from "react";
import {
  FiStar,
  FiCheckCircle,
  FiAlertTriangle,
  FiTool,
  FiArrowUp,
  FiArrowDown,
  FiMinus,
  FiTarget,
} from "react-icons/fi";
import { EducationalTooltip } from "./EducationalTooltip";

interface MetricExplainCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  status: "excellent" | "good" | "fair" | "poor" | "critical";
  explanation: string;
  recommendation?: string;
  trend?: "up" | "down" | "stable";
  glossaryKey?: string;
}

export function MetricExplainCard({
  icon,
  title,
  value,
  status,
  explanation,
  recommendation,
  trend,
  glossaryKey,
}: MetricExplainCardProps) {
  const statusConfig = {
    excellent: {
      color: "#4ade80",
      bg: "rgba(74, 222, 128, 0.1)",
      label: "Excellent",
      icon: <FiStar size={10} />,
    },
    good: {
      color: "#a3e635",
      bg: "rgba(163, 230, 53, 0.1)",
      label: "Good",
      icon: <FiCheckCircle size={10} />,
    },
    fair: {
      color: "#fbbf24",
      bg: "rgba(251, 191, 36, 0.1)",
      label: "Fair",
      icon: <FiAlertTriangle size={10} />,
    },
    poor: {
      color: "#fb923c",
      bg: "rgba(251, 146, 60, 0.1)",
      label: "Needs Work",
      icon: <FiTool size={10} />,
    },
    critical: {
      color: "#f87171",
      bg: "rgba(248, 113, 113, 0.1)",
      label: "Critical",
      icon: <FiAlertTriangle size={10} />,
    },
  };

  const config = statusConfig[status];

  const titleContent = glossaryKey ? (
    <EducationalTooltip termKey={glossaryKey}>
      <span>{title}</span>
    </EducationalTooltip>
  ) : (
    title
  );

  return (
    <div className="metric-explain-card">
      <div className="metric-explain-header">
        <div
          className="metric-explain-icon"
          style={{ background: config.bg, color: config.color }}
        >
          {icon}
        </div>
        <div className="metric-explain-title-group">
          <h4 className="metric-explain-title">{titleContent}</h4>
          <span
            className="metric-explain-status"
            style={{ color: config.color }}
          >
            {config.icon} {config.label}
          </span>
        </div>
        {trend && (
          <div className={`metric-explain-trend trend-${trend}`}>
            {trend === "up" ? (
              <FiArrowUp />
            ) : trend === "down" ? (
              <FiArrowDown />
            ) : (
              <FiMinus />
            )}
          </div>
        )}
      </div>
      <div className="metric-explain-value" style={{ color: config.color }}>
        {value}
      </div>
      <p className="metric-explain-text">{explanation}</p>
      {recommendation && (
        <div className="metric-explain-recommendation">
          <FiTarget size={14} />
          <span>{recommendation}</span>
        </div>
      )}
    </div>
  );
}
