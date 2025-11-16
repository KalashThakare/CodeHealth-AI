"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FiAlertCircle } from "react-icons/fi";
import { useTheme } from "@/hooks/useTheme";
import { getSeverityColor, getChartTheme } from "@/lib/chartTheme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CodeSmell {
  type: string;
  severity: string;
  affectedFiles: string[];
  rootCause: string;
  impact: string;
  estimatedFixTime: string;
}

interface CodeSmellsChartProps {
  codeSmells: CodeSmell[];
  overallHealth: string;
}

export default function CodeSmellsChart({
  codeSmells,
  overallHealth,
}: CodeSmellsChartProps) {
  const { isDark } = useTheme();
  const theme = getChartTheme(isDark);

  const getSeverityScore = (severity: string): number => {
    switch (severity.toLowerCase()) {
      case "critical":
        return 4;
      case "high":
        return 3;
      case "medium":
        return 2;
      case "low":
        return 1;
      default:
        return 0;
    }
  };

  const chartData = {
    labels: codeSmells.map((smell) => smell.type),
    datasets: [
      {
        label: "Affected Files",
        data: codeSmells.map((smell) => smell.affectedFiles.length),
        backgroundColor: codeSmells.map((smell) => {
          const color = getSeverityColor(smell.severity, isDark);
          return color + "CC"; // Add opacity
        }),
        borderColor: codeSmells.map((smell) =>
          getSeverityColor(smell.severity, isDark)
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme.tooltipBg,
        titleColor: theme.tooltipText,
        bodyColor: theme.tooltipText,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 6,
        titleFont: {
          size: 13,
          weight: 600 as const,
          family: "'Inter', system-ui, sans-serif",
        },
        bodyFont: {
          size: 12,
          family: "'Inter', system-ui, sans-serif",
        },
        callbacks: {
          label: function (context: any) {
            const smell = codeSmells[context.dataIndex];
            return [
              `Files: ${context.parsed.y}`,
              `Severity: ${smell.severity}`,
              `Fix Time: ${smell.estimatedFixTime}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: theme.textSecondary,
          font: {
            size: 10,
            family: "'Inter', system-ui, sans-serif",
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: theme.gridColor,
          drawBorder: false,
        },
        ticks: {
          color: theme.textSecondary,
          font: {
            size: 10,
            family: "'Inter', system-ui, sans-serif",
          },
          precision: 0,
        },
      },
    },
  };

  const totalAffectedFiles = codeSmells.reduce(
    (sum, smell) => sum + smell.affectedFiles.length,
    0
  );

  const criticalCount = codeSmells.filter(
    (s) => s.severity.toLowerCase() === "critical"
  ).length;

  const highCount = codeSmells.filter(
    (s) => s.severity.toLowerCase() === "high"
  ).length;

  return (
    <div className="space-y-3 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4
          className="analytics-text-base font-semibold"
          style={{ color: "var(--analytics-text-primary)" }}
        >
          Breakdown by Type
        </h4>
        <div className="flex items-center gap-2">
          <FiAlertCircle
            size={16}
            style={{
              color:
                criticalCount > 0
                  ? "var(--analytics-error)"
                  : highCount > 0
                  ? "var(--analytics-warning)"
                  : "var(--analytics-success)",
            }}
          />
          <span
            className="analytics-text-sm"
            style={{ color: "var(--analytics-text-secondary)" }}
          >
            {overallHealth}
          </span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div
          className="p-2 rounded"
          style={{ background: "var(--analytics-card-hover)" }}
        >
          <p
            className="analytics-text-xs"
            style={{ color: "var(--analytics-text-secondary)" }}
          >
            Total Smells
          </p>
          <p
            className="analytics-text-lg font-semibold"
            style={{ color: "var(--analytics-text-primary)" }}
          >
            {codeSmells.length}
          </p>
        </div>
        <div
          className="p-2 rounded"
          style={{ background: "var(--analytics-card-hover)" }}
        >
          <p
            className="analytics-text-xs"
            style={{ color: "var(--analytics-text-secondary)" }}
          >
            Affected Files
          </p>
          <p
            className="analytics-text-lg font-semibold"
            style={{ color: "var(--analytics-text-primary)" }}
          >
            {totalAffectedFiles}
          </p>
        </div>
        <div
          className="p-2 rounded"
          style={{ background: "var(--analytics-card-hover)" }}
        >
          <p
            className="analytics-text-xs"
            style={{ color: "var(--analytics-text-secondary)" }}
          >
            Critical Issues
          </p>
          <p
            className="analytics-text-lg font-semibold"
            style={{ color: "var(--analytics-error)" }}
          >
            {criticalCount}
          </p>
        </div>
      </div>

      {/* Chart */}
      {/* <div style={{ height: "250px" }}>
        <Bar data={chartData} options={options} />
      </div> */}

      {/* Severity Legend */}
      <div className="flex flex-wrap gap-2">
        {["critical", "high", "medium", "low"].map((severity) => {
          const count = codeSmells.filter(
            (s) => s.severity.toLowerCase() === severity
          ).length;
          if (count === 0) return null;
          return (
            <div key={severity} className="flex items-center gap-1">
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "2px",
                  background: getSeverityColor(severity, isDark),
                }}
              />
              <span
                className="analytics-text-xs"
                style={{ color: "var(--analytics-text-secondary)" }}
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)} ({count})
              </span>
            </div>
          );
        })}
      </div>

      {/* Details List */}
      <div className="space-y-2 analytics-mt-2">
        {codeSmells.map((smell, index) => (
          <div
            key={index}
            className="p-2 rounded border"
            style={{
              background: "var(--analytics-card-hover)",
              borderColor: getSeverityColor(smell.severity, isDark),
              borderWidth: "2px",
            }}
          >
            <div className="flex items-start justify-between analytics-mb-1">
              <h4
                className="analytics-text-sm font-semibold"
                style={{ color: "var(--analytics-text-primary)" }}
              >
                {smell.type}
              </h4>
              <span
                className="analytics-badge analytics-text-xs"
                style={{
                  background: getSeverityColor(smell.severity, isDark),
                  color: isDark ? "#000" : "#fff",
                  fontWeight: "600",
                }}
              >
                {smell.severity}
              </span>
            </div>
            <p
              className="analytics-text-xs analytics-mb-1"
              style={{ color: "var(--analytics-text-secondary)" }}
            >
              {smell.impact}
            </p>
            <div className="flex items-center justify-between analytics-text-xs">
              <span style={{ color: "var(--analytics-text-tertiary)" }}>
                {smell.affectedFiles.length} files • {smell.estimatedFixTime} to
                fix
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
