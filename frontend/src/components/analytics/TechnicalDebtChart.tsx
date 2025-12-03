"use client";

import React from "react";
import { FiAlertTriangle, FiTool, FiClock, FiDollarSign } from "react-icons/fi";

interface TechnicalDebtChartProps {
  result: {
    technicalDebtScore: number;
    refactorPriorityFiles: Array<{
      path: string;
      riskScore: number;
      cyclomaticComplexity: number;
      maintainabilityIndex: number;
    }>;
    avgCyclomaticComplexity: number;
    avgMaintainabilityIndex: number;
  };
}

export default function TechnicalDebtChart({
  result,
}: TechnicalDebtChartProps) {
  const {
    technicalDebtScore,
    refactorPriorityFiles,
    avgCyclomaticComplexity,
    avgMaintainabilityIndex,
  } = result;

  const criticalFiles = refactorPriorityFiles.filter(
    (f) => f.riskScore > 7
  ).length;
  const highRiskFiles = refactorPriorityFiles.filter(
    (f) => f.riskScore > 5 && f.riskScore <= 7
  ).length;
  const mediumRiskFiles = refactorPriorityFiles.filter(
    (f) => f.riskScore <= 5
  ).length;

  const estimatedHours = refactorPriorityFiles.length * 3;
  const estimatedCost = estimatedHours * 100;
  const estimatedDays = Math.ceil(estimatedHours / 8);

  const debtLevel =
    technicalDebtScore > 70
      ? "Critical"
      : technicalDebtScore > 50
      ? "High"
      : technicalDebtScore > 30
      ? "Moderate"
      : "Low";

  const debtColor =
    technicalDebtScore > 70
      ? "var(--analytics-error)"
      : technicalDebtScore > 50
      ? "var(--analytics-warning)"
      : technicalDebtScore > 30
      ? "var(--analytics-info)"
      : "var(--analytics-success)";

  return (
    <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
      <div className="text-center" style={{ flexShrink: 0 }}>
        <div className="relative inline-block">
          <svg width="150" height="150" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--analytics-border)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={debtColor}
              strokeWidth="8"
              strokeDasharray={`${(technicalDebtScore / 100) * 263.9} 263.9`}
              strokeDashoffset="0"
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dasharray 0.8s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              style={{ fontSize: "1.75rem", fontWeight: 700, color: debtColor }}
            >
              {technicalDebtScore.toFixed(0)}%
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "var(--analytics-text-secondary)",
              }}
            >
              {debtLevel}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div className="grid grid-cols-3 gap-3">
          <DebtCategory
            label="Critical"
            count={criticalFiles}
            color="var(--analytics-error)"
            info="Urgent fixes needed"
            percentage={
              (criticalFiles / (refactorPriorityFiles.length || 1)) * 100
            }
          />
          <DebtCategory
            label="High"
            count={highRiskFiles}
            color="var(--analytics-warning)"
            info="Should fix soon"
            percentage={
              (highRiskFiles / (refactorPriorityFiles.length || 1)) * 100
            }
          />
          <DebtCategory
            label="Medium"
            count={mediumRiskFiles}
            color="var(--analytics-info)"
            info="Plan to address"
            percentage={
              (mediumRiskFiles / (refactorPriorityFiles.length || 1)) * 100
            }
          />
        </div>

        <div
          className="p-3 rounded"
          style={{
            background: "var(--analytics-card-hover)",
            border: "1px solid var(--analytics-border)",
          }}
        >
          <h4
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
              color: "var(--analytics-text-primary)",
            }}
          >
            Refactoring Estimate
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <ImpactMetric
              icon={<FiClock />}
              value={`${estimatedDays}d`}
              label="Time"
              info="Dev days required"
            />
            <ImpactMetric
              icon={<FiDollarSign />}
              value={`$${(estimatedCost / 1000).toFixed(0)}k`}
              label="Cost"
              info="Estimated expense"
            />
            <ImpactMetric
              icon={<FiTool />}
              value={refactorPriorityFiles.length.toString()}
              label="Files"
              info="Need refactoring"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DebtCategory({
  label,
  count,
  color,
  info,
  percentage,
}: {
  label: string;
  count: number;
  color: string;
  info?: string;
  percentage: number;
}) {
  return (
    <div
      className="p-2 rounded text-center"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}30`,
      }}
    >
      <p
        style={{
          fontSize: "1.125rem",
          fontWeight: 700,
          marginBottom: "0.125rem",
          color,
        }}
      >
        {count}
      </p>
      <p
        style={{
          fontSize: "0.7rem",
          fontWeight: 500,
          color: "var(--analytics-text-secondary)",
        }}
      >
        {label}
      </p>
      {info && (
        <p
          style={{
            fontSize: "0.6rem",
            color: "var(--analytics-text-tertiary)",
            marginTop: "4px",
          }}
        >
          {info}
        </p>
      )}
    </div>
  );
}

function ImpactMetric({
  icon,
  value,
  label,
  info,
}: {
  icon: React.ReactElement<{ size?: number }>;
  value: string;
  label: string;
  info?: string;
}) {
  return (
    <div className="text-center">
      <div
        className="flex items-center justify-center"
        style={{ marginBottom: "0.25rem" }}
      >
        <span style={{ color: "var(--analytics-accent)" }}>
          {React.cloneElement(icon, { size: 14 })}
        </span>
      </div>
      <p
        style={{
          fontSize: "0.9rem",
          fontWeight: 700,
          color: "var(--analytics-text-primary)",
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: "0.65rem",
          color: "var(--analytics-text-secondary)",
        }}
      >
        {label}
      </p>
      {info && (
        <p
          style={{
            fontSize: "0.55rem",
            color: "var(--analytics-text-tertiary)",
            marginTop: "2px",
          }}
        >
          {info}
        </p>
      )}
    </div>
  );
}
