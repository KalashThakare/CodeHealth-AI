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
  const { isDark } = useTheme();
  const theme = getChartTheme(isDark);

  // Primary color based on theme
  const primaryColor = isDark ? "#0070f3" : "#7c3aed";
  const primaryColorRgb = isDark ? "0, 112, 243" : "124, 58, 237";

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
          color: theme.textSecondary,
          font: {
            size: 11,
            family: "'Inter', system-ui, sans-serif",
          },
        },
        grid: {
          color: theme.gridColor,
        },
        pointLabels: {
          color: theme.textSecondary,
          font: {
            size: 12,
            family: "'Inter', system-ui, sans-serif",
            weight: 500 as const,
          },
        },
        angleLines: {
          color: theme.gridColor,
        },
      },
    },
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
