/**
 * Chart Theme Utilities
 * Centralized theme management for all chart components
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
  primary: "#0070f3",
  primaryRgb: "0, 112, 243",
  background: "#000000",
  cardBackground: "#0a0a0a",
  textPrimary: "#ededed",
  textSecondary: "#a3a3a3",
  gridColor: "rgba(255, 255, 255, 0.05)",
  borderColor: "#333333",
  tooltipBg: "rgba(26, 26, 26, 0.98)",
  tooltipText: "#ededed",
  tooltipBorder: "#333333",
});

export const getLightTheme = (): ChartTheme => ({
  primary: "#7c3aed",
  primaryRgb: "124, 58, 237",
  background: "#f6f4fa",
  cardBackground: "#ffffff",
  textPrimary: "#1a0b2e",
  textSecondary: "#4a1d8f",
  gridColor: "rgba(124, 58, 237, 0.15)",
  borderColor: "#d1c4e9",
  tooltipBg: "rgba(255, 255, 255, 0.98)",
  tooltipText: "#1a0b2e",
  tooltipBorder: "#d1c4e9",
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
        return "#ef4444";
      case "high":
        return "#f97316";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  } else {
    switch (severityLower) {
      case "critical":
        return "#b91c1c";
      case "high":
        return "#c2410c";
      case "medium":
        return "#b45309";
      case "low":
        return "#047857";
      default:
        return "#374151";
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
        return "rgba(239, 68, 68, 0.15)";
      case "high":
        return "rgba(249, 115, 22, 0.15)";
      case "medium":
        return "rgba(245, 158, 11, 0.15)";
      case "low":
        return "rgba(16, 185, 129, 0.15)";
      default:
        return "rgba(107, 114, 128, 0.15)";
    }
  } else {
    switch (severityLower) {
      case "critical":
        return "rgba(185, 28, 28, 0.12)";
      case "high":
        return "rgba(194, 65, 12, 0.12)";
      case "medium":
        return "rgba(180, 83, 9, 0.12)";
      case "low":
        return "rgba(4, 120, 87, 0.12)";
      default:
        return "rgba(55, 65, 81, 0.12)";
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
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: theme.tooltipBg,
        titleColor: theme.tooltipText,
        bodyColor: theme.tooltipText,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        padding: 12,
        boxShadow: isDark
          ? "0 4px 12px rgba(0, 0, 0, 0.5)"
          : "0 4px 12px rgba(0, 0, 0, 0.1)",
        cornerRadius: 6,
        displayColors: true,
        titleFont: {
          size: 13,
          weight: "600" as const,
          family: "'Inter', system-ui, sans-serif",
        },
        bodyFont: {
          size: 12,
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
            size: 11,
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
            size: 11,
            family: "'Inter', system-ui, sans-serif",
          },
        },
      },
    },
    ...additionalOptions,
  };
};

// Color palette functions with high contrast
export const getColorPalette = (isDark: boolean) => ({
  primary: isDark ? "#0070f3" : "#7c3aed",
  success: isDark ? "#10b981" : "#047857",
  warning: isDark ? "#f59e0b" : "#b45309",
  error: isDark ? "#ef4444" : "#b91c1c",
  info: isDark ? "#3b82f6" : "#1d4ed8",
});
