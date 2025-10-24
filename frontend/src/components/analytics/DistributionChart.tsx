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
        backgroundColor: color,
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
        },
        ticks: {
          color: "#9ca3af",
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
        },
        ticks: {
          color: "#9ca3af",
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
