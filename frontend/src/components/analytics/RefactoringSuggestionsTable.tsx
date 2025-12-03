"use client";

import React, { useState } from "react";
import {
  FiAlertTriangle,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

interface RefactoringSuggestion {
  file: string;
  priority: string;
  currentIssues: string[];
  recommendations: Array<{
    action: string;
    benefit: string;
    effort: string;
  }>;
  estimatedEffort: string;
  risks: string;
  businessImpact: {
    currentCost: string;
    incidentRisk: string;
    velocitySlowdown: string;
    postRefactoringGain: string;
  };
}

interface RefactoringSuggestionsTableProps {
  suggestions: RefactoringSuggestion[];
}

export default function RefactoringSuggestionsTable({
  suggestions,
}: RefactoringSuggestionsTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const filteredSuggestions =
    filterPriority === "all"
      ? suggestions
      : suggestions.filter((s) => s.priority === filterPriority);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "var(--analytics-error)";
      case "high":
        return "var(--analytics-warning)";
      case "medium":
        return "var(--analytics-info)";
      default:
        return "var(--analytics-success)";
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClass = "analytics-badge";
    switch (priority.toLowerCase()) {
      case "critical":
        return `${baseClass} analytics-badge-error`;
      case "high":
        return `${baseClass} analytics-badge-warning`;
      case "medium":
        return `${baseClass} analytics-badge-info`;
      default:
        return `${baseClass} analytics-badge-success`;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="analytics-text-sm"
          style={{ color: "var(--analytics-text-secondary)" }}
        >
          Filter by priority:
        </span>
        {["all", "critical", "high", "medium", "low"].map((priority) => (
          <button
            key={priority}
            onClick={() => setFilterPriority(priority)}
            className={`analytics-text-xs px-2 py-1 rounded ${
              filterPriority === priority
                ? "analytics-btn"
                : "analytics-btn-secondary"
            }`}
            style={{
              textTransform: "capitalize",
            }}
          >
            {priority}
          </button>
        ))}
      </div>

      <div className="analytics-card analytics-card-compact overflow-x-auto">
        <table className="analytics-table">
          <thead>
            <tr>
              <th>File</th>
              <th>Priority</th>
              <th>Issues</th>
              <th>Effort</th>
              <th>Business Impact</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredSuggestions.map((suggestion, index) => (
              <React.Fragment key={index}>
                <tr
                  onClick={() =>
                    setExpandedRow(expandedRow === index ? null : index)
                  }
                  className="cursor-pointer"
                  style={{
                    background:
                      expandedRow === index
                        ? "var(--analytics-card-hover)"
                        : "transparent",
                  }}
                >
                  <td className="analytics-text-sm font-mono">
                    {suggestion.file.split("/").pop()}
                  </td>
                  <td>
                    <span className={getPriorityBadge(suggestion.priority)}>
                      {suggestion.priority}
                    </span>
                  </td>
                  <td className="analytics-text-sm">
                    {suggestion.currentIssues.length} issues
                  </td>
                  <td className="analytics-text-sm">
                    <div className="flex items-center gap-1">
                      <FiClock size={12} />
                      {suggestion.estimatedEffort}
                    </div>
                  </td>
                  <td className="analytics-text-sm">
                    <div className="flex items-center gap-1">
                      <FiAlertTriangle
                        size={12}
                        style={{ color: getPriorityColor(suggestion.priority) }}
                      />
                      {suggestion.businessImpact.incidentRisk}
                    </div>
                  </td>
                  <td>
                    {expandedRow === index ? (
                      <FiChevronUp size={16} />
                    ) : (
                      <FiChevronDown size={16} />
                    )}
                  </td>
                </tr>

                {expandedRow === index && (
                  <tr>
                    <td colSpan={6}>
                      <div
                        className="p-3 space-y-3"
                        style={{ background: "var(--analytics-card-hover)" }}
                      >
                        <div>
                          <p
                            className="analytics-text-xs"
                            style={{ color: "var(--analytics-text-tertiary)" }}
                          >
                            Full path:
                          </p>
                          <p
                            className="analytics-text-sm font-mono"
                            style={{ color: "var(--analytics-text-secondary)" }}
                          >
                            {suggestion.file}
                          </p>
                        </div>

                        <div>
                          <p
                            className="analytics-text-sm font-semibold analytics-mb-1"
                            style={{ color: "var(--analytics-text-primary)" }}
                          >
                            Current Issues:
                          </p>
                          <ul className="space-y-1">
                            {suggestion.currentIssues.map((issue, i) => (
                              <li
                                key={i}
                                className="analytics-text-sm flex items-start gap-2"
                                style={{
                                  color: "var(--analytics-text-secondary)",
                                }}
                              >
                                <FiAlertTriangle
                                  size={12}
                                  className="mt-0.5 flex-shrink-0"
                                  style={{ color: "var(--analytics-error)" }}
                                />
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p
                            className="analytics-text-sm font-semibold analytics-mb-1"
                            style={{ color: "var(--analytics-text-primary)" }}
                          >
                            Recommendations:
                          </p>
                          {suggestion.recommendations.map((rec, i) => (
                            <div
                              key={i}
                              className="analytics-mb-2 p-2 rounded"
                              style={{
                                background: "var(--analytics-card-bg)",
                                border: "1px solid var(--analytics-border)",
                              }}
                            >
                              <p
                                className="analytics-text-sm analytics-mb-1"
                                style={{
                                  color: "var(--analytics-text-primary)",
                                }}
                              >
                                {rec.action}
                              </p>
                              <div className="grid grid-cols-2 gap-2 analytics-text-xs">
                                <div>
                                  <span
                                    style={{
                                      color: "var(--analytics-text-tertiary)",
                                    }}
                                  >
                                    Benefit:
                                  </span>
                                  <p
                                    style={{
                                      color: "var(--analytics-success)",
                                    }}
                                  >
                                    {rec.benefit}
                                  </p>
                                </div>
                                <div>
                                  <span
                                    style={{
                                      color: "var(--analytics-text-tertiary)",
                                    }}
                                  >
                                    Effort:
                                  </span>
                                  <p
                                    style={{
                                      color: "var(--analytics-text-secondary)",
                                    }}
                                  >
                                    {rec.effort}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div
                            className="p-2 rounded"
                            style={{
                              background: "var(--analytics-card-bg)",
                              border: "1px solid var(--analytics-border)",
                            }}
                          >
                            <div className="flex items-center gap-1 analytics-mb-1">
                              <FiDollarSign
                                size={12}
                                style={{ color: "var(--analytics-error)" }}
                              />
                              <span
                                className="analytics-text-xs"
                                style={{
                                  color: "var(--analytics-text-secondary)",
                                }}
                              >
                                Current Cost
                              </span>
                            </div>
                            <p
                              className="analytics-text-sm font-semibold"
                              style={{ color: "var(--analytics-text-primary)" }}
                            >
                              {suggestion.businessImpact.currentCost}
                            </p>
                          </div>

                          <div
                            className="p-2 rounded"
                            style={{
                              background: "var(--analytics-card-bg)",
                              border: "1px solid var(--analytics-border)",
                            }}
                          >
                            <div className="flex items-center gap-1 analytics-mb-1">
                              <FiAlertTriangle
                                size={12}
                                style={{ color: "var(--analytics-warning)" }}
                              />
                              <span
                                className="analytics-text-xs"
                                style={{
                                  color: "var(--analytics-text-secondary)",
                                }}
                              >
                                Incident Risk
                              </span>
                            </div>
                            <p
                              className="analytics-text-sm font-semibold"
                              style={{ color: "var(--analytics-text-primary)" }}
                            >
                              {suggestion.businessImpact.incidentRisk}
                            </p>
                          </div>

                          <div
                            className="p-2 rounded"
                            style={{
                              background: "var(--analytics-card-bg)",
                              border: "1px solid var(--analytics-border)",
                            }}
                          >
                            <div className="flex items-center gap-1 analytics-mb-1">
                              <FiTrendingUp
                                size={12}
                                style={{ color: "var(--analytics-info)" }}
                              />
                              <span
                                className="analytics-text-xs"
                                style={{
                                  color: "var(--analytics-text-secondary)",
                                }}
                              >
                                Velocity Impact
                              </span>
                            </div>
                            <p
                              className="analytics-text-sm font-semibold"
                              style={{ color: "var(--analytics-error)" }}
                            >
                              {suggestion.businessImpact.velocitySlowdown}
                            </p>
                          </div>

                          <div
                            className="p-2 rounded"
                            style={{
                              background: "var(--analytics-card-bg)",
                              border: "1px solid var(--analytics-border)",
                            }}
                          >
                            <div className="flex items-center gap-1 analytics-mb-1">
                              <FiTrendingUp
                                size={12}
                                style={{ color: "var(--analytics-success)" }}
                              />
                              <span
                                className="analytics-text-xs"
                                style={{
                                  color: "var(--analytics-text-secondary)",
                                }}
                              >
                                Post-Refactor Gain
                              </span>
                            </div>
                            <p
                              className="analytics-text-sm font-semibold"
                              style={{ color: "var(--analytics-success)" }}
                            >
                              {suggestion.businessImpact.postRefactoringGain}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {filteredSuggestions.length === 0 && (
          <div className="text-center py-8">
            <p
              className="analytics-text-sm"
              style={{ color: "var(--analytics-text-secondary)" }}
            >
              No refactoring suggestions for this priority level
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
