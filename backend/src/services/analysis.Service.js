import RepoFileMetrics from '../database/models/repoFileMetrics.js';
import Commit from '../database/models/commitsMetadata.js';
import CommitsAnalysis from '../database/models/commit_analysis.js';
import RepoMetadata from '../database/models/repoMedata.js';
import PushAnalysisMetrics from '../database/models/pushAnalysisMetrics.js';
import {Project}  from '../database/models/project.js';
import { Op } from 'sequelize';

import { mean, stdDev, createHistogram } from '../utils/functions.js';

export const calculateRiskScore = (cyclomatic, maintainability, halsteadVolume, loc = 0) => {
  // Normalize each metric into 0–100 scale
  const normComplexity = Math.min(100, (cyclomatic / 12) * 100); 
  const normHalstead = Math.min(100, (halsteadVolume / 1200) * 100); 
  const normMaintain = 100 - maintainability;

  // LOC normalization (reduce penalty for smaller files)
  const locFactor = Math.min(1, loc / 150); 
  const locPenalty = locFactor * 10; 

  // Weighted formula: maintainability contributes more
  const weighted =
    0.35 * normComplexity +
    0.35 * normHalstead +
    0.25 * normMaintain +
    0.05 * locPenalty;

  // Scale and clamp
  return parseFloat(Math.min(40, weighted / 2.5).toFixed(2)); // lower = healthier
};


const getPriorityReason = (fileData) => {
  const reasons = [];

  if (fileData.cyclomaticComplexity > 12) {
    reasons.push(`complex logic (${fileData.cyclomaticComplexity})`);
  }
  if (fileData.halsteadVolume > 1200) {
    reasons.push(`high cognitive load (${Math.round(fileData.halsteadVolume)})`);
  }
  if (fileData.maintainabilityIndex < 45) {
    reasons.push(`low maintainability (${fileData.maintainabilityIndex.toFixed(1)})`);
  }
  if (fileData.locTotal > 150) {
    reasons.push(`large file size (${fileData.locTotal} LOC)`);
  }

  // If everything is good but slightly heavy
  if (reasons.length === 0) {
    return 'stable but can benefit from modularization';
  }

  return reasons.join(', ');
};





//-----------------------------------------REPO-FILES ANALYSIS-----------------------------------------------------------------------//


export const calculateRepoMetrics = async (repoId, branch = 'main') => {
  try {
    const fileMetrics = await RepoFileMetrics.findAll({
      where: { repoId },
      attributes: [
        'path',
        'cyclomaticComplexity',
        'maintainabilityIndex',
        'halsteadVolume',
        'locTotal',
        'locSource',
        'locComments',
        'locBlank',
      ],
    });

    if (!fileMetrics?.length) {
      return {
        avgCyclomaticComplexity: 0,
        avgMaintainabilityIndex: 0,
        avgHalsteadVolume: 0,
        technicalDebtScore: 0,
        totalLOC: 0,
        totalFiles: 0,
        refactorPriorityFiles: [],
      };
    }

    const files = fileMetrics.map(fm => fm.toJSON());

    // include LOC in risk calculation
    const filesWithRisk = files.map(f => ({
      ...f,
      riskScore: calculateRiskScore(
        f.cyclomaticComplexity || 0,
        f.maintainabilityIndex || 0,
        f.halsteadVolume || 0,
        f.locSource || 0
      ),
    }));

    const avgCyclomatic = mean(files.map(f => f.cyclomaticComplexity || 0));
    const avgMaintainability = mean(files.map(f => f.maintainabilityIndex || 0));
    const avgHalstead = mean(files.map(f => f.halsteadVolume || 0));
    const totalLoc = files.reduce((sum, f) => sum + (f.locSource || 0), 0);

    const weighted = (key) =>
      totalLoc > 0
        ? files.reduce(
            (sum, f) => sum + ((f[key] || 0) * (f.locSource || 0)) / totalLoc,
            0
          )
        : 0;

    const weightedCyclomatic = weighted('cyclomaticComplexity');
    const weightedMaintainability = weighted('maintainabilityIndex');
    const weightedHalstead = weighted('halsteadVolume');

    const techDebt = mean(filesWithRisk.map(f => f.riskScore));

    // Improved sorting for priority list
    const topFiles = filesWithRisk
      .filter(f => f.riskScore > 10) 
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    const refactorPriority = topFiles.map(f => ({
      path: f.path,
      riskScore: f.riskScore,
      cyclomaticComplexity: f.cyclomaticComplexity,
      maintainabilityIndex: f.maintainabilityIndex,
      halsteadVolume: f.halsteadVolume,
      locTotal: f.locSource || 0,
      reason: getPriorityReason(f),
    }));

    return {
      avgCyclomaticComplexity: parseFloat(avgCyclomatic.toFixed(2)),
      avgMaintainabilityIndex: parseFloat(avgMaintainability.toFixed(2)),
      avgHalsteadVolume: parseFloat(avgHalstead.toFixed(2)),
      weightedCyclomaticComplexity: parseFloat(weightedCyclomatic.toFixed(2)),
      weightedMaintainabilityIndex: parseFloat(weightedMaintainability.toFixed(2)),
      weightedHalsteadVolume: parseFloat(weightedHalstead.toFixed(2)),
      technicalDebtScore: parseFloat(techDebt.toFixed(2)),
      totalLOC: totalLoc,
      totalFiles: files.length,
      refactorPriorityFiles: refactorPriority,
    };
  } catch (error) {
    console.error('Error calculating repo metrics:', error);
    throw error;
  }
};




