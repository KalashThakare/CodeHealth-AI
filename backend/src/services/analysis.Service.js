import RepoFileMetrics from '../database/models/repoFileMetrics.js';
import Commit from '../database/models/commitsMetadata.js';
import CommitsAnalysis from '../database/models/commit_analysis.js';
import RepoMetadata from '../database/models/repoMedata.js';
import PushAnalysisMetrics from '../database/models/pushAnalysisMetrics.js';
import {Project}  from '../database/models/project.js';
import { Op } from 'sequelize';

import { mean, stdDev, createHistogram } from '../utils/functions.js';

export const calculateRiskScore = (cyclomatic, maintainability, halsteadVolume) => {
  const normComplexity = Math.min(100, (cyclomatic / 10) * 100);
  const normHalstead = Math.min(100, (halsteadVolume / 1000) * 100);
  const normMaintain = 100 - maintainability;

  return parseFloat(
    (0.4 * normComplexity + 0.4 * normHalstead + 0.2 * normMaintain).toFixed(2)
  );
};

const getPriorityReason = (fileData) => {
  const reasons = [];

  if (fileData.cyclomaticComplexity > 10) {
    reasons.push(`high complexity (${fileData.cyclomaticComplexity})`);
  }
  if (fileData.maintainabilityIndex < 40) {
    reasons.push(`low maintainability (${fileData.maintainabilityIndex.toFixed(1)})`);
  }
  if (fileData.halsteadVolume > 1000) {
    reasons.push(`high cognitive load (${fileData.halsteadVolume.toFixed(0)})`);
  }

  return reasons.length > 0 ? reasons.join(', ') : 'moderate technical debt';
};





//-----------------------------------------REPO-FILES ANALYSIS-----------------------------------------------------------------------//




