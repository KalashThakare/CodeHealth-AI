import React from "react";
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiArrowRight,
} from "react-icons/fi";

interface InsightCardProps {
  type: "success" | "warning" | "danger" | "info";
  title: string;
  message: string;
  action?: string;
  icon?: React.ReactNode;
}

export function InsightCard({
  type,
  title,
  message,
  action,
  icon,
}: InsightCardProps) {
  const typeStyles = {
    success: {
      bg: "var(--insight-success-bg)",
      border: "var(--insight-success-border)",
      icon: <FiCheckCircle />,
    },
    warning: {
      bg: "var(--insight-warning-bg)",
      border: "var(--insight-warning-border)",
      icon: <FiAlertTriangle />,
    },
    danger: {
      bg: "var(--insight-danger-bg)",
      border: "var(--insight-danger-border)",
      icon: <FiAlertTriangle />,
    },
    info: {
      bg: "var(--insight-info-bg)",
      border: "var(--insight-info-border)",
      icon: <FiInfo />,
    },
  };

  const style = typeStyles[type];

  return (
    <div className={`insight-card insight-card-${type}`}>
      <div className="insight-card-icon">{icon || style.icon}</div>
      <div className="insight-card-content">
        <h4>{title}</h4>
        <p>{message}</p>
        {action && (
          <span className="insight-card-action">
            {action} <FiArrowRight size={12} />
          </span>
        )}
      </div>
    </div>
  );
}
