"use client";

import React, { useEffect, useRef } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  // Determine color based on score
  const getColor = (score: number) => {
    if (score >= 80) return "#10b981"; // Green
    if (score >= 60) return "#3b82f6"; // Blue
    if (score >= 40) return "#f59e0b"; // Yellow
    return "#ef4444"; // Red
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

  const data = {
    datasets: [
      {
        data: [score, 100 - score],
        backgroundColor: [color, "rgba(229, 231, 235, 0.3)"],
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
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            out of 100
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div
          className="inline-block px-4 py-2 rounded-full text-sm font-semibold"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {getRatingLabel(rating)}
        </div>
      </div>
    </div>
  );
}