export const calculateRepoMetrics = async (repoId, branch = 'main') => {
  try {
    // Fetch file metrics from database
    const fileMetrics = await RepoFileMetrics.findAll({
      where: { repoId, branch },
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

    if (!fileMetrics || fileMetrics.length === 0) {
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

    // Convert to plain objects and calculate risk scores
    const files = fileMetrics.map(fm => fm.toJSON());
    const filesWithRisk = files.map(f => ({
      ...f,
      riskScore: calculateRiskScore(
        f.cyclomaticComplexity || 0,
        f.maintainabilityIndex || 0,
        f.halsteadVolume || 0
      ),
    }));

    // Simple averages
    const avgCyclomatic = mean(files.map(f => f.cyclomaticComplexity || 0));
    const avgMaintainability = mean(files.map(f => f.maintainabilityIndex || 0));
    const avgHalstead = mean(files.map(f => f.halsteadVolume || 0));

    // Weighted averages by LOC
    const totalLoc = files.reduce((sum, f) => sum + (f.locTotal || 0), 0);

    let weightedCyclomatic = avgCyclomatic;
    let weightedMaintainability = avgMaintainability;
    let weightedHalstead = avgHalstead;

    if (totalLoc > 0) {
      weightedCyclomatic = files.reduce(
        (sum, f) => sum + ((f.cyclomaticComplexity || 0) * (f.locTotal || 0)) / totalLoc,
        0
      );
      weightedMaintainability = files.reduce(
        (sum, f) => sum + ((f.maintainabilityIndex || 0) * (f.locTotal || 0)) / totalLoc,
        0
      );
      weightedHalstead = files.reduce(
        (sum, f) => sum + ((f.halsteadVolume || 0) * (f.locTotal || 0)) / totalLoc,
        0
      );
    }

    // Technical debt score
    const techDebt = mean(filesWithRisk.map(f => f.riskScore));

    // Refactor priority files (top 10)
    const topFiles = filesWithRisk
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    const refactorPriority = topFiles.map(f => ({
      path: f.path,
      riskScore: f.riskScore,
      cyclomaticComplexity: f.cyclomaticComplexity,
      maintainabilityIndex: f.maintainabilityIndex,
      halsteadVolume: f.halsteadVolume,
      locTotal: f.locTotal || 0,
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
    return 'insufficient_data';
  }

  const dates = Object.keys(commitsPerDay).sort();
  const midPoint = Math.floor(dates.length / 2);

  const firstHalf = dates
    .slice(0, midPoint)
    .reduce((sum, d) => sum + commitsPerDay[d], 0);
  const secondHalf = dates
    .slice(midPoint)
    .reduce((sum, d) => sum + commitsPerDay[d], 0);

  if (secondHalf > firstHalf * 1.2) return 'increasing';
  if (secondHalf < firstHalf * 0.8) return 'decreasing';
  return 'stable';
};

const calculateConsistency = (commitsPerDay) => {
  if (!commitsPerDay || Object.keys(commitsPerDay).length === 0) {
    return 0.0;
  }

  const values = Object.values(commitsPerDay);
  if (values.length < 2) return 1.0;

  const avg = mean(values);
  if (avg === 0) return 0.0;

  const sd = stdDev(values);
  const coefficientOfVariation = sd / avg;

  const consistency = Math.max(0, 1 - coefficientOfVariation / 2);
  return parseFloat(consistency.toFixed(3));
};

export const analyzeCommitPatterns = async (repoId, branch = 'main') => {
  try {
    // Fetch commits and analysis
    const [commits, commitAnalysis] = await Promise.all([
      Commit.findAll({
        where: { repoId, branch },
        order: [['authorDate', 'DESC']],
        attributes: ['sha', 'message', 'authorName', 'authorEmail', 'authorDate'],
      }),
      CommitsAnalysis.findOne({
        where: { repoId, branch },
      }),
    ]);

    if (!commits || commits.length === 0) {
      return { error: 'No commits to analyze' };
    }

    const commitData = commits.map(c => c.toJSON());
    const analysisData = commitAnalysis ? commitAnalysis.toJSON() : {};

    // Parse commit dates
    const commitDates = commitData
      .map(c => new Date(c.authorDate))
      .filter(d => !isNaN(d))
      .sort((a, b) => a - b);

    if (commitDates.length === 0) {
      return { error: 'No valid commit dates' };
    }

    const firstCommit = commitDates[0];
    const lastCommit = commitDates[commitDates.length - 1];
    const daysActive = Math.floor((lastCommit - firstCommit) / (1000 * 60 * 60 * 24)) + 1;

    // Use analysis data
    const commitsPerDay = analysisData.commitsPerDay || {};
    const topContributors = analysisData.topContributors || [];

    const avgCommitsPerDay = commitData.length / Math.max(daysActive, 1);
    const activeDays = Object.keys(commitsPerDay).length;
    const activityRatio = activeDays / Math.max(daysActive, 1);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date(lastCommit);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCommits = commitDates.filter(d => d >= thirtyDaysAgo).length;

    // Bus factor
    let topContributorRatio = 0;
    let busFactorRisk = 'unknown';

    if (topContributors.length > 0 && commitData.length > 0) {
      topContributorRatio = topContributors[0].count / commitData.length;
      busFactorRisk =
        topContributorRatio > 0.7 ? 'high' : topContributorRatio > 0.5 ? 'medium' : 'low';
    }

    const messageLengths = commitData.map(c => (c.message || '').length);
    const avgMessageLength = mean(messageLengths);

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
        trend: calculateVelocityTrend(commitsPerDay),
        consistency: calculateConsistency(commitsPerDay),
      },
    };
  } catch (error) {
    console.error('Error analyzing commit patterns:', error);
    throw error;
  }
};

// ==================== HEALTH SCORE ====================

const identifyStrengths = (scores) => {
  const strengths = [];

  if ((scores.codeQuality || 0) >= 70) {
    strengths.push('High code quality and maintainability');
  }
  if ((scores.developmentActivity || 0) >= 70) {
    strengths.push('Active and consistent development');
  }
  if ((scores.busFactor || 0) >= 70) {
    strengths.push('Well-distributed knowledge across team');
  }
  if ((scores.community || 0) >= 70) {
    strengths.push('Strong community engagement');
  }

  return strengths.length > 0 ? strengths : ['Repository shows potential for improvement'];
};

const identifyWeaknesses = (scores) => {
  const weaknesses = [];

  if ((scores.codeQuality || 0) < 50) {
    weaknesses.push('Code quality needs improvement - high technical debt');
  }
  if ((scores.developmentActivity || 0) < 50) {
    weaknesses.push('Low development activity - consider more consistent commits');
  }
  if ((scores.busFactor || 0) < 50) {
    weaknesses.push('High bus factor risk - knowledge concentrated in few contributors');
  }
  if ((scores.community || 0) < 30) {
    weaknesses.push('Limited community engagement');
  }

  return weaknesses.length > 0 ? weaknesses : ['No major weaknesses identified'];
};

export const calculateRepoHealthScore = async (repoId, branch = 'main') => {
  try {
    // Fetch all necessary data
    const [repoMetrics, commitPatterns, metadata] = await Promise.all([
      calculateRepoMetrics(repoId, branch),
      analyzeCommitPatterns(repoId, branch),
      RepoMetadata.findOne({ where: { repoId, branch } }),
    ]);

    const scores = {};

    // 1. Code Quality Score (40%)
    if (repoMetrics.totalFiles > 0) {
      const maintainabilityScore = repoMetrics.avgMaintainabilityIndex;
      const complexityScore = Math.max(0, 100 - repoMetrics.avgCyclomaticComplexity * 5);
      const debtScore = 100 - repoMetrics.technicalDebtScore;

      const codeQualityScore =
        maintainabilityScore * 0.4 + complexityScore * 0.3 + debtScore * 0.3;
      scores.codeQuality = parseFloat(codeQualityScore.toFixed(2));
    } else {
      scores.codeQuality = 0;
    }

    // 2. Development Activity Score (30%)
    if (!commitPatterns.error) {
      const activityScore =
        (commitPatterns.activityRatio || 0) * 40 +
        Math.min(100, (commitPatterns.recentCommits30Days || 0) * 2) * 0.3 +
        (commitPatterns.velocity?.consistency || 0) * 30;
      scores.developmentActivity = parseFloat(activityScore.toFixed(2));

      const busFactorMap = { low: 100, medium: 60, high: 20, unknown: 50 };
      scores.busFactor = busFactorMap[commitPatterns.busFactor] || 50;
    } else {
      scores.developmentActivity = 0;
      scores.busFactor = 0;
    }

    // 3. Community Score (30%)
    if (metadata) {
      const metaData = metadata.toJSON();
      const stars = metaData.stars || 0;
      const forks = metaData.forks || 0;
      const watchers = metaData.watchers || 0;

      const engagementScore =
        Math.min(100, Math.log1p(stars) * 15) * 0.4 +
        Math.min(100, Math.log1p(forks) * 20) * 0.3 +
        Math.min(100, Math.log1p(watchers) * 15) * 0.3;
      scores.community = parseFloat(engagementScore.toFixed(2));
    } else {
      scores.community = 0;
    }

    // Overall health score
    const overallHealth =
      scores.codeQuality * 0.4 +
      scores.developmentActivity * 0.3 +
      scores.community * 0.15 +
      scores.busFactor * 0.15;

    let healthRating;
    if (overallHealth >= 80) healthRating = 'excellent';
    else if (overallHealth >= 60) healthRating = 'good';
    else if (overallHealth >= 40) healthRating = 'fair';
    else healthRating = 'needs_improvement';

    return {
      overallHealthScore: parseFloat(overallHealth.toFixed(2)),
      healthRating,
      componentScores: scores,
      strengths: identifyStrengths(scores),
      weaknesses: identifyWeaknesses(scores),
    };
  } catch (error) {
    console.error('Error calculating health score:', error);
    throw error;
  }
};

