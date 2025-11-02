import { Project } from "../database/models/project.js";
import dotenv from "dotenv";
import {
  analyzeCommitPatterns,
  calculateDistributions,
  calculateRepoHealthScore,
  calculateRepoMetrics,
} from "../services/analysis.Service.js";
import RepositoryAnalysis from "../database/models/analysis.js";
import RepoMetadata from "../database/models/repoMedata.js";
import axios from "axios";
import RepoFileMetrics from "../database/models/repoFileMetrics.js";
import Commit from "../database/models/commitsMetadata.js";
import { connection } from "../lib/redis.js";
dotenv.config();

RepositoryAnalysis.sync();

export const analyze_repo = async (req, res) => {
  try {
    const { repoId } = req.params;

    console.log("=== ANALYZE REPO DEBUG ===");
    console.log("RepoId:", repoId);
    console.log("User:", req.user?.id);

    const repo = await RepoMetadata.findOne({
      where: { repoId: parseInt(repoId) },
    });

    console.log("Repository found:", repo ? "YES" : "NO");

    if (!repo) {
      return res.status(404).json({
        message: "Repository not found",
        repoId,
      });
    }

    let analysis = await RepositoryAnalysis.findOne({
      where: { repoId: parseInt(repoId) },
    });

    console.log("Existing analysis found:", analysis ? "YES" : "NO");

    if (!analysis) {
      console.log("Creating new analysis record...");

      analysis = await RepositoryAnalysis.create({
        repoId: parseInt(repoId),
        avgCyclomaticComplexity: 0,
        avgMaintainabilityIndex: 0,
        avgHalsteadVolume: 0,
        weightedCyclomaticComplexity: 0,
        weightedMaintainabilityIndex: 0,
        weightedHalsteadVolume: 0,
        technicalDebtScore: 0,
        totalLOC: 0,
        totalFiles: 0,
        refactorPriorityFiles: [],
        totalCommits: 0,
        daysActive: 0,
        activeDays: 0,
        activityRatio: 0,
        avgCommitsPerDay: 0,
        recentCommits30Days: 0,
        contributorCount: 0,
        topContributorRatio: 0,
        busFactor: "unknown",
        avgMessageLength: 0,
        firstCommit: new Date().toISOString(),
        lastCommit: new Date().toISOString(),
        velocityTrend: "insufficient_data",
        velocityConsistency: 0,
        overallHealthScore: 0,
        healthRating: "needs_improvement",
        codeQualityScore: 0,
        developmentActivityScore: 0,
        busFactorScore: 0,
        communityScore: 0,
        strengths: [],
        weaknesses: [],
        maintainabilityDistribution: [0, 0, 0, 0, 0],
        complexityDistribution: [0, 0, 0, 0, 0],
      });

      console.log("New analysis created:", analysis.id);
    }

    triggerBackgroundAnalysis(repoId).catch((err) => {
      console.error("Background analysis error:", err);
    });

    console.log("Returning analysis data...");
    console.log("=== END DEBUG ===");

    return res.status(200).json({
      message: "Success",
      analysis: analysis.toJSON(),
    });
  } catch (error) {
    console.error("=== ANALYZE REPO ERROR ===");
    console.error("Error:", error);
    console.error("Stack:", error.stack);
    console.error("=== END ERROR ===");

    return res.status(500).json({
      message: "Failed to fetch repository analysis",
      error: error.message,
    });
  }
};

async function triggerBackgroundAnalysis(repoId) {
  try {
    console.log(`[Background] Starting analysis for repo ${repoId}`);

    const parsedRepoId = parseInt(repoId);
    

    const fileMetrics = await RepoFileMetrics.findAll({
      where: { repoId: parsedRepoId },
    });

    const commitData = await Commit.findAll({
      where: { repoId: parsedRepoId },
    });

    if (fileMetrics.length === 0) {
      console.log(
        `[Background] No file metrics found for repo ${parsedRepoId}, skipping analysis`
      );
      return;
    }

    if (commitData.length === 0) {
      console.log(
        `[Background] No commit data found for repo ${parsedRepoId}, skipping commit analysis`
      );
    }

    const repoMetrics = await calculateRepoMetrics(parsedRepoId);
    const commitAnalysis = await analyzeCommitPatterns(parsedRepoId);
    const distributions = await calculateDistributions(parsedRepoId);
    const healthScore = await calculateRepoHealthScore(parsedRepoId);

    await RepositoryAnalysis.update(
      {
        // Repo metrics
        avgCyclomaticComplexity: repoMetrics.avgCyclomaticComplexity,
        avgMaintainabilityIndex: repoMetrics.avgMaintainabilityIndex,
        avgHalsteadVolume: repoMetrics.avgHalsteadVolume,
        weightedCyclomaticComplexity: repoMetrics.weightedCyclomaticComplexity,
        weightedMaintainabilityIndex: repoMetrics.weightedMaintainabilityIndex,
        weightedHalsteadVolume: repoMetrics.weightedHalsteadVolume,
        technicalDebtScore: repoMetrics.technicalDebtScore,
        totalLOC: repoMetrics.totalLOC,
        totalFiles: repoMetrics.totalFiles,
        refactorPriorityFiles: repoMetrics.refactorPriorityFiles,

        // Commit analysis
        totalCommits: commitAnalysis.totalCommits,
        daysActive: commitAnalysis.daysActive,
        activeDays: commitAnalysis.activeDays,
        activityRatio: commitAnalysis.activityRatio,
        avgCommitsPerDay: commitAnalysis.avgCommitsPerDay,
        recentCommits30Days: commitAnalysis.recentCommits30Days,
        contributorCount: commitAnalysis.contributorCount,
        topContributorRatio: commitAnalysis.topContributorRatio,
        busFactor: commitAnalysis.busFactor,
        avgMessageLength: commitAnalysis.avgMessageLength,
        firstCommit: commitAnalysis.firstCommit,
        lastCommit: commitAnalysis.lastCommit,
        velocityTrend: commitAnalysis.velocity?.trend,
        velocityConsistency: commitAnalysis.velocity?.consistency,

        // Health score
        overallHealthScore: healthScore.overallHealthScore,
        healthRating: healthScore.healthRating,
        codeQualityScore: healthScore.componentScores.codeQuality,
        developmentActivityScore: healthScore.componentScores.developmentActivity,
        busFactorScore: healthScore.componentScores.busFactor,
        communityScore: healthScore.componentScores.community,
        strengths: healthScore.strengths,
        weaknesses: healthScore.weaknesses,

        // Distributions
        maintainabilityDistribution: distributions.maintainabilityDistribution,
        complexityDistribution: distributions.complexityDistribution,
      },
      {
        where: { repoId: parsedRepoId },
      }
    );

    console.log(`[Background] Analysis completed for repo ${parsedRepoId}`);
  } catch (error) {
    console.error(`[Background] Analysis failed for repo ${repoId}:`, error);
    throw error;
  }
}

