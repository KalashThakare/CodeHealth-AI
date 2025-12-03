"use client";

import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useTheme } from "@/hooks/useTheme";
import { getChartTheme } from "@/lib/chartTheme";
import {
  FiInfo,
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart2,
} from "react-icons/fi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DistributionChartProps {
  data: number[];
  label: string;
  color: string;
  type?: "maintainability" | "complexity";
}

const maintainabilityBuckets = [
  { range: "0-20", label: "Very Low", desc: "Critical - hard to maintain" },
  { range: "21-40", label: "Low", desc: "Needs significant improvement" },
  { range: "41-60", label: "Moderate", desc: "Average maintainability" },
  { range: "61-80", label: "Good", desc: "Well structured code" },
  { range: "81-100", label: "Excellent", desc: "Highly maintainable" },
];

const complexityBuckets = [
  { range: "1-5", label: "Simple", desc: "Easy to test and maintain" },
  { range: "6-10", label: "Moderate", desc: "Reasonable complexity" },
  { range: "11-20", label: "Complex", desc: "Consider refactoring" },
  { range: "21-50", label: "High", desc: "Difficult to test" },
  { range: "50+", label: "Very High", desc: "Critical - needs splitting" },
];

export default function DistributionChart({
  data,
  label,
  color,
  type = "maintainability",
}: DistributionChartProps) {
  const chartRef = useRef<ChartJS<"bar"> | null>(null);
  const { isDark } = useTheme();
  const theme = getChartTheme(isDark);

  const buckets =
    type === "maintainability" ? maintainabilityBuckets : complexityBuckets;
  const totalFiles = data.reduce((sum, val) => sum + val, 0);
  const maxBucketIndex = data.indexOf(Math.max(...data));
  const dominantBucket = buckets[maxBucketIndex] || buckets[0];

  const getHealthStatus = () => {
    if (type === "maintainability") {
      const weightedSum = data.reduce(
        (sum, val, idx) => sum + val * (idx + 1),
        0
      );
      const avgBucket = totalFiles > 0 ? weightedSum / totalFiles : 0;
      if (avgBucket >= 3.5)
        return {
          status: "Healthy",
          color: "var(--analytics-success)",
          icon: FiTrendingUp,
        };
      if (avgBucket >= 2.5)
        return {
          status: "Moderate",
          color: "var(--analytics-warning)",
          icon: FiBarChart2,
        };
      return {
        status: "Needs Work",
        color: "var(--analytics-error)",
        icon: FiTrendingDown,
      };
    } else {
      const weightedSum = data.reduce(
        (sum, val, idx) => sum + val * (idx + 1),
        0
      );
      const avgBucket = totalFiles > 0 ? weightedSum / totalFiles : 0;
      if (avgBucket <= 2)
        return {
          status: "Simple",
          color: "var(--analytics-success)",
          icon: FiTrendingUp,
        };
      if (avgBucket <= 3)
        return {
          status: "Moderate",
          color: "var(--analytics-warning)",
          icon: FiBarChart2,
        };
      return {
        status: "Complex",
        color: "var(--analytics-error)",
        icon: FiTrendingDown,
      };
    }
  };

  const healthStatus = getHealthStatus();
  const HealthIcon = healthStatus.icon;

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const labels = buckets.map((b) => b.range);

  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        backgroundColor: isDark ? "#3b82f6" : color + "DD",
        borderColor: isDark ? "##3b82f6" : color,
        borderWidth: 1,
        borderRadius: 4,
        barThickness: "flex" as const,
        maxBarThickness: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
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
        padding: 10,
        cornerRadius: 6,
        titleFont: {
          size: 11,
          weight: 600 as const,
          family: "'Inter', system-ui, sans-serif",
        },
        bodyFont: {
          size: 10,
          family: "'Inter', system-ui, sans-serif",
        },
        callbacks: {
          title: function (context: any) {
            const idx = context[0].dataIndex;
            return `${buckets[idx].label} (${buckets[idx].range})`;
          },
          label: function (context: any) {
            const idx = context.dataIndex;
            const percentage =
              totalFiles > 0
                ? ((context.parsed.y / totalFiles) * 100).toFixed(1)
                : 0;
            return [
              `Files: ${context.parsed.y} (${percentage}%)`,
              buckets[idx].desc,
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
        },
      },
    },
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        alignItems: "stretch",
        height: "100%",
      }}
    >
      <div
        style={{
          flex: "1.2",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flex: 1, minHeight: 0 }}>
          <Bar
            ref={chartRef}
            data={chartData}
            options={{ ...options, maintainAspectRatio: false }}
          />
        </div>
      </div>

      <div
        style={{
          flex: "0.8",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          minWidth: "180px",
        }}
      >
        <div
          className="p-3 rounded"
          style={{
            background: "var(--analytics-card-hover)",
            border: "1px solid var(--analytics-border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <HealthIcon size={16} style={{ color: healthStatus.color }} />
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--analytics-text-primary)",
              }}
            >
              Overall Status
            </span>
          </div>
          <span
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: healthStatus.color,
            }}
          >
            {healthStatus.status}
          </span>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--analytics-text-tertiary)",
              marginTop: "4px",
            }}
          >
            Based on {totalFiles} files analyzed
          </p>
        </div>

        <div
          className="p-3 rounded"
          style={{
            background: "var(--analytics-card-hover)",
            border: "1px solid var(--analytics-border)",
          }}
        >
          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--analytics-text-secondary)",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Most Common Range
          </span>
          <span
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "var(--analytics-text-primary)",
            }}
          >
            {dominantBucket.label}
          </span>
          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--analytics-text-tertiary)",
              marginLeft: "6px",
            }}
          >
            ({dominantBucket.range})
          </span>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--analytics-text-tertiary)",
              marginTop: "4px",
            }}
          >
            {data[maxBucketIndex]} files (
            {totalFiles > 0
              ? ((data[maxBucketIndex] / totalFiles) * 100).toFixed(0)
              : 0}
            %)
          </p>
        </div>

        <div
          className="p-3 rounded"
          style={{
            background: "var(--analytics-card-hover)",
            border: "1px solid var(--analytics-border)",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "8px",
            }}
          >
            <FiInfo size={12} style={{ color: "var(--analytics-accent)" }} />
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--analytics-text-primary)",
              }}
            >
              Range Guide
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {buckets.slice(0, 3).map((bucket, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--analytics-text-secondary)",
                  }}
                >
                  {bucket.range}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--analytics-text-tertiary)",
                  }}
                >
                  {bucket.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
