"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { FiInfo } from "react-icons/fi";
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

    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

    // Theme-aware colors with HIGH CONTRAST for light theme
    const textColor = isDark ? "#a3a3a3" : "#4a1d8f";
    const gridColor = isDark
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(124, 58, 237, 0.2)";
    const axisColor = isDark ? "#333333" : "#d1c4e9";
    const circleStroke = isDark ? "#000" : "#fff";

    // Dimensions
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Process data
    const data = suggestions.map((s) => {
      // Extract numeric values from strings
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

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.effort) || 10])
      .range([0, width])
      .nice();

    const yScale = d3.scaleLinear().domain([0, 10]).range([height, 0]).nice();

    // Add quadrant backgrounds with theme-aware colors - HIGHER CONTRAST
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

    // Add gridlines with theme-aware colors - HIGHER OPACITY for light theme
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

    // X Axis with theme colors
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .style("color", textColor)
      .style("font-size", "10px")
      .style("font-family", "'Inter', system-ui, sans-serif")
      .selectAll("line, path")
      .style("stroke", axisColor);

    // Y Axis with theme colors
    svg
      .append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .style("color", textColor)
      .style("font-size", "10px")
      .style("font-family", "'Inter', system-ui, sans-serif")
      .selectAll("line, path")
      .style("stroke", axisColor);

    // X Axis Label
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .style("fill", textColor)
      .style("font-size", "12px")
      .style("font-family", "'Inter', system-ui, sans-serif")
      .text("Estimated Effort (days)");

    // Y Axis Label
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

    // Tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Add circles with theme-aware colors
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
        // Highlight circle
        d3.select(this).attr("r", 12).attr("stroke-width", 3);

        // Show tooltip
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

    // Add labels for high priority items
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
    <div className="analytics-card analytics-card-compact space-y-3">
      {/* Header */}
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

      {/* Description */}
      <p
        className="analytics-text-xs"
        style={{ color: "var(--analytics-text-secondary)" }}
      >
        Files plotted by refactoring effort (x-axis) vs business risk (y-axis).
        Focus on <strong>top-right quadrant</strong> for high-risk, high-effort
        items.
      </p>

      {/* Chart */}
      <div
        className="flex justify-center"
        style={{
          background: "var(--analytics-card-hover)",
          borderRadius: "8px",
          padding: "16px",
        }}
      >
        <svg ref={svgRef}></svg>
      </div>

      {/* Tooltip */}
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

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { label: "Critical", severity: "critical" },
          { label: "High", severity: "high" },
          { label: "Medium", severity: "medium" },
          { label: "Low", severity: "low" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: getSeverityColor(item.severity, isDark),
                border: `2px solid ${isDark ? "#000" : "#fff"}`,
              }}
            />
            <span
              className="analytics-text-xs"
              style={{ color: "var(--analytics-text-secondary)" }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Quadrant Guide */}
      <div className="grid grid-cols-2 gap-2 analytics-text-xs">
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
            style={{ color: "var(--analytics-error)", fontWeight: "700" }}
          >
            High Risk, High Effort
          </strong>
          <p
            style={{
              color: "var(--analytics-text-secondary)",
              marginTop: "4px",
            }}
          >
            Complex refactoring needed
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
            style={{ color: "var(--analytics-warning)", fontWeight: "700" }}
          >
            High Risk, Low Effort
          </strong>
          <p
            style={{
              color: "var(--analytics-text-secondary)",
              marginTop: "4px",
            }}
          >
            Quick wins with high impact
          </p>
        </div>
      </div>
    </div>
  );
}
