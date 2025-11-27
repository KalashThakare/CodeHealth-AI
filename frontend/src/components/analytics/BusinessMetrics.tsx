"use client";

import React, { useMemo } from "react";
import { FullRepoAnalysis } from "@/store/analysisStore";
import {
  FiDollarSign,
  FiClock,
  FiAlertCircle,
  FiTrendingUp,
} from "react-icons/fi";
import { Lightbulb } from "lucide-react";

interface BusinessMetricsProps {
  analysis: FullRepoAnalysis;
  totalFiles: number;
  totalLOC: number;
}

export default function BusinessMetrics({
  analysis,
  totalFiles,
  totalLOC,
}: BusinessMetricsProps) {
  const { result, commitAnalysis, repoHealthScore } = analysis;

  // Calculate business metrics
  const businessMetrics = useMemo(() => {
    // Average cost per developer hour (industry standard: $75-150/hr)
    const DEV_HOURLY_RATE = 100;

    // Estimate refactoring cost based on high-risk files
    const highRiskFiles = result.refactorPriorityFiles.length;
    const avgComplexity = result.avgCyclomaticComplexity;

    // Estimate hours per file based on complexity and LOC
    const hoursPerFile = Math.max(
      2,
      Math.min(40, avgComplexity * 0.5 + totalLOC / totalFiles / 100)
    );
    const totalRefactoringHours = highRiskFiles * hoursPerFile;
    const estimatedCost = totalRefactoringHours * DEV_HOURLY_RATE;

    // Technical debt as developer-days (8 hours per day)
    const technicalDebtDays =
      (result.technicalDebtScore * totalFiles * 0.1) / 8;

    // Knowledge risk based on bus factor
    const knowledgeRisk = (() => {
      if (commitAnalysis.busFactor === "low") return "High Risk";
      if (commitAnalysis.busFactor === "medium") return "Medium Risk";
      if (commitAnalysis.busFactor === "high") return "Low Risk";
      return "Unknown";
    })();

    // Development efficiency score (0-100)
    const efficiencyScore = Math.round(
      result.avgMaintainabilityIndex * 0.4 +
        (100 - result.technicalDebtScore) * 0.3 +
        repoHealthScore.componentScores.codeQuality * 0.3
    );

    // Time saved per year with better maintainability
    const currentMaintTime =
      totalFiles * (100 - result.avgMaintainabilityIndex) * 0.02; // hours
    const potentialMaintTime = totalFiles * 20 * 0.02; // if maintainability was 80
    const timeSavedPerYear = Math.max(0, currentMaintTime - potentialMaintTime);
    const costSavingsPerYear = timeSavedPerYear * DEV_HOURLY_RATE;

    // ROI calculation
    const roi =
      estimatedCost > 0
        ? ((costSavingsPerYear - estimatedCost) / estimatedCost) * 100
        : 0;

    return {
      estimatedCost,
      totalRefactoringHours,
      technicalDebtDays,
      knowledgeRisk,
      efficiencyScore,
      costSavingsPerYear,
      roi,
      hoursPerFile,
    };
  }, [result, commitAnalysis, repoHealthScore, totalFiles, totalLOC]);

  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: "var(--analytics-card-hover)",
        border: "1px solid var(--analytics-border)",
      }}
    >
      <h3
        className="analytics-text-base font-semibold analytics-mb-3 flex items-center gap-2"
        style={{ color: "var(--analytics-text-primary)" }}
      >
        <FiTrendingUp size={18} style={{ color: "var(--analytics-accent)" }} />
        Business Impact Metrics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Estimated Refactoring Cost */}
        <div
          className="rounded-lg p-3"
          style={{
            background: "var(--analytics-card-bg)",
            border: "1px solid var(--analytics-border)",
          }}
        >
          <div
            className="flex items-center gap-1.5 analytics-text-xs analytics-mb-2"
            style={{ color: "var(--analytics-text-secondary)" }}
          >
            <FiDollarSign size={14} />
            Est. Refactoring Cost
          </div>
          <div
            className="analytics-text-xl font-bold"
            style={{ color: "var(--analytics-text-primary)" }}
          >
            ${businessMetrics.estimatedCost.toLocaleString()}
          </div>
          <div
            className="analytics-text-xs analytics-mt-1"
            style={{ color: "var(--analytics-text-tertiary)" }}
          >
            {businessMetrics.totalRefactoringHours.toFixed(0)} hours @ $100/hr
          </div>
        </div>

        {/* Technical Debt Time */}
        <div
          className="rounded-lg p-3"
          style={{
            background: "var(--analytics-card-bg)",
            border: "1px solid var(--analytics-border)",
          }}
        >
          <div
            className="flex items-center gap-1.5 analytics-text-xs analytics-mb-2"
            style={{ color: "var(--analytics-text-secondary)" }}
          >
            <FiClock size={14} />
            Technical Debt
          </div>
          <div
            className="analytics-text-xl font-bold"
            style={{ color: "var(--analytics-text-primary)" }}
          >
            {businessMetrics.technicalDebtDays.toFixed(1)} days
          </div>
          <div
            className="analytics-text-xs analytics-mt-1"
            style={{ color: "var(--analytics-text-tertiary)" }}
          >
            Developer time to address debt
          </div>
        </div>

        {/* Knowledge Risk */}
        <div
          className="rounded-lg p-3"
          style={{
            background: "var(--analytics-card-bg)",
            border: "1px solid var(--analytics-border)",
          }}
        >
          <div
            className="flex items-center gap-1.5 analytics-text-xs analytics-mb-2"
            style={{ color: "var(--analytics-text-secondary)" }}
          >
            <FiAlertCircle size={14} />
            Knowledge Risk
          </div>
          <div
            className="analytics-text-xl font-bold"
            style={{ color: "var(--analytics-text-primary)" }}
          >
            {businessMetrics.knowledgeRisk}
          </div>
          <div
            className="analytics-text-xs analytics-mt-1"
            style={{ color: "var(--analytics-text-tertiary)" }}
          >
            Bus factor: {commitAnalysis.busFactor}
          </div>
        </div>

        {/* Development Efficiency */}
        <div
          className="rounded-lg p-3"
          style={{
            background: "var(--analytics-card-bg)",
            border: "1px solid var(--analytics-border)",
          }}
        >
          <div
            className="flex items-center gap-1.5 analytics-text-xs analytics-mb-2"
            style={{ color: "var(--analytics-text-secondary)" }}
          >
            <FiTrendingUp size={14} />
            Dev Efficiency
          </div>
          <div
            className="analytics-text-xl font-bold"
            style={{ color: "var(--analytics-text-primary)" }}
          >
            {businessMetrics.efficiencyScore}/100
          </div>
          <div
            className="analytics-text-xs analytics-mt-1"
            style={{ color: "var(--analytics-text-tertiary)" }}
          >
            Code maintainability impact
          </div>
        </div>
      </div>

      {/* ROI Calculation - Compact */}
      <div
        className="analytics-mt-3 p-3 rounded-lg"
        style={{
          background: "var(--analytics-card-bg)",
          border: "1px solid var(--analytics-border)",
        }}
      >
        <h4
          className="analytics-text-sm font-semibold analytics-mb-2 flex items-center gap-1"
          style={{ color: "var(--analytics-text-primary)" }}
        >
          <Lightbulb className="w-4 h-4" /> Investment Analysis
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 analytics-text-sm">
          <div>
            <span style={{ color: "var(--analytics-text-secondary)" }}>
              Potential Annual Savings:
            </span>
            <div
              className="analytics-text-base font-semibold"
              style={{ color: "var(--analytics-success)" }}
            >
              ${businessMetrics.costSavingsPerYear.toLocaleString()}
            </div>
          </div>
          <div>
            <span style={{ color: "var(--analytics-text-secondary)" }}>
              Refactoring Investment:
            </span>
            <div
              className="analytics-text-base font-semibold"
              style={{ color: "var(--analytics-accent)" }}
            >
              ${businessMetrics.estimatedCost.toLocaleString()}
            </div>
          </div>
          <div>
            <span style={{ color: "var(--analytics-text-secondary)" }}>
              ROI (First Year):
            </span>
            <div
              className="analytics-text-base font-semibold"
              style={{
                color:
                  businessMetrics.roi > 0
                    ? "var(--analytics-success)"
                    : "var(--analytics-error)",
              }}
            >
              {businessMetrics.roi > 0 ? "+" : ""}
              {businessMetrics.roi.toFixed(1)}%
            </div>
          </div>
        </div>
        <p
          className="analytics-text-xs analytics-mt-2"
          style={{ color: "var(--analytics-text-tertiary)" }}
        >
          * Estimates based on industry averages ($100/hr developer rate,{" "}
          {businessMetrics.hoursPerFile.toFixed(1)} hours per high-risk file).
          Actual costs may vary based on team expertise and project complexity.
        </p>
      </div>
    </div>
  );
}
