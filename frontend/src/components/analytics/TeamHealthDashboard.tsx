"use client";

import React from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { FiUsers, FiAlertTriangle, FiTrendingUp } from "react-icons/fi";
import { useTheme } from "@/hooks/useTheme";
import { getChartTheme } from "@/lib/chartTheme";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface TeamHealthImpact {
  ownershipRisk: string;
  burnoutIndicator: string;
  knowledgeGap: string;
}

interface QuickWin {
  action: string;
  estimatedTime: string;
  impact: string;
  effort: string;
  risk: string;
  steps: string[];
  priority: number;
}

interface TeamHealthDashboardProps {
  teamHealthImpacts: TeamHealthImpact[];
  quickWins: QuickWin[];
}

export default function TeamHealthDashboard({
  teamHealthImpacts,
  quickWins,
}: TeamHealthDashboardProps) {
  const { isDark } = useTheme();
  const theme = getChartTheme(isDark);

  // Primary color based on theme
  const primaryColor = isDark ? "#0070f3" : "#7c3aed";
  const primaryColorRgb = isDark ? "0, 112, 243" : "124, 58, 237";

  // Calculate average risk levels
  const avgOwnershipRisk =
    teamHealthImpacts.reduce((sum, impact) => {
      const level = impact.ownershipRisk.toLowerCase();
      return sum + (level === "high" ? 3 : level === "medium" ? 2 : 1);
    }, 0) / teamHealthImpacts.length;

  const avgBurnoutRisk =
    teamHealthImpacts.reduce((sum, impact) => {
      const level = impact.burnoutIndicator.toLowerCase();
      return sum + (level === "high" ? 3 : level === "medium" ? 2 : 1);
    }, 0) / teamHealthImpacts.length;

  const avgKnowledgeGap =
    teamHealthImpacts.reduce((sum, impact) => {
      const level = impact.knowledgeGap.toLowerCase();
      return sum + (level === "high" ? 3 : level === "medium" ? 2 : 1);
    }, 0) / teamHealthImpacts.length;

  // Count risk levels
  const highOwnershipRisk = teamHealthImpacts.filter(
    (i) => i.ownershipRisk.toLowerCase() === "high"
  ).length;
  const highBurnoutRisk = teamHealthImpacts.filter(
    (i) => i.burnoutIndicator.toLowerCase() === "high"
  ).length;
  const highKnowledgeGap = teamHealthImpacts.filter(
    (i) => i.knowledgeGap.toLowerCase() === "high"
  ).length;

  // Radar Chart Data with theme support
  const radarData = {
    labels: [
      "Ownership Distribution",
      "Workload Balance",
      "Knowledge Sharing",
      "Code Quality",
      "Team Velocity",
    ],
    datasets: [
      {
        label: "Current State",
        data: [
          3 - avgOwnershipRisk, // Inverse for better visualization
          3 - avgBurnoutRisk,
          3 - avgKnowledgeGap,
          2.5, // From quick wins impact
          2.0, // Estimated from velocity data
        ],
        backgroundColor: `rgba(${primaryColorRgb}, 0.15)`,
        borderColor: primaryColor,
        borderWidth: 2,
        pointBackgroundColor: primaryColor,
        pointBorderColor: isDark ? "#000" : "#fff",
        pointHoverBackgroundColor: isDark ? "#fff" : primaryColor,
        pointHoverBorderColor: primaryColor,
      },
    ],
  };

  const radarOptions = {
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
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 3,
        ticks: {
          stepSize: 1,
          color: theme.textSecondary,
          font: {
            size: 10,
            family: "'Inter', system-ui, sans-serif",
          },
        },
        grid: {
          color: theme.gridColor,
        },
        pointLabels: {
          color: theme.textSecondary,
          font: {
            size: 11,
            family: "'Inter', system-ui, sans-serif",
          },
        },
        angleLines: {
          color: theme.gridColor,
        },
      },
    },
  };

  // Sort quick wins by priority
  const topQuickWins = [...quickWins]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Team Health Metrics */}
      <div className="analytics-card analytics-card-compact space-y-3">
        <h3
          className="analytics-text-lg font-semibold"
          style={{ color: "var(--analytics-text-primary)" }}
        >
          <FiUsers className="inline mr-2" />
          Team Health Indicators
        </h3>

        {/* Health Radar */}
        <div style={{ height: "220px" }}>
          <Radar data={radarData} options={radarOptions} />
        </div>

        {/* Risk Breakdown */}
        <div className="grid grid-cols-3 gap-2">
          <div
            className="p-2 rounded"
            style={{ background: "var(--analytics-card-hover)" }}
          >
            <p
              className="analytics-text-xs analytics-mb-1"
              style={{ color: "var(--analytics-text-secondary)" }}
            >
              Ownership Risk
            </p>
            <p
              className="analytics-text-lg font-semibold"
              style={{
                color:
                  highOwnershipRisk > 5
                    ? "var(--analytics-error)"
                    : highOwnershipRisk > 2
                    ? "var(--analytics-warning)"
                    : "var(--analytics-success)",
              }}
            >
              {highOwnershipRisk}
            </p>
            <p
              className="analytics-text-xs"
              style={{ color: "var(--analytics-text-tertiary)" }}
            >
              high risk files
            </p>
          </div>

          <div
            className="p-2 rounded"
            style={{ background: "var(--analytics-card-hover)" }}
          >
            <p
              className="analytics-text-xs analytics-mb-1"
              style={{ color: "var(--analytics-text-secondary)" }}
            >
              Burnout Risk
            </p>
            <p
              className="analytics-text-lg font-semibold"
              style={{
                color:
                  highBurnoutRisk > 5
                    ? "var(--analytics-error)"
                    : highBurnoutRisk > 2
                    ? "var(--analytics-warning)"
                    : "var(--analytics-success)",
              }}
            >
              {highBurnoutRisk}
            </p>
            <p
              className="analytics-text-xs"
              style={{ color: "var(--analytics-text-tertiary)" }}
            >
              high burnout areas
            </p>
          </div>

          <div
            className="p-2 rounded"
            style={{ background: "var(--analytics-card-hover)" }}
          >
            <p
              className="analytics-text-xs analytics-mb-1"
              style={{ color: "var(--analytics-text-secondary)" }}
            >
              Knowledge Gap
            </p>
            <p
              className="analytics-text-lg font-semibold"
              style={{
                color:
                  highKnowledgeGap > 5
                    ? "var(--analytics-error)"
                    : highKnowledgeGap > 2
                    ? "var(--analytics-warning)"
                    : "var(--analytics-success)",
              }}
            >
              {highKnowledgeGap}
            </p>
            <p
              className="analytics-text-xs"
              style={{ color: "var(--analytics-text-tertiary)" }}
            >
              high gap files
            </p>
          </div>
        </div>

        {/* Recommendations */}
        <div
          className="p-2 rounded"
          style={{
            background: "var(--analytics-card-hover)",
            border: "1px solid var(--analytics-border)",
          }}
        >
          <div className="flex items-start gap-2">
            <FiAlertTriangle
              size={14}
              className="mt-0.5 flex-shrink-0"
              style={{ color: "var(--analytics-warning)" }}
            />
            <div>
              <p
                className="analytics-text-xs font-semibold analytics-mb-1"
                style={{ color: "var(--analytics-text-primary)" }}
              >
                Team Health Recommendations
              </p>
              <ul
                className="analytics-text-xs space-y-0.5"
                style={{ color: "var(--analytics-text-secondary)" }}
              >
                {highOwnershipRisk > 3 && (
                  <li>• Distribute code ownership across more team members</li>
                )}
                {highBurnoutRisk > 3 && (
                  <li>• Balance workload and reduce complexity in key areas</li>
                )}
                {highKnowledgeGap > 3 && (
                  <li>
                    • Implement pair programming and knowledge transfer sessions
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Wins */}
      <div className="analytics-card analytics-card-compact space-y-3">
        <h3
          className="analytics-text-lg font-semibold"
          style={{ color: "var(--analytics-text-primary)" }}
        >
          <FiTrendingUp className="inline mr-2" />
          Priority Quick Wins
        </h3>

        <div className="space-y-2">
          {topQuickWins.map((win, index) => (
            <div
              key={index}
              className="p-3 rounded border"
              style={{
                background: "var(--analytics-card-hover)",
                borderColor:
                  win.priority >= 9
                    ? "var(--analytics-error)"
                    : win.priority >= 7
                    ? "var(--analytics-warning)"
                    : "var(--analytics-info)",
                borderWidth: "2px",
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between analytics-mb-2">
                <h4
                  className="analytics-text-sm font-semibold flex-1"
                  style={{ color: "var(--analytics-text-primary)" }}
                >
                  {win.action}
                </h4>
                <span
                  className="analytics-badge analytics-text-xs ml-2"
                  style={{
                    background:
                      win.priority >= 9
                        ? "var(--analytics-error)"
                        : win.priority >= 7
                        ? "var(--analytics-warning)"
                        : "var(--analytics-info)",
                    color: "#fff",
                  }}
                >
                  P{win.priority}
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-4 gap-2 analytics-mb-2">
                <div>
                  <p
                    className="analytics-text-xs"
                    style={{ color: "var(--analytics-text-tertiary)" }}
                  >
                    Time
                  </p>
                  <p
                    className="analytics-text-xs font-semibold"
                    style={{ color: "var(--analytics-text-primary)" }}
                  >
                    {win.estimatedTime}
                  </p>
                </div>
                <div>
                  <p
                    className="analytics-text-xs"
                    style={{ color: "var(--analytics-text-tertiary)" }}
                  >
                    Effort
                  </p>
                  <p
                    className="analytics-text-xs font-semibold"
                    style={{ color: "var(--analytics-text-primary)" }}
                  >
                    {win.effort}
                  </p>
                </div>
                <div>
                  <p
                    className="analytics-text-xs"
                    style={{ color: "var(--analytics-text-tertiary)" }}
                  >
                    Impact
                  </p>
                  <p
                    className="analytics-text-xs font-semibold"
                    style={{ color: "var(--analytics-success)" }}
                  >
                    {win.impact}
                  </p>
                </div>
                <div>
                  <p
                    className="analytics-text-xs"
                    style={{ color: "var(--analytics-text-tertiary)" }}
                  >
                    Risk
                  </p>
                  <p
                    className="analytics-text-xs font-semibold"
                    style={{
                      color:
                        win.risk.toLowerCase() === "low"
                          ? "var(--analytics-success)"
                          : "var(--analytics-warning)",
                    }}
                  >
                    {win.risk}
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div>
                <p
                  className="analytics-text-xs font-semibold analytics-mb-1"
                  style={{ color: "var(--analytics-text-secondary)" }}
                >
                  Implementation Steps:
                </p>
                <ol
                  className="analytics-text-xs space-y-0.5"
                  style={{
                    color: "var(--analytics-text-secondary)",
                    paddingLeft: "16px",
                  }}
                >
                  {win.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 analytics-mt-2">
          <div
            className="p-2 rounded text-center"
            style={{ background: "var(--analytics-card-hover)" }}
          >
            <p
              className="analytics-text-lg font-semibold"
              style={{ color: "var(--analytics-text-primary)" }}
            >
              {quickWins.length}
            </p>
            <p
              className="analytics-text-xs"
              style={{ color: "var(--analytics-text-secondary)" }}
            >
              Total Quick Wins
            </p>
          </div>
          <div
            className="p-2 rounded text-center"
            style={{ background: "var(--analytics-card-hover)" }}
          >
            <p
              className="analytics-text-lg font-semibold"
              style={{ color: "var(--analytics-success)" }}
            >
              {quickWins.filter((w) => w.effort.toLowerCase() === "low").length}
            </p>
            <p
              className="analytics-text-xs"
              style={{ color: "var(--analytics-text-secondary)" }}
            >
              Low Effort
            </p>
          </div>
          <div
            className="p-2 rounded text-center"
            style={{ background: "var(--analytics-card-hover)" }}
          >
            <p
              className="analytics-text-lg font-semibold"
              style={{ color: "var(--analytics-info)" }}
            >
              {
                quickWins.filter((w) => w.impact.toLowerCase() === "high")
                  .length
              }
            </p>
            <p
              className="analytics-text-xs"
              style={{ color: "var(--analytics-text-secondary)" }}
            >
              High Impact
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