//-------------------------------------- DISTRIBUTION ANALYSIS --------------------------------------//


export const calculateDistributions = async (repoId, branch = 'main') => {
  try {
    const fileMetrics = await RepoFileMetrics.findAll({
      where: { repoId, branch },
      attributes: ['maintainabilityIndex', 'cyclomaticComplexity'],
    });

    if (!fileMetrics || fileMetrics.length === 0) {
      return {
        maintainabilityDistribution: new Array(5).fill(0),
        complexityDistribution: new Array(5).fill(0),
      };
    }

    const files = fileMetrics.map(f => f.toJSON());
    const maintainabilityValues = files.map(f => f.maintainabilityIndex || 0);
    const complexityValues = files.map(f => f.cyclomaticComplexity || 0);

    return {
      maintainabilityDistribution: createHistogram(maintainabilityValues, 0, 100, 5),
      complexityDistribution: createHistogram(complexityValues, 0, 20, 5),
    };
  } catch (error) {
    console.error('Error calculating distributions:', error);
    throw error;
  }
};


//--------------------------------------------COMMMIT ANALYSIS-------------------------------------------//


const calculateVelocityTrend = (commitsPerDay) => {
  if (!commitsPerDay || Object.keys(commitsPerDay).length < 10) {
    return "insufficient_data";
  }

  const dates = Object.keys(commitsPerDay).sort();
  const midPoint = Math.floor(dates.length / 2);

  const firstHalf = dates
    .slice(0, midPoint)
    .reduce((sum, d) => sum + commitsPerDay[d], 0);
  const secondHalf = dates
    .slice(midPoint)
    .reduce((sum, d) => sum + commitsPerDay[d], 0);

  if (secondHalf > firstHalf * 1.2) return "increasing";
  if (secondHalf < firstHalf * 0.8) return "decreasing";
  return "stable";
};

const calculateConsistency = (commitsPerDay) => {
  if (!commitsPerDay || Object.keys(commitsPerDay).length === 0) return 0.0;

  const values = Object.values(commitsPerDay);
  if (values.length < 2) return 1.0;

  const avg = mean(values);
  if (avg === 0) return 0.0;

  const sd = stdDev(values);
  const coefficientOfVariation = sd / avg;

  const consistency = Math.max(0, 1 - coefficientOfVariation / 2);
  return parseFloat(consistency.toFixed(3));
};

