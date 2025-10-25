"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { FiInfo } from "react-icons/fi";

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

  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current || suggestions.length === 0)
      return;

    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

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

    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(["critical", "high", "medium", "low"])
      .range([
        "rgba(239, 68, 68, 0.8)", // red
        "rgba(249, 115, 22, 0.8)", // orange
        "rgba(234, 179, 8, 0.8)", // yellow
        "rgba(34, 197, 94, 0.8)", // green
      ]);

    // Add quadrant backgrounds
    const quadrants = [
      {
        x: 0,
        y: 0,
        label: "Low Risk, Low Effort",
        color: "rgba(34, 197, 94, 0.05)",
      },
      {
        x: width / 2,
        y: 0,
        label: "Low Risk, High Effort",
        color: "rgba(234, 179, 8, 0.05)",
      },
      {
        x: 0,
        y: height / 2,
        label: "High Risk, Low Effort",
        color: "rgba(249, 115, 22, 0.05)",
      },
      {
        x: width / 2,
        y: height / 2,
        label: "High Risk, High Effort",
        color: "rgba(239, 68, 68, 0.05)",
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

    // Add gridlines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("opacity", 0.1)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => "")
      );

    svg
      .append("g")
      .attr("class", "grid")
      .attr("opacity", 0.1)
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(-height)
          .tickFormat(() => "")
      );

    // X Axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .style("color", "var(--analytics-text-secondary)")
      .style("font-size", "10px");

    // Y Axis
    svg
      .append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .style("color", "var(--analytics-text-secondary)")
      .style("font-size", "10px");

    // X Axis Label
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .style("fill", "var(--analytics-text-secondary)")
      .style("font-size", "12px")
      .text("Estimated Effort (days)");

    // Y Axis Label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -45)
      .attr("text-anchor", "middle")
      .style("fill", "var(--analytics-text-secondary)")
      .style("font-size", "12px")
      .text("Risk Score");

    // Tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Add circles
    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.effort))
      .attr("cy", (d) => yScale(d.risk))
      .attr("r", 8)
      .attr("fill", (d) => colorScale(d.priority.toLowerCase()))
      .attr("stroke", "#fff")
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
            <div style="font-weight: 600; margin-bottom: 4px; color: var(--analytics-text-primary)">${d.file}</div>
            <div style="font-size: 11px; color: var(--analytics-text-secondary)">
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
      .style("fill", "var(--analytics-text-secondary)")
      .style("font-weight", "600")
      .text((d) => d.file.substring(0, 15) + (d.file.length > 15 ? "..." : ""));
  }, [suggestions]);

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
          background: "rgba(0, 0, 0, 0.95)",
          color: "#fff",
          padding: "8px 12px",
          borderRadius: "6px",
          fontSize: "12px",
          pointerEvents: "none",
          zIndex: 1000,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          transition: "opacity 0.2s",
        }}
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { label: "Critical", color: "rgba(239, 68, 68, 0.8)" },
          { label: "High", color: "rgba(249, 115, 22, 0.8)" },
          { label: "Medium", color: "rgba(234, 179, 8, 0.8)" },
          { label: "Low", color: "rgba(34, 197, 94, 0.8)" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: item.color,
                border: "2px solid #fff",
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
            background: "rgba(239, 68, 68, 0.05)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          <strong style={{ color: "var(--analytics-error)" }}>
            High Risk, High Effort
          </strong>
          <p style={{ color: "var(--analytics-text-secondary)" }}>
            Complex refactoring needed
          </p>
        </div>
        <div
          className="p-2 rounded"
          style={{
            background: "rgba(249, 115, 22, 0.05)",
            border: "1px solid rgba(249, 115, 22, 0.2)",
          }}
        >
          <strong style={{ color: "var(--analytics-warning)" }}>
            High Risk, Low Effort
          </strong>
          <p style={{ color: "var(--analytics-text-secondary)" }}>
            Quick wins with high impact
          </p>
        </div>
      </div>
    </div>
  );
}
