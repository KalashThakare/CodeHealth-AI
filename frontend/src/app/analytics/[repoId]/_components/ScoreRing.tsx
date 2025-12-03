import React from "react";

interface ScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  label?: string;
  showGrade?: boolean;
}

export function ScoreRing({
  score,
  size = "md",
  label,
  showGrade = true,
}: ScoreRingProps) {
  const sizes = { sm: 50, md: 80, lg: 110, xl: 140, "2xl": 200 };
  const strokeWidths = { sm: 3, md: 5, lg: 6, xl: 8, "2xl": 10 };
  const fontSizes = {
    sm: "0.875rem",
    md: "1.25rem",
    lg: "1.5rem",
    xl: "1.875rem",
    "2xl": "2.5rem",
  };

  const diameter = sizes[size];
  const strokeWidth = strokeWidths[size];
  const radius = (diameter - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getGrade = (s: number) => {
    if (s >= 90) return { grade: "A+", color: "#4ade80", label: "Excellent" };
    if (s >= 80) return { grade: "A", color: "#4ade80", label: "Great" };
    if (s >= 70) return { grade: "B", color: "#a3e635", label: "Good" };
    if (s >= 60) return { grade: "C", color: "#fbbf24", label: "Fair" };
    if (s >= 50) return { grade: "D", color: "#fb923c", label: "Needs Work" };
    return { grade: "F", color: "#f87171", label: "Critical" };
  };

  const { grade, color, label: gradeLabel } = getGrade(score);

  return (
    <div className="score-ring-container">
      <svg width={diameter} height={diameter} className="score-ring-svg">
        <circle
          className="score-ring-bg"
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="score-ring-progress"
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="score-ring-content" style={{ fontSize: fontSizes[size] }}>
        <span className="score-ring-value" style={{ color }}>
          {Math.round(score)}
        </span>
        {showGrade && (
          <span className="score-ring-grade" style={{ color }}>
            {grade}
          </span>
        )}
      </div>
      {label && <span className="score-ring-label">{label}</span>}
      {showGrade && (
        <span className="score-ring-grade-label">{gradeLabel}</span>
      )}
    </div>
  );
}
