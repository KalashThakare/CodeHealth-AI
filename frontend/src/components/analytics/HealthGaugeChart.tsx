"use client";

import React, { useEffect, useRef } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useTheme } from "@/hooks/useTheme";

ChartJS.register(ArcElement, Tooltip, Legend);

interface HealthGaugeChartProps {
  score: number;
  rating: "excellent" | "good" | "fair" | "needs_improvement" | string;
}

export default function HealthGaugeChart({
  score,
  rating,
}: HealthGaugeChartProps) {
  const chartRef = useRef<ChartJS<"doughnut"> | null>(null);
  const { isDark } = useTheme();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  // Vercel-style colors with good visibility
  const getColor = (score: number) => {
    if (score >= 80) return isDark ? "#4ade80" : "#16a34a"; // green
    if (score >= 60) return isDark ? "#60a5fa" : "#2563eb"; // blue
    if (score >= 40) return isDark ? "#fbbf24" : "#d97706"; // amber
    return isDark ? "#f87171" : "#dc2626"; // red
  };

  const getRatingLabel = (rating: string) => {
    const labels: Record<string, string> = {
      excellent: "Excellent",
      good: "Good",
      fair: "Fair",
      needs_improvement: "Needs Work",
    };
    return labels[rating] || rating;
  };

  const color = getColor(score);
  const emptyColor = isDark
    ? "rgba(255, 255, 255, 0.06)"
    : "rgba(0, 0, 0, 0.06)";
  const textSecondary = isDark ? "#a1a1aa" : "#52525b";

  const data = {
    datasets: [
      {
        data: [score, 100 - score],
        backgroundColor: [color, emptyColor],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "78%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative w-full max-w-[200px]">
        <Doughnut ref={chartRef} data={data} options={options} />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ top: "35%" }}
        >
          <div style={{ fontSize: "2rem", fontWeight: 700, color }}>
            {score}
          </div>
          <div
            style={{
              fontSize: "0.6875rem",
              marginTop: "0.125rem",
              color: textSecondary,
              fontWeight: 500,
            }}
          >
            out of 100
          </div>
        </div>
      </div>
      <div style={{ marginTop: "0.5rem", textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            padding: "0.25rem 0.75rem",
            borderRadius: "9999px",
            fontSize: "0.6875rem",
            fontWeight: 600,
            backgroundColor: isDark ? `${color}15` : `${color}12`,
            color,
            border: `1px solid ${color}40`,
          }}
        >
          {getRatingLabel(rating)}
        </div>
      </div>
    </div>
  );
}
