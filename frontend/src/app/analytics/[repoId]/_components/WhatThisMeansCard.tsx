import React from "react";
import {
  FiAward,
  FiThumbsUp,
  FiAlertTriangle,
  FiBarChart2,
  FiInfo,
  FiCheckCircle,
} from "react-icons/fi";

interface WhatThisMeansCardProps {
  score: number;
  type: "health" | "debt" | "complexity";
}

export function WhatThisMeansCard({ score, type }: WhatThisMeansCardProps) {
  const getContent = () => {
    if (type === "health") {
      if (score >= 80)
        return {
          icon: <FiAward size={18} />,
          iconBg: "#4ade80",
          title: "Your code is in great shape!",
          points: [
            "New team members can understand the code quickly",
            "Adding new features should be straightforward",
            "Bugs are likely to be found and fixed easily",
          ],
        };
      if (score >= 60)
        return {
          icon: <FiThumbsUp size={18} />,
          iconBg: "#a3e635",
          title: "Your code is doing well",
          points: [
            "Most code is manageable and understandable",
            "Some areas might slow down new development",
            "Consider addressing high-priority issues",
          ],
        };
      return {
        icon: <FiAlertTriangle size={18} />,
        iconBg: "#fbbf24",
        title: "Your code needs attention",
        points: [
          "New features may take longer to implement",
          "Bugs might be harder to track down",
          "Investing in cleanup will pay off",
        ],
      };
    }
    return {
      icon: <FiBarChart2 size={18} />,
      iconBg: "#3b82f6",
      title: "Analysis Complete",
      points: [],
    };
  };

  const content = getContent();

  return (
    <div className="what-this-means-card">
      <div className="what-this-means-header">
        <div
          className="what-this-means-icon"
          style={{ background: content.iconBg }}
        >
          {content.icon}
        </div>
        <h3>{content.title}</h3>
      </div>
      <div className="what-this-means-subheader">
        <FiInfo size={14} />
        <span>What this means for your team:</span>
      </div>
      <ul className="what-this-means-list">
        {content.points.map((point, idx) => (
          <li key={idx}>
            <FiCheckCircle size={14} />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
