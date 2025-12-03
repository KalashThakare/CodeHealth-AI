"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import {
  FiInfo,
  FiZap,
  FiTarget,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import { useTheme } from "@/hooks/useTheme";
import { getSeverityColor } from "@/lib/chartTheme";

interface RefactoringSuggestion {
  file: string;
  priority: string;
  estimatedEffort: string;
  businessImpact: {
    currentCost: string;
    incidentRisk: string;
    velocitySlowdown: string;
  };
}

interface RiskMatrixD3Props {
  suggestions: RefactoringSuggestion[];
}

export default function RiskMatrixD3({ suggestions }: RiskMatrixD3Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current || suggestions.length === 0)
      return;

    d3.select(svgRef.current).selectAll("*").remove();

    const textColor = isDark ? "#a3a3a3" : "#4a1d8f";
    const gridColor = isDark
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(124, 58, 237, 0.2)";
    const axisColor = isDark ? "#333333" : "#d1c4e9";
    const circleStroke = isDark ? "#000" : "#fff";

    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const data = suggestions.map((s) => {
      const effortDays = parseInt(s.estimatedEffort.match(/\d+/)?.[0] || "1");
      const riskScore =
        s.priority.toLowerCase() === "critical"
          ? 10
          : s.priority.toLowerCase() === "high"
          ? 7
          : s.priority.toLowerCase() === "medium"
          ? 4
          : 2;

      return {
        file: s.file.split("/").pop() || s.file,
        fullPath: s.file,
        effort: effortDays,
        risk: riskScore,
        priority: s.priority,
        impact: s.businessImpact.incidentRisk,
      };
    });

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.effort) || 10])
      .range([0, width])
      .nice();

    const yScale = d3.scaleLinear().domain([0, 10]).range([height, 0]).nice();

    const quadrants = [
      {
        x: 0,
        y: 0,
        label: "Low Risk, Low Effort",
        color: isDark ? "rgba(16, 185, 129, 0.08)" : "rgba(4, 120, 87, 0.08)",
      },
      {
        x: width / 2,
        y: 0,
        label: "Low Risk, High Effort",
        color: isDark ? "rgba(245, 158, 11, 0.08)" : "rgba(180, 83, 9, 0.08)",
      },
      {
        x: 0,
        y: height / 2,
        label: "High Risk, Low Effort",
        color: isDark ? "rgba(249, 115, 22, 0.08)" : "rgba(194, 65, 12, 0.08)",
      },
      {
        x: width / 2,
        y: height / 2,
        label: "High Risk, High Effort",
        color: isDark ? "rgba(239, 68, 68, 0.08)" : "rgba(185, 28, 28, 0.08)",
      },
    ];

    svg
      .selectAll(".quadrant")
      .data(quadrants)
      .enter()
      .append("rect")
      .attr("class", "quadrant")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("width", width / 2)
      .attr("height", height / 2)
      .attr("fill", (d) => d.color);

    svg
      .append("g")
      .attr("class", "grid")
      .attr("opacity", isDark ? 0.15 : 0.25)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .style("stroke", gridColor);

    svg
      .append("g")
      .attr("class", "grid")
      .attr("opacity", isDark ? 0.15 : 0.25)
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(-height)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .style("stroke", gridColor);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .style("color", textColor)
      .style("font-size", "10px")
      .style("font-family", "'Inter', system-ui, sans-serif")
      .selectAll("line, path")
      .style("stroke", axisColor);

    svg
      .append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .style("color", textColor)
      .style("font-size", "10px")
      .style("font-family", "'Inter', system-ui, sans-serif")
      .selectAll("line, path")
      .style("stroke", axisColor);

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .style("fill", textColor)
      .style("font-size", "12px")
      .style("font-family", "'Inter', system-ui, sans-serif")
      .text("Estimated Effort (days)");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -45)
      .attr("text-anchor", "middle")
      .style("fill", textColor)
      .style("font-size", "12px")
      .style("font-family", "'Inter', system-ui, sans-serif")
      .text("Risk Score");

    const tooltip = d3.select(tooltipRef.current);

    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.effort))
      .attr("cy", (d) => yScale(d.risk))
      .attr("r", 8)
      .attr("fill", (d) => getSeverityColor(d.priority, isDark))
      .attr("stroke", circleStroke)
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 12).attr("stroke-width", 3);

        tooltip
          .style("opacity", "1")
          .html(
            `
            <div style="font-weight: 600; margin-bottom: 4px;">${d.file}</div>
            <div style="font-size: 11px;">
              <div>Priority: <strong>${d.priority}</strong></div>
              <div>Effort: <strong>${d.effort} days</strong></div>
              <div>Risk Score: <strong>${d.risk}/10</strong></div>
              <div>Impact: <strong>${d.impact}</strong></div>
            </div>
          `
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 8).attr("stroke-width", 2);
        tooltip.style("opacity", "0");
      });

    const highPriorityData = data.filter(
      (d) => d.priority.toLowerCase() === "critical"
    );

    svg
      .selectAll(".label")
      .data(highPriorityData)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => xScale(d.effort) + 12)
      .attr("y", (d) => yScale(d.risk) + 4)
      .style("font-size", "10px")
      .style("fill", textColor)
      .style("font-weight", "600")
      .style("font-family", "'Inter', system-ui, sans-serif")
      .text((d) => d.file.substring(0, 15) + (d.file.length > 15 ? "..." : ""));
  }, [suggestions, isDark]);

  return (
    <div className="analytics-card analytics-card-compact space-y-4">
      <div className="flex items-center justify-between">
        <h3
          className="analytics-text-lg font-semibold"
          style={{ color: "var(--analytics-text-primary)" }}
        >
          Risk vs Effort Matrix (D3.js)
        </h3>
        <div
          className="flex items-center gap-1"
          style={{ color: "var(--analytics-text-tertiary)" }}
        >
          <FiInfo size={14} />
          <span className="analytics-text-xs">Interactive scatter plot</span>
        </div>
      </div>

      <p
        className="analytics-text-sm"
        style={{ color: "var(--analytics-text-secondary)", lineHeight: "1.6" }}
      >
        Files plotted by refactoring effort (x-axis) vs business risk (y-axis).
        Focus on <strong>top-right quadrant</strong> for high-risk, high-effort
        items. Hover over points for detailed information.
      </p>

      <div style={{ display: "flex", gap: "16px", alignItems: "stretch" }}>
        <div
          style={{
            flex: "2",
            background: "var(--analytics-card-hover)",
            borderRadius: "8px",
            padding: "12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <svg ref={svgRef}></svg>
        </div>

        <div
          style={{
            flex: "1",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div
            className="p-3 rounded"
            style={{
              background: "var(--analytics-card-hover)",
              border: "1px solid var(--analytics-border)",
            }}
          >
            <h4
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                marginBottom: "8px",
                color: "var(--analytics-text-primary)",
              }}
            >
              Quick Summary
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--analytics-text-secondary)",
                  }}
                >
                  Total Files
                </span>
                <span
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "var(--analytics-text-primary)",
                  }}
                >
                  {suggestions.length}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--analytics-text-secondary)",
                  }}
                >
                  Critical
                </span>
                <span
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "var(--analytics-error)",
                  }}
                >
                  {
                    suggestions.filter(
                      (s) => s.priority.toLowerCase() === "critical"
                    ).length
                  }
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--analytics-text-secondary)",
                  }}
                >
                  High Risk
                </span>
                <span
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "var(--analytics-warning)",
                  }}
                >
                  {
                    suggestions.filter(
                      (s) => s.priority.toLowerCase() === "high"
                    ).length
                  }
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--analytics-text-secondary)",
                  }}
                >
                  Medium/Low
                </span>
                <span
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "var(--analytics-success)",
                  }}
                >
                  {
                    suggestions.filter((s) =>
                      ["medium", "low"].includes(s.priority.toLowerCase())
                    ).length
                  }
                </span>
              </div>
            </div>
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
                fontSize: "0.9rem",
                fontWeight: 600,
                marginBottom: "8px",
                color: "var(--analytics-text-primary)",
              }}
            >
              Legend
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              {[
                {
                  label: "Critical",
                  severity: "critical",
                  desc: "Immediate action",
                },
                { label: "High", severity: "high", desc: "Address soon" },
                { label: "Medium", severity: "medium", desc: "Plan to fix" },
                { label: "Low", severity: "low", desc: "Monitor only" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: getSeverityColor(item.severity, isDark),
                      border: `2px solid ${isDark ? "#000" : "#fff"}`,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--analytics-text-primary)",
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--analytics-text-tertiary)",
                        marginLeft: "6px",
                      }}
                    >
                      {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: "10px 12px",
              borderLeft: "3px solid var(--analytics-accent)",
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "0 6px 6px 0",
            }}
          >
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--analytics-text-secondary)",
                lineHeight: "1.5",
                margin: 0,
                fontStyle: "italic",
                display: "flex",
                alignItems: "flex-start",
                gap: "6px",
              }}
            >
              <FiZap
                size={14}
                style={{
                  color: "var(--analytics-accent)",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              />
              <span>
                Prioritize files in the top-left quadrant first — high impact
                with minimal effort.
              </span>
            </p>
          </div>
        </div>
      </div>

      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          opacity: 0,
          background: isDark
            ? "rgba(26, 26, 26, 0.98)"
            : "rgba(255, 255, 255, 0.98)",
          color: isDark ? "#ededed" : "#1a0b2e",
          padding: "10px 14px",
          borderRadius: "6px",
          fontSize: "12px",
          pointerEvents: "none",
          zIndex: 1000,
          border: isDark ? "1px solid #333" : "1.5px solid #d1c4e9",
          boxShadow: isDark
            ? "0 4px 12px rgba(0, 0, 0, 0.5)"
            : "0 4px 16px rgba(124, 58, 237, 0.2)",
          transition: "opacity 0.2s",
          fontWeight: "500",
        }}
      />

      <div className="grid grid-cols-4 gap-2 analytics-text-xs">
        <div
          className="p-2 rounded"
          style={{
            background: isDark
              ? "rgba(239, 68, 68, 0.08)"
              : "rgba(185, 28, 28, 0.08)",
            border: isDark
              ? "1px solid rgba(239, 68, 68, 0.3)"
              : "1.5px solid rgba(185, 28, 28, 0.4)",
          }}
        >
          <strong
            style={{
              color: "var(--analytics-error)",
              fontWeight: "700",
              fontSize: "0.8rem",
            }}
          >
            High Risk, High Effort
          </strong>
          <p
            style={{
              color: "var(--analytics-text-secondary)",
              marginTop: "4px",
              fontSize: "0.75rem",
              lineHeight: "1.4",
            }}
          >
            Complex refactoring needed. Plan carefully with team.
          </p>
        </div>
        <div
          className="p-2 rounded"
          style={{
            background: isDark
              ? "rgba(249, 115, 22, 0.08)"
              : "rgba(194, 65, 12, 0.08)",
            border: isDark
              ? "1px solid rgba(249, 115, 22, 0.3)"
              : "1.5px solid rgba(194, 65, 12, 0.4)",
          }}
        >
          <strong
            style={{
              color: "var(--analytics-warning)",
              fontWeight: "700",
              fontSize: "0.8rem",
            }}
          >
            High Risk, Low Effort
          </strong>
          <p
            style={{
              color: "var(--analytics-text-secondary)",
              marginTop: "4px",
              fontSize: "0.75rem",
              lineHeight: "1.4",
              display: "flex",
              alignItems: "flex-start",
              gap: "4px",
            }}
          >
            <FiTarget
              size={12}
              style={{
                color: "var(--analytics-warning)",
                flexShrink: 0,
                marginTop: "2px",
              }}
            />
            <span>Quick wins! Prioritize these first for best ROI.</span>
          </p>
        </div>
        <div
          className="p-2 rounded"
          style={{
            background: isDark
              ? "rgba(245, 158, 11, 0.08)"
              : "rgba(180, 83, 9, 0.08)",
            border: isDark
              ? "1px solid rgba(245, 158, 11, 0.3)"
              : "1.5px solid rgba(180, 83, 9, 0.4)",
          }}
        >
          <strong
            style={{
              color: "var(--analytics-info)",
              fontWeight: "700",
              fontSize: "0.8rem",
            }}
          >
            Low Risk, High Effort
          </strong>
          <p
            style={{
              color: "var(--analytics-text-secondary)",
              marginTop: "4px",
              fontSize: "0.75rem",
              lineHeight: "1.4",
            }}
          >
            Consider if worth the time investment.
          </p>
        </div>
        <div
          className="p-2 rounded"
          style={{
            background: isDark
              ? "rgba(16, 185, 129, 0.08)"
              : "rgba(4, 120, 87, 0.08)",
            border: isDark
              ? "1px solid rgba(16, 185, 129, 0.3)"
              : "1.5px solid rgba(4, 120, 87, 0.4)",
          }}
        >
          <strong
            style={{
              color: "var(--analytics-success)",
              fontWeight: "700",
              fontSize: "0.8rem",
            }}
          >
            Low Risk, Low Effort
          </strong>
          <p
            style={{
              color: "var(--analytics-text-secondary)",
              marginTop: "4px",
              fontSize: "0.75rem",
              lineHeight: "1.4",
              display: "flex",
              alignItems: "flex-start",
              gap: "4px",
            }}
          >
            <FiCheckCircle
              size={12}
              style={{
                color: "var(--analytics-success)",
                flexShrink: 0,
                marginTop: "2px",
              }}
            />
            <span>Safe zone. Address when time permits.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
