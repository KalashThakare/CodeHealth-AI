import React from "react";
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiTarget,
  FiActivity,
} from "react-icons/fi";

interface HealthStatusBannerProps {
  healthScore: number;
  strength: string;
  refactorCount: number;
  avgComplexity: number;
}

export function HealthStatusBanner({
  healthScore,
  strength,
  refactorCount,
  avgComplexity,
}: HealthStatusBannerProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        marginBottom: "20px",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          flex: "1",
          minWidth: "200px",
          padding: "12px 16px",
          background:
            healthScore >= 70
              ? "linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(34, 197, 94, 0.05))"
              : healthScore >= 50
              ? "linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05))"
              : "linear-gradient(135deg, rgba(248, 113, 113, 0.1), rgba(239, 68, 68, 0.05))",
          borderRadius: "10px",
          border: `1px solid ${
            healthScore >= 70
              ? "rgba(74, 222, 128, 0.3)"
              : healthScore >= 50
              ? "rgba(251, 191, 36, 0.3)"
              : "rgba(248, 113, 113, 0.3)"
          }`,
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {healthScore >= 70 ? (
          <FiCheckCircle
            size={20}
            style={{ color: "var(--analytics-success)", flexShrink: 0 }}
          />
        ) : healthScore >= 50 ? (
          <FiAlertTriangle
            size={20}
            style={{ color: "var(--analytics-warning)", flexShrink: 0 }}
          />
        ) : (
          <FiAlertTriangle
            size={20}
            style={{ color: "var(--analytics-error)", flexShrink: 0 }}
          />
        )}
        <div>
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--analytics-text-primary)",
            }}
          >
            {healthScore >= 70
              ? "Your codebase is healthy!"
              : healthScore >= 50
              ? "Some areas need attention"
              : "Critical issues detected"}
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--analytics-text-secondary)",
              marginLeft: "8px",
            }}
          >
            {strength || "Keep up the good work"}
          </span>
        </div>
      </div>

      {refactorCount > 0 && (
        <div
          style={{
            padding: "12px 16px",
            background: "var(--analytics-card-hover)",
            borderRadius: "10px",
            border: "1px solid var(--analytics-border)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FiTarget
            size={18}
            style={{ color: "var(--analytics-accent)", flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--analytics-text-secondary)",
            }}
          >
            <strong style={{ color: "var(--analytics-text-primary)" }}>
              {refactorCount}
            </strong>{" "}
            files flagged for refactoring
          </span>
        </div>
      )}

      {avgComplexity > 15 && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(251, 191, 36, 0.08)",
            borderRadius: "10px",
            border: "1px solid rgba(251, 191, 36, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FiActivity
            size={18}
            style={{ color: "var(--analytics-warning)", flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--analytics-text-secondary)",
            }}
          >
            Complexity is{" "}
            <strong style={{ color: "var(--analytics-warning)" }}>
              above average
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}
