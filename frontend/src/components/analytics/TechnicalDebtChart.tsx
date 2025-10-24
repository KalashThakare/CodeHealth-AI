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

  // Calculate debt categories
  const criticalFiles = refactorPriorityFiles.filter(
    (f) => f.riskScore > 7
  ).length;
  const highRiskFiles = refactorPriorityFiles.filter(
    (f) => f.riskScore > 5 && f.riskScore <= 7
  ).length;
  const mediumRiskFiles = refactorPriorityFiles.filter(
    (f) => f.riskScore <= 5
  ).length;

  // Estimate refactoring effort (business impact)
  const estimatedHours = refactorPriorityFiles.length * 3; // Avg 3 hours per file
  const estimatedCost = estimatedHours * 100; // $100/hour average
  const estimatedDays = Math.ceil(estimatedHours / 8);

  // Debt severity
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
    <div className="space-y-3">
      {/* Debt Score Header - Compact */}
      <div className="text-center">
        <div className="relative inline-block">
          <svg width="140" height="140" viewBox="0 0 140 140">
            {/* Background Circle */}
            <circle
              cx="70"
              cy="70"
              r="60"
              fill="none"
              stroke="var(--analytics-border)"
              strokeWidth="10"
            />
            {/* Debt Score Arc */}
            <circle
              cx="70"
              cy="70"
              r="60"
              fill="none"
              stroke={debtColor}
              strokeWidth="10"
              strokeDasharray={`${(technicalDebtScore / 100) * 376.8} 376.8`}
              strokeDashoffset="0"
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
              style={{ transition: "stroke-dasharray 1s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: debtColor }}>
              {technicalDebtScore.toFixed(0)}%
            </span>
            <span
              className="analytics-text-xs font-medium"
              style={{ color: "var(--analytics-text-secondary)" }}
            >
              {debtLevel} Debt
            </span>
          </div>
        </div>
      </div>

      {/* Debt Categories - Compact */}
      <div className="grid grid-cols-3 gap-2">
        <DebtCategory
          label="Critical"
          count={criticalFiles}
          color="var(--analytics-error)"
          percentage={
            (criticalFiles / (refactorPriorityFiles.length || 1)) * 100
          }
        />
        <DebtCategory
          label="High"
          count={highRiskFiles}
          color="var(--analytics-warning)"
          percentage={
            (highRiskFiles / (refactorPriorityFiles.length || 1)) * 100
          }
        />
        <DebtCategory
          label="Medium"
          count={mediumRiskFiles}
          color="var(--analytics-info)"
          percentage={
            (mediumRiskFiles / (refactorPriorityFiles.length || 1)) * 100
          }
        />
      </div>

      {/* Business Impact - Compact */}
      <div
        className="p-3 rounded-lg"
        style={{
          background: "var(--analytics-card-hover)",
          border: "1px solid var(--analytics-border)",
        }}
      >
        <h4
          className="analytics-text-sm font-semibold analytics-mb-2"
          style={{ color: "var(--analytics-text-primary)" }}
        >
          Estimated Refactoring Impact
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <ImpactMetric
            icon={<FiClock />}
            value={`${estimatedDays}d`}
            label="Time Required"
          />
          <ImpactMetric
            icon={<FiDollarSign />}
            value={`$${(estimatedCost / 1000).toFixed(0)}k`}
            label="Est. Cost"
          />
          <ImpactMetric
            icon={<FiTool />}
            value={refactorPriorityFiles.length.toString()}
            label="Files to Fix"
          />
        </div>
      </div>

      {/* Actionable Insight - Compact */}
      <div
        className="p-3 rounded-lg"
        style={{
          background: debtColor + "15",
          border: `1px solid ${debtColor}40`,
        }}
      >
        <div className="flex items-start gap-2">
          <FiAlertTriangle
            className="mt-0.5 flex-shrink-0"
            size={14}
            style={{ color: debtColor }}
          />
          <div>
            <p
              className="analytics-text-sm font-semibold analytics-mb-1"
              style={{ color: debtColor }}
            >
              Action Required
            </p>
            <p
              className="analytics-text-sm"
              style={{ color: "var(--analytics-text-secondary)" }}
            >
              {technicalDebtScore > 70
                ? "Immediate refactoring recommended. High debt is slowing development velocity."
                : technicalDebtScore > 50
                ? "Schedule refactoring sprints to reduce complexity in critical files."
                : technicalDebtScore > 30
                ? "Manageable debt levels. Monitor high-risk files during regular reviews."
                : "Excellent code health. Maintain current practices and code review standards."}
            </p>
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
  percentage,
}: {
  label: string;
  count: number;
  color: string;
  percentage: number;
}) {
  return (
    <div
      className="p-2.5 rounded-lg text-center"
      style={{
        background: `${color}15`,
        border: `1px solid ${color}40`,
      }}
    >
      <p
        className="analytics-text-xl font-bold analytics-mb-1"
        style={{ color }}
      >
        {count}
      </p>
      <p
        className="analytics-text-xs analytics-mb-1"
        style={{ color: "var(--analytics-text-secondary)" }}
      >
        {label}
      </p>
      <div
        className="h-1 rounded-full"
        style={{ background: "var(--analytics-border)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${percentage.toFixed(0)}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

function ImpactMetric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center analytics-mb-1">
        <span style={{ color: "var(--analytics-accent)" }}>
          {React.cloneElement(icon as React.ReactElement, { size: 16 })}
        </span>
      </div>
      <p
        className="analytics-text-base font-bold"
        style={{ color: "var(--analytics-text-primary)" }}
      >
        {value}
      </p>
      <p
        className="analytics-text-xs"
        style={{ color: "var(--analytics-text-tertiary)" }}
      >
        {label}
      </p>
    </div>
  );
}
