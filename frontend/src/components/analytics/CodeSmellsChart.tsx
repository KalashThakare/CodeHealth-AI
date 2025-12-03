"use client";

import React from "react";
import {
  FiAlertCircle,
  FiFileText,
  FiClock,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";
import { useTheme } from "@/hooks/useTheme";
import { getSeverityColor } from "@/lib/chartTheme";

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

  const mediumCount = codeSmells.filter(
    (s) => s.severity.toLowerCase() === "medium"
  ).length;

  const lowCount = codeSmells.filter(
    (s) => s.severity.toLowerCase() === "low"
  ).length;

  const getTotalFixHours = () => {
    let totalHours = 0;
    codeSmells.forEach((smell) => {
      const match = smell.estimatedFixTime.match(/(\d+)/);
      if (match) {
        totalHours += parseInt(match[1]);
      }
    });
    return totalHours;
  };

  const totalFixHours = getTotalFixHours();

  return (
    <div className="space-y-4 mt-2">
      <div style={{ display: "flex", gap: "20px", alignItems: "stretch" }}>
        <div
          style={{
            flex: "1",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            className="p-4 rounded-lg"
            style={{
              background: "var(--analytics-card-hover)",
              border: "1px solid var(--analytics-border)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  background:
                    criticalCount > 0
                      ? "rgba(239, 68, 68, 0.1)"
                      : highCount > 0
                      ? "rgba(249, 115, 22, 0.1)"
                      : "rgba(16, 185, 129, 0.1)",
                }}
              >
                <FiAlertCircle
                  size={20}
                  style={{
                    color:
                      criticalCount > 0
                        ? "var(--analytics-error)"
                        : highCount > 0
                        ? "var(--analytics-warning)"
                        : "var(--analytics-success)",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <h4
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "var(--analytics-text-primary)",
                    marginBottom: "4px",
                  }}
                >
                  Code Smell Analysis
                </h4>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--analytics-text-secondary)",
                    lineHeight: "1.6",
                  }}
                >
                  {overallHealth}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div
              className="p-3 rounded-lg text-center"
              style={{
                background: "var(--analytics-card-hover)",
                border: "1px solid var(--analytics-border)",
              }}
            >
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--analytics-text-secondary)",
                  marginBottom: "4px",
                }}
              >
                Total Issues
              </p>
              <p
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--analytics-text-primary)",
                }}
              >
                {codeSmells.length}
              </p>
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "var(--analytics-text-tertiary)",
                  marginTop: "2px",
                }}
              >
                Code smells found
              </p>
            </div>
            <div
              className="p-3 rounded-lg text-center"
              style={{
                background: "var(--analytics-card-hover)",
                border: "1px solid var(--analytics-border)",
              }}
            >
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--analytics-text-secondary)",
                  marginBottom: "4px",
                }}
              >
                Affected Files
              </p>
              <p
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--analytics-text-primary)",
                }}
              >
                {totalAffectedFiles}
              </p>
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "var(--analytics-text-tertiary)",
                  marginTop: "2px",
                }}
              >
                Need attention
              </p>
            </div>
            <div
              className="p-3 rounded-lg text-center"
              style={{
                background: "var(--analytics-card-hover)",
                border: "1px solid var(--analytics-border)",
              }}
            >
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--analytics-text-secondary)",
                  marginBottom: "4px",
                }}
              >
                Critical
              </p>
              <p
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color:
                    criticalCount > 0
                      ? "var(--analytics-error)"
                      : "var(--analytics-success)",
                }}
              >
                {criticalCount}
              </p>
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "var(--analytics-text-tertiary)",
                  marginTop: "2px",
                }}
              >
                {criticalCount > 0 ? "Urgent fixes" : "None found"}
              </p>
            </div>
          </div>

          <div
            className="p-3 rounded-lg"
            style={{
              background: "var(--analytics-card-hover)",
              border: "1px solid var(--analytics-border)",
            }}
          >
            <h4
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--analytics-text-primary)",
                marginBottom: "10px",
              }}
            >
              Severity Breakdown
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {[
                {
                  label: "Critical",
                  count: criticalCount,
                  color: "var(--analytics-error)",
                  desc: "Immediate action required",
                },
                {
                  label: "High",
                  count: highCount,
                  color: "var(--analytics-warning)",
                  desc: "Address within sprint",
                },
                {
                  label: "Medium",
                  count: mediumCount,
                  color: "var(--analytics-info)",
                  desc: "Plan for improvement",
                },
                {
                  label: "Low",
                  count: lowCount,
                  color: "var(--analytics-success)",
                  desc: "Monitor and track",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "3px",
                      background: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "var(--analytics-text-primary)",
                      width: "55px",
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: item.color,
                      width: "25px",
                    }}
                  >
                    {item.count}
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--analytics-text-tertiary)",
                      flex: 1,
                    }}
                  >
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: "12px 14px",
              borderLeft: "3px solid var(--analytics-accent)",
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "0 6px 6px 0",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <FiClock
              size={16}
              style={{ color: "var(--analytics-accent)", flexShrink: 0 }}
            />
            <div>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--analytics-text-secondary)",
                  margin: 0,
                }}
              >
                Estimated total fix time:{" "}
                <strong style={{ color: "var(--analytics-text-primary)" }}>
                  {totalFixHours} hours
                </strong>
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            flex: "1",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <h4
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "var(--analytics-text-primary)",
              marginBottom: "4px",
            }}
          >
            Detected Issues
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {codeSmells.map((smell, index) => (
              <div
                key={index}
                className="p-3 rounded-lg"
                style={{
                  background: "var(--analytics-card-hover)",
                  borderTop: "1px solid var(--analytics-border)",
                  borderRight: "1px solid var(--analytics-border)",
                  borderBottom: "1px solid var(--analytics-border)",
                  borderLeft: `3px solid ${getSeverityColor(
                    smell.severity,
                    isDark
                  )}`,
                }}
              >
                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: "6px" }}
                >
                  <h5
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--analytics-text-primary)",
                    }}
                  >
                    {smell.type}
                  </h5>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                      background: getSeverityColor(smell.severity, isDark),
                      color: isDark ? "#000" : "#fff",
                      fontWeight: 600,
                      textTransform: "lowercase",
                    }}
                  >
                    {smell.severity}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--analytics-text-secondary)",
                    marginBottom: "8px",
                    lineHeight: "1.5",
                  }}
                >
                  {smell.impact}
                </p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <FiFileText
                      size={11}
                      style={{ color: "var(--analytics-text-tertiary)" }}
                    />
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--analytics-text-tertiary)",
                      }}
                    >
                      {smell.affectedFiles.length} files
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <FiClock
                      size={11}
                      style={{ color: "var(--analytics-text-tertiary)" }}
                    />
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--analytics-text-tertiary)",
                      }}
                    >
                      {smell.estimatedFixTime}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {codeSmells.length === 0 && (
            <div
              className="p-4 rounded-lg text-center"
              style={{
                background: "var(--analytics-card-hover)",
                border: "1px solid var(--analytics-border)",
              }}
            >
              <FiCheckCircle
                size={24}
                style={{
                  color: "var(--analytics-success)",
                  margin: "0 auto 8px",
                }}
              />
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--analytics-text-secondary)",
                }}
              >
                No code smells detected. Great job!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
