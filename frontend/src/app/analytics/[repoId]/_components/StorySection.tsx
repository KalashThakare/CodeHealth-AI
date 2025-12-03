"use client";

import React, { useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

interface StorySectionProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  expandable?: boolean;
  defaultExpanded?: boolean;
}

export function StorySection({
  icon,
  title,
  subtitle,
  children,
  expandable = false,
  defaultExpanded = true,
}: StorySectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <section className="story-section">
      <div
        className={`story-section-header ${expandable ? "expandable" : ""}`}
        onClick={() => expandable && setExpanded(!expanded)}
      >
        <div className="story-section-title-group">
          <span className="story-section-icon">{icon}</span>
          <div>
            <h2 className="story-section-title">{title}</h2>
            <p className="story-section-subtitle">{subtitle}</p>
          </div>
        </div>
        {expandable && (
          <button className="story-section-toggle">
            {expanded ? <FiChevronDown /> : <FiChevronRight />}
          </button>
        )}
      </div>
      {(!expandable || expanded) && (
        <div className="story-section-content">{children}</div>
      )}
    </section>
  );
}
