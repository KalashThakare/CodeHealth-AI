/**
 * Chart Theme Utilities
 * Centralized theme management for all chart components
 * Vercel-like clean dark theme with high visibility
 */

export interface ChartTheme {
  primary: string;
  primaryRgb: string;
  background: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  gridColor: string;
  borderColor: string;
  tooltipBg: string;
  tooltipText: string;
  tooltipBorder: string;
}

export const getDarkTheme = (): ChartTheme => ({
  primary: "#3b82f6",
  primaryRgb: "59, 130, 246",
  background: "#0a0a0a",
  cardBackground: "#111111",
  textPrimary: "#fafafa",
  textSecondary: "#a1a1aa",
  gridColor: "rgba(255, 255, 255, 0.08)",
  borderColor: "#262626",
  tooltipBg: "rgba(24, 24, 27, 0.98)",
  tooltipText: "#fafafa",
  tooltipBorder: "#3f3f46",
});

export const getLightTheme = (): ChartTheme => ({
  primary: "#2563eb",
  primaryRgb: "37, 99, 235",
  background: "#fafafa",
  cardBackground: "#ffffff",
  textPrimary: "#09090b",
  textSecondary: "#52525b",
  gridColor: "rgba(0, 0, 0, 0.08)",
  borderColor: "#e4e4e7",
  tooltipBg: "rgba(255, 255, 255, 0.98)",
  tooltipText: "#09090b",
  tooltipBorder: "#e4e4e7",
});

export const getChartTheme = (isDark: boolean): ChartTheme => {
  return isDark ? getDarkTheme() : getLightTheme();
};

// Severity color functions with high contrast
export const getSeverityColor = (severity: string, isDark: boolean): string => {
  const severityLower = severity.toLowerCase();

  if (isDark) {
    switch (severityLower) {
      case "critical":
        return "#f87171"; // red-400
      case "high":
        return "#fb923c"; // orange-400
      case "medium":
        return "#fbbf24"; // amber-400
      case "low":
        return "#4ade80"; // green-400
      default:
        return "#a1a1aa"; // zinc-400
    }
  } else {
    switch (severityLower) {
      case "critical":
        return "#dc2626"; // red-600
      case "high":
        return "#ea580c"; // orange-600
      case "medium":
        return "#d97706"; // amber-600
      case "low":
        return "#16a34a"; // green-600
      default:
        return "#52525b"; // zinc-600
    }
  }
};

export const getSeverityBgColor = (
  severity: string,
  isDark: boolean
): string => {
  const severityLower = severity.toLowerCase();

  if (isDark) {
    switch (severityLower) {
      case "critical":
        return "rgba(248, 113, 113, 0.15)";
      case "high":
        return "rgba(251, 146, 60, 0.15)";
      case "medium":
        return "rgba(251, 191, 36, 0.15)";
      case "low":
        return "rgba(74, 222, 128, 0.15)";
      default:
        return "rgba(161, 161, 170, 0.15)";
    }
  } else {
    switch (severityLower) {
      case "critical":
        return "rgba(220, 38, 38, 0.1)";
      case "high":
        return "rgba(234, 88, 12, 0.1)";
      case "medium":
        return "rgba(217, 119, 6, 0.1)";
      case "low":
        return "rgba(22, 163, 74, 0.1)";
      default:
        return "rgba(82, 82, 91, 0.1)";
    }
  }
};

// Chart.js default options with theme
export const getChartOptions = (
  isDark: boolean,
  additionalOptions: any = {}
) => {
  const theme = getChartTheme(isDark);

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: theme.textPrimary,
          font: {
            family: "'Inter', system-ui, sans-serif",
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: theme.tooltipBg,
        titleColor: theme.tooltipText,
        bodyColor: theme.tooltipText,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        padding: 10,
        boxShadow: isDark
          ? "0 4px 12px rgba(0, 0, 0, 0.5)"
          : "0 4px 12px rgba(0, 0, 0, 0.1)",
        cornerRadius: 6,
        displayColors: true,
        titleFont: {
          size: 12,
          weight: "600" as const,
          family: "'Inter', system-ui, sans-serif",
        },
        bodyFont: {
          size: 11,
          family: "'Inter', system-ui, sans-serif",
        },
      },
    },
    scales: {
      x: {
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
      y: {
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
    ...additionalOptions,
  };
};

// Color palette functions with high contrast - Vercel style
export const getColorPalette = (isDark: boolean) => ({
  primary: isDark ? "#3b82f6" : "#2563eb",
  success: isDark ? "#4ade80" : "#16a34a",
  warning: isDark ? "#fbbf24" : "#d97706",
  error: isDark ? "#f87171" : "#dc2626",
  info: isDark ? "#60a5fa" : "#2563eb",
});
