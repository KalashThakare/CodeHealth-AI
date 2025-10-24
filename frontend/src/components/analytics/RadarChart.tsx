"use client";

import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  componentScores: {
    codeQuality: number;
    developmentActivity: number;
    busFactor: number;
    community: number;
  };
}

export default function RadarChart({ componentScores }: RadarChartProps) {
  const chartRef = useRef<ChartJS<"radar"> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const data = {
    labels: ["Code Quality", "Development Activity", "Bus Factor", "Community"],
    datasets: [
      {
        label: "Component Scores",
        data: [
          componentScores.codeQuality,
          componentScores.developmentActivity,
          componentScores.busFactor,
          componentScores.community,
        ],
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(59, 130, 246, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(59, 130, 246, 1)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          backdropColor: "transparent",
          color: "#9ca3af",
        },
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
        },
        pointLabels: {
          color: "#6b7280",
          font: {
            size: 12,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.parsed.r}/100`;
          },
        },
      },
    },
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <Radar ref={chartRef} data={data} options={options} />
    </div>
  );
}