export const getAiInsights = async (req, res) => {
  try {
    const { repoId } = req.params;
    if (!repoId) return res.status(404).json({ message: "repoId not found" });

    const cacheKey = `ai:repo:${repoId}`;
    const cachedData = await connection.get(cacheKey);

    if (cachedData) {
      console.log("Returned from Redis Cache");
      return res.status(200).json({
        message: "Success (from cache)",
        repoId,
        aiInsights: JSON.parse(cachedData),
      });
    }

    const repo = await Project.findOne({ where: { repoId } });
    if (!repo) return res.status(404).json({ message: "No repository found" });

    const analysis = await RepositoryAnalysis.findOne({ where: { repoId } });
    if (!analysis)
      return res.status(404).json({
        message: "No analysis found for this repo, please do analysis first",
      });

    const aiRequestData = {
      result: {
        avgCyclomaticComplexity: analysis.avgCyclomaticComplexity,
        avgMaintainabilityIndex: analysis.avgMaintainabilityIndex,
        avgHalsteadVolume: analysis.avgHalsteadVolume,
        weightedCyclomaticComplexity: analysis.weightedCyclomaticComplexity,
        weightedMaintainabilityIndex: analysis.weightedMaintainabilityIndex,
        weightedHalsteadVolume: analysis.weightedHalsteadVolume,
        technicalDebtScore: analysis.technicalDebtScore,
        totalLOC: analysis.totalLOC,
        totalFiles: analysis.totalFiles,
        refactorPriorityFiles: analysis.refactorPriorityFiles,
      },
      commitAnalysis: {
        totalCommits: analysis.totalCommits,
        daysActive: analysis.daysActive,
        activeDays: analysis.activeDays,
        activityRatio: analysis.activityRatio,
        avgCommitsPerDay: analysis.avgCommitsPerDay,
        recentCommits30Days: analysis.recentCommits30Days,
        contributorCount: analysis.contributorCount,
        topContributorRatio: analysis.topContributorRatio,
        busFactor: analysis.busFactor,
        avgMessageLength: analysis.avgMessageLength,
        firstCommit: analysis.firstCommit,
        lastCommit: analysis.lastCommit,
        velocity: {
          trend: analysis.velocityTrend,
          consistency: analysis.velocityConsistency,
        },
      },
      repoHealthScore: {
        overallHealthScore: analysis.overallHealthScore,
        healthRating: analysis.healthRating,
        componentScores: {
          codeQuality: analysis.codeQualityScore,
          developmentActivity: analysis.developmentActivityScore,
          busFactor: analysis.busFactorScore,
          community: analysis.communityScore,
        },
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
      },
      distributions: {
        maintainabilityDistribution: analysis.maintainabilityDistribution,
        complexityDistribution: analysis.complexityDistribution,
      },
    };

    const url = process.env.ANALYSIS_INTERNAL_URL + "/v2/api/analyze";
    const response = await axios.post(url, aiRequestData);

    await connection.set(cacheKey, JSON.stringify(response.data), "EX", 60 * 60 * 24);

    console.log("Cached new AI insights in Redis");

    return res.status(200).json({
      message: "Success (fresh)",
      repoId,
      aiInsights: response.data,
    });
  } catch (error) {
    console.error(error);

    if (error.response) {
      return res.status(error.response.status).json({
        message: "AI service error",
        error: error.response.data,
      });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

export const fetchAiInsights = async (req, res) => {
  try {
    const { repoId } = req.params;

    if (!repoId) return res.status(400).json({ message: "repoId is missing" });

    const repo = await Project.findOne({
      where: {
        repoId: repoId,
      },
    });

    if (!repo) return res.status(404).json({ message: "Project not found" });

    const analysis = await RepositoryAnalysis.findOne({
      where: {
        repoId: repoId,
      },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found for this repository",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Analysis found",
    });
  } catch (error) {
    console.error("Error fetching AI insights:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
