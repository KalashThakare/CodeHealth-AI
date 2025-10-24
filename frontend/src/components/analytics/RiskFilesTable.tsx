"use client";

import React, { useState, useMemo } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

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

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-600 bg-red-50 dark:bg-red-900/20";
    if (score >= 60)
      return "text-orange-600 bg-orange-50 dark:bg-orange-900/20";
    if (score >= 40)
      return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
    return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No high-risk files identified. Great job! 🎉
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort("path")}
                className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                File Path
                {sortBy === "path" &&
                  (sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort("riskScore")}
                className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Risk Score
                {sortBy === "riskScore" &&
                  (sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort("cyclomaticComplexity")}
                className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Complexity
                {sortBy === "cyclomaticComplexity" &&
                  (sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort("maintainabilityIndex")}
                className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Maintainability
                {sortBy === "maintainabilityIndex" &&
                  (sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort("locTotal")}
                className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                LOC
                {sortBy === "locTotal" &&
                  (sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
              </button>
            </th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {sortedFiles.map((file, index) => (
            <React.Fragment key={index}>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900 dark:text-white font-mono truncate max-w-md">
                    {file.path}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(
                      file.riskScore
                    )}`}
                  >
                    {file.riskScore.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {file.cyclomaticComplexity.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {file.maintainabilityIndex.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {file.locTotal.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleRow(index)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
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
                    className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Reason:</strong> {file.reason}
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <strong>Halstead Volume:</strong>{" "}
                      {file.halsteadVolume.toFixed(1)}
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
