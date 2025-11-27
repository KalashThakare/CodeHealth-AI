"use client";

import React, { useState, useMemo } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { PartyPopper } from "lucide-react";

interface RiskFile {
  path: string;
  riskScore: number;
  cyclomaticComplexity: number;
  maintainabilityIndex: number;
  halsteadVolume: number;
  locTotal: number;
  reason: string;
}

interface RiskFilesTableProps {
  files: RiskFile[];
}

export default function RiskFilesTable({ files }: RiskFilesTableProps) {
  const [sortBy, setSortBy] = useState<keyof RiskFile>("riskScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Sort files
  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      const aNum = Number(aVal);
      const bNum = Number(bVal);
      return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
    });
  }, [files, sortBy, sortOrder]);

  const handleSort = (column: keyof RiskFile) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const getRiskBadgeClass = (score: number) => {
    if (score >= 80) return "analytics-badge analytics-badge-error";
    if (score >= 60) return "analytics-badge analytics-badge-warning";
    if (score >= 40) return "analytics-badge analytics-badge-info";
    return "analytics-badge analytics-badge-success";
  };

  if (files.length === 0) {
    return (
      <div
        className="text-center py-12 flex items-center justify-center gap-2"
        style={{ color: "var(--analytics-text-secondary)" }}
      >
        No high-risk files identified. Great job!{" "}
        <PartyPopper className="w-5 h-5 text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="analytics-table">
        <thead>
          <tr>
            <th>
              <button
                onClick={() => handleSort("path")}
                className="flex items-center gap-1"
              >
                File Path
                {sortBy === "path" &&
                  (sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
              </button>
            </th>
            <th>
              <button
                onClick={() => handleSort("riskScore")}
                className="flex items-center gap-1"
              >
                Risk Score
                {sortBy === "riskScore" &&
                  (sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
              </button>
            </th>
            <th>
              <button
                onClick={() => handleSort("cyclomaticComplexity")}
                className="flex items-center gap-1"
              >
                Complexity
                {sortBy === "cyclomaticComplexity" &&
                  (sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
              </button>
            </th>
            <th>
              <button
                onClick={() => handleSort("maintainabilityIndex")}
                className="flex items-center gap-1"
              >
                Maintainability
                {sortBy === "maintainabilityIndex" &&
                  (sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
              </button>
            </th>
            <th>
              <button
                onClick={() => handleSort("locTotal")}
                className="flex items-center gap-1"
              >
                LOC
                {sortBy === "locTotal" &&
                  (sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
              </button>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sortedFiles.map((file, index) => (
            <React.Fragment key={index}>
              <tr
                style={{
                  background: expandedRows.has(index)
                    ? "var(--analytics-card-hover)"
                    : "transparent",
                }}
              >
                <td className="analytics-text-sm font-mono">{file.path}</td>
                <td>
                  <span className={getRiskBadgeClass(file.riskScore)}>
                    {file.riskScore.toFixed(1)}
                  </span>
                </td>
                <td className="analytics-text-sm">
                  {file.cyclomaticComplexity.toFixed(1)}
                </td>
                <td className="analytics-text-sm">
                  {file.maintainabilityIndex.toFixed(1)}
                </td>
                <td className="analytics-text-sm">
                  {file.locTotal.toLocaleString()}
                </td>
                <td>
                  <button
                    onClick={() => toggleRow(index)}
                    style={{ color: "var(--analytics-accent)" }}
                  >
                    {expandedRows.has(index) ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    )}
                  </button>
                </td>
              </tr>
              {expandedRows.has(index) && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "1rem",
                      background: "var(--analytics-card-hover)",
                    }}
                  >
                    <div className="analytics-text-sm space-y-2">
                      <div>
                        <strong
                          style={{ color: "var(--analytics-text-primary)" }}
                        >
                          Reason:
                        </strong>{" "}
                        <span
                          style={{ color: "var(--analytics-text-secondary)" }}
                        >
                          {file.reason}
                        </span>
                      </div>
                      <div>
                        <strong
                          style={{ color: "var(--analytics-text-primary)" }}
                        >
                          Halstead Volume:
                        </strong>{" "}
                        <span
                          style={{ color: "var(--analytics-text-secondary)" }}
                        >
                          {file.halsteadVolume.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
