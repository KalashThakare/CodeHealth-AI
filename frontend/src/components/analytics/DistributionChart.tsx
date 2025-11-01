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
}

export default function DistributionChart({
  data,
  label,
  color,
}: DistributionChartProps) {
  const chartRef = useRef<ChartJS<"bar"> | null>(null);
  const { isDark } = useTheme();
  const theme = getChartTheme(isDark);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  // Generate labels based on data length
  const labels = data.map((_, idx) => `Bucket ${idx + 1}`);

  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        backgroundColor: color + "CC", // Add opacity
        borderColor: color,
        borderWidth: 1,
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
            return `${context.dataset.label}: ${context.parsed.y} files`;
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
            size: 11,
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
            size: 11,
            family: "'Inter', system-ui, sans-serif",
          },
        },
      },
    },
  };

  return (
    <div className="relative w-full">
      <Bar ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