export const analyzeCommitPatterns = async (repoId, branch = "main") => {
  try {
    const [commits, commitAnalysis] = await Promise.all([
      Commit.findAll({
        where: { repoId, branch },
        order: [["authorDate", "DESC"]],
        attributes: ["sha", "message", "authorName", "authorEmail", "authorDate"],
      }),
      CommitsAnalysis.findOne({
        where: { repoId, branch },
      }),
    ]);

    if (!commits || commits.length === 0) {
      return {
        error: "No commits to analyze",
        summary: "No commit history found for this branch.",
      };
    }

    const commitData = commits.map((c) => c.toJSON());
    const analysisData = commitAnalysis ? commitAnalysis.toJSON() : {};

    // Extract commit dates
    const commitDates = commitData
      .map((c) => new Date(c.authorDate))
      .filter((d) => !isNaN(d))
      .sort((a, b) => a - b);

    if (commitDates.length === 0) {
      return { error: "No valid commit dates", summary: "No valid commit timestamps detected." };
    }

    const firstCommit = commitDates[0];
    const lastCommit = commitDates[commitDates.length - 1];
    const daysActive =
      Math.floor((lastCommit - firstCommit) / (1000 * 60 * 60 * 24)) + 1;

    const commitsPerDay = analysisData.commitsPerDay || {};
    const topContributors = analysisData.topContributors || [];

    // Core activity calculations
    const avgCommitsPerDay = commitData.length / Math.max(daysActive, 1);
    const activeDays = Object.keys(commitsPerDay).length;
    const activityRatio = activeDays / Math.max(daysActive, 1);

    // Recent activity
    const thirtyDaysAgo = new Date(lastCommit);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCommits = commitDates.filter((d) => d >= thirtyDaysAgo).length;

    // Bus factor calculation
    let topContributorRatio = 0;
    let busFactorRisk = "unknown";

    if (topContributors.length > 0 && commitData.length > 0) {
      topContributorRatio = topContributors[0].count / commitData.length;
      busFactorRisk =
        topContributorRatio > 0.7
          ? "high"
          : topContributorRatio > 0.5
          ? "medium"
          : "low";
    }

    const messageLengths = commitData.map((c) => (c.message || "").length);
    const avgMessageLength = mean(messageLengths);

    // Velocity and consistency
    const velocityTrend = calculateVelocityTrend(commitsPerDay);
    const consistencyScore = calculateConsistency(commitsPerDay);

    let activitySummary = "";
    if (avgCommitsPerDay >= 3)
      activitySummary = "Very active repository with frequent daily commits.";
    else if (avgCommitsPerDay >= 1)
      activitySummary = "Moderately active repository with steady development pace.";
    else
      activitySummary =
        "Low commit frequency — may indicate slower or paused development.";

    let velocitySummary = "";
    if (velocityTrend === "increasing")
      velocitySummary = "Commit velocity is increasing — momentum is improving.";
    else if (velocityTrend === "decreasing")
      velocitySummary = "Commit velocity is slowing down — activity decline detected.";
    else if (velocityTrend === "stable")
      velocitySummary = "Commit velocity remains stable over time.";
    else
      velocitySummary = "Insufficient data to determine commit velocity trend.";

    const consistencyLevel =
      consistencyScore >= 0.85
        ? "very consistent"
        : consistencyScore >= 0.6
        ? "moderately consistent"
        : "inconsistent";
    const consistencySummary = `Commit patterns are ${consistencyLevel}, indicating ${
      consistencyLevel === "inconsistent"
        ? "irregular contribution intervals."
        : "a healthy cadence of development."
    }`;

    let busFactorSummary = "";
    if (busFactorRisk === "low")
      busFactorSummary =
        "Knowledge distribution is healthy — multiple contributors are active.";
    else if (busFactorRisk === "medium")
      busFactorSummary =
        "Moderate bus-factor risk — development relies on a few key contributors.";
    else if (busFactorRisk === "high")
      busFactorSummary =
        "High bus-factor risk — project depends heavily on a single contributor.";
    else
      busFactorSummary = "Bus factor risk is unclear due to limited contributor data.";

    return {
      totalCommits: commitData.length,
      daysActive,
      activeDays,
      activityRatio: parseFloat(activityRatio.toFixed(3)),
      avgCommitsPerDay: parseFloat(avgCommitsPerDay.toFixed(2)),
      recentCommits30Days: recentCommits,
      contributorCount: topContributors.length,
      topContributorRatio: parseFloat(topContributorRatio.toFixed(3)),
      busFactor: busFactorRisk,
      avgMessageLength: parseFloat(avgMessageLength.toFixed(1)),
      firstCommit: firstCommit.toISOString(),
      lastCommit: lastCommit.toISOString(),
      velocity: {
        trend: velocityTrend,
        consistency: consistencyScore,
      },
      // ── Human readable insights for UI or reports
      summaries: {
        activitySummary,
        velocitySummary,
        consistencySummary,
        busFactorSummary,
      },
      // ── Optional single-line dashboard summary
      summary: `${activitySummary} ${velocitySummary} ${consistencySummary} ${busFactorSummary}`,
    };
  } catch (error) {
    console.error("Error analyzing commit patterns:", error);
    throw error;
  }
};


// ==================== HEALTH SCORE ====================

