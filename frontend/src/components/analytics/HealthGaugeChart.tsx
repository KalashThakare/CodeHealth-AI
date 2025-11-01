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

  // Determine color based on score and theme - HIGH CONTRAST for light theme
  const getColor = (score: number) => {
    if (score >= 80) return isDark ? "#10b981" : "#047857"; // Darker green for light
    if (score >= 60) return isDark ? "#3b82f6" : "#1d4ed8"; // Darker blue for light
    if (score >= 40) return isDark ? "#f59e0b" : "#b45309"; // Darker yellow for light
    return isDark ? "#ef4444" : "#b91c1c"; // Darker red for light
  };

  const getRatingLabel = (rating: string) => {
    const labels: Record<string, string> = {
      excellent: "Excellent",
      good: "Good",
      fair: "Fair",
      needs_improvement: "Needs Improvement",
    };
    return labels[rating] || rating;
  };

  const color = getColor(score);
  const emptyColor = isDark
    ? "rgba(255, 255, 255, 0.05)"
    : "rgba(124, 58, 237, 0.12)";
  const textSecondary = isDark ? "#a3a3a3" : "#4a1d8f";

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
    cutout: "75%",
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
      <div className="relative w-full max-w-sm">
        <Doughnut ref={chartRef} data={data} options={options} />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ top: "40%" }}
        >
          <div className="text-5xl font-bold" style={{ color }}>
            {score}
          </div>
          <div
            className="text-sm mt-1"
            style={{ color: textSecondary, fontWeight: "600" }}
          >
            out of 100
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div
          className="inline-block px-4 py-2 rounded-full text-sm font-bold border-2"
          style={{
            backgroundColor: isDark ? `${color}20` : `${color}15`,
            color,
            borderColor: color,
          }}
        >
          {getRatingLabel(rating)}
        </div>
      </div>
    </div>
  );
}