const identifyStrengths = (scores) => {
  const strengths = [];

  if ((scores.codeQuality || 0) >= 70)
    strengths.push("High code quality and maintainability");
  if ((scores.developmentActivity || 0) >= 70)
    strengths.push("Active and consistent development patterns");
  if ((scores.busFactor || 0) >= 70)
    strengths.push("Healthy contributor distribution (low knowledge risk)");
  if ((scores.community || 0) >= 70)
    strengths.push("Strong community visibility and engagement");

  return strengths.length > 0
    ? strengths
    : ["Repository shows steady progress and potential for growth"];
};

const identifyWeaknesses = (scores) => {
  const weaknesses = [];

  if ((scores.codeQuality || 0) < 50)
    weaknesses.push("Code quality and maintainability need improvement");
  if ((scores.developmentActivity || 0) < 50)
    weaknesses.push("Development activity is inconsistent or low");
  if ((scores.busFactor || 0) < 50)
    weaknesses.push("High bus-factor risk — too few active contributors");
  if ((scores.community || 0) < 30)
    weaknesses.push("Limited external visibility or engagement");

  return weaknesses.length > 0
    ? weaknesses
    : ["No major weaknesses identified"];
};

export const calculateRepoHealthScore = async (repoId, branch = "main") => {
  try {
    const [repoMetrics, commitPatterns, metadata] = await Promise.all([
      calculateRepoMetrics(repoId, branch),
      analyzeCommitPatterns(repoId, branch),
      RepoMetadata.findOne({ where: { repoId, branch } }),
    ]);

    const scores = {};

    // ─────────────── Code-Quality (45 %) ───────────────
    if (repoMetrics.totalFiles > 0) {
      const maintainabilityScore = repoMetrics.avgMaintainabilityIndex || 0;
      const complexityScore = Math.max(
        0,
        100 - Math.min(100, repoMetrics.avgCyclomaticComplexity * 4)
      );
      const debtScore = Math.max(
        0,
        100 - Math.min(100, repoMetrics.technicalDebtScore * 2)
      );

      const codeQuality =
        maintainabilityScore * 0.45 +
        complexityScore * 0.35 +
        debtScore * 0.20;

      scores.codeQuality = parseFloat(codeQuality.toFixed(2));
    } else {
      scores.codeQuality = 0;
    }

    // ─────────────── Development Activity (25 %) ───────────────
    if (!commitPatterns.error) {
      // Normalize for repo size and smooth fluctuations
      const commits30 = commitPatterns.recentCommits30Days || 0;
      const velocity = commitPatterns.velocity?.consistency || 0;

      const activityScore = Math.min(100, (Math.log1p(commits30) * 18) + velocity * 60);
      const consistencyScore = (commitPatterns.activityRatio || 0) * 100;

      scores.developmentActivity = parseFloat(
        (0.6 * activityScore + 0.4 * consistencyScore).toFixed(2)
      );

      const busMap = { low: 90, medium: 65, high: 35, unknown: 55 };
      scores.busFactor = busMap[commitPatterns.busFactor] || 55;
    } else {
      scores.developmentActivity = 0;
      scores.busFactor = 0;
    }

    // ─────────────── Community (15 %) ───────────────
    if (metadata) {
      const meta = metadata.toJSON();
      const stars = meta.stars || 0;
      const forks = meta.forks || 0;
      const watchers = meta.watchers || 0;

      // Logarithmic scaling to damp large projects
      const starScore = Math.min(100, Math.log1p(stars) * 18);
      const forkScore = Math.min(100, Math.log1p(forks) * 22);
      const watchScore = Math.min(100, Math.log1p(watchers) * 20);

      const community =
        starScore * 0.4 + forkScore * 0.35 + watchScore * 0.25;

      scores.community = parseFloat(community.toFixed(2));
    } else {
      scores.community = 0;
    }

    // ─────────────── Overall Health ───────────────
    const overallHealth =
      scores.codeQuality * 0.45 +
      scores.developmentActivity * 0.25 +
      scores.busFactor * 0.15 +
      scores.community * 0.15;

    // Soft-graded rating
    let healthRating;
    if (overallHealth >= 85) healthRating = "excellent";
    else if (overallHealth >= 70) healthRating = "good";
    else if (overallHealth >= 55) healthRating = "fair";
    else if (overallHealth >= 40) healthRating = "needs_improvement";
    else healthRating = "critical";

    return {
      overallHealthScore: parseFloat(overallHealth.toFixed(2)),
      healthRating,
      componentScores: scores,
      strengths: identifyStrengths(scores),
      weaknesses: identifyWeaknesses(scores),
    };
  } catch (error) {
    console.error("Error calculating repository health score:", error);
    throw error;
  }
};
