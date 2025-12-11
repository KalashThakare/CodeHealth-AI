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
import { io } from "../server.js";
import CommitsAnalysis from "../database/models/commit_analysis.js";
import PushAnalysisMetrics from "../database/models/pushAnalysisMetrics.js";
import PullRequestAnalysis from "../database/models/pr_analysis_metrics.js";
import notification from "../database/models/notification.js";
import activity from "../database/models/activity.js";
import { createAlertNotification } from "../utils/alertNotificationHelper.js";
import trend from "../database/models/trend.js";
import { triggerAlertScan } from "./alertController.js";
import { error } from "console";
dotenv.config();


export const analyze_repo = async (req, res) => {
  try {
    const { repoId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "Unauthorised" });
    }

    console.log("RepoId:", repoId);
    console.log("User:", req.user?.id);

    const repo = await Project.findOne({
      where: { repoId: parseInt(repoId), initialised: true },
    });


    if (!repo) {
      return res.status(404).json({
        message: "Repository not found",
        repoId,
      });
    }

    const fullName = repo.fullName;
    const [owner, repoName] = fullName.split("/");

    const cacheKey = `metrics:repo:${repoId}`
    const cachedData = await connection.get(cacheKey);


    if (cachedData) {
      console.log("Returned from Redis Cache");
      const parsedData = JSON.parse(cachedData);

      return res.status(200).json({
        message: "Success",
        repoId,
        analysis: parsedData,
      });
    }

    let analysis = await RepositoryAnalysis.findOne({
      where: { repoId: parseInt(repoId) },
    });


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

      // Trigger background analysis
      triggerBackgroundAnalysis(repoId).catch((err) => {
        console.error("Background analysis error:", err);
      });

      await activity.create({
        userId: userId,
        activity: `${owner} triggered analysis on repo ${repoName}`
      })

      return res.status(202).json({
        message: "Analysis in progress",
        repoId,
        status: "processing",
        analysis: analysis.toJSON()
      });
    }

    const hasRealData = analysis.totalFiles > 0 || analysis.totalCommits > 0;

    if (hasRealData) {
      const analysisData = analysis.toJSON();
      await connection.set(
        cacheKey,
        JSON.stringify(analysisData),
        "EX",
        60 * 60 * 24
      );
      console.log("Cached analysis in Redis");
    }

    console.log("Returning analysis data...");
    console.log("=== END DEBUG ===");

    return res.status(200).json({
      message: "Success",
      repoId,
      analysis: analysis.toJSON(),
    });

  } catch (error) {
    console.error("=== ANALYZE REPO ERROR ===");
    console.error("Error:", error);
    console.error("Stack:", error.stack);
    console.error("=== END ERROR ===");

    try {
      const userId = req.user?.id;
      if (userId) {
        await createAlertNotification(
          userId,
          "Repository Analysis Error",
          `An error occurred while analyzing repository. Please try again later.`
        );
      }
    } catch (error) {

    }

    return res.status(500).json({
      message: "Failed to fetch repository analysis",
      error: error.message,
    });
  }
};

export async function triggerBackgroundAnalysis(repoId) {
  try {
    console.log(`[Background] Starting analysis for repo ${repoId}`);
    const timestamp = new Date().toISOString();
    console.log(`[Background] ========================================`);
    console.log(`[Background] STARTING analysis for repo ${repoId} at ${timestamp}`);
    console.log(`[Background] ========================================`);
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

    console.log(`[Background] Metrics calculated:`, {
      totalLOC: repoMetrics.totalLOC,
      totalFiles: repoMetrics.totalFiles,
      avgCyclomaticComplexity: repoMetrics.avgCyclomaticComplexity
    });

    const [updatedAnalysis] = await RepositoryAnalysis.upsert(
      {
        repoId: parsedRepoId,
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
        conflictFields: ['repoId'],
        returning: true
      }
    );

    const cacheKey = `metrics:repo:${parsedRepoId}`;
    const analysisData = updatedAnalysis.toJSON();
    await connection.set(
      cacheKey,
      JSON.stringify(analysisData),
      "EX",
      60 * 60 * 24
    );

    const repo = await Project.findOne({
      where: {
        repoId: repoId,
        initialised: true
      }
    })

    io.to(`user:${repo.userId}`).emit('notification', {
      type: "analysis",
      success: true,
      repoId,
      repoName: repo.fullName,
      message: `Repository analysis completed successfully for repo: ${repo.fullName}`,
      timestamp: new Date().toISOString()
    })

    const velocityTrendValue = isNaN(commitAnalysis.velocity?.trend) ? null : commitAnalysis.velocity?.trend;

    await trend.create({
      repoId: repoId,
      userId: repo.userId,
      healthScore: healthScore.overallHealthScore,
      technicalDebth: repoMetrics.technicalDebtScore,
      highRiskFiles: repoMetrics.refactorPriorityFiles.length,
      velocityTrend: velocityTrendValue,
      codeQuality: healthScore.componentScores.codeQuality
    })

    await notification.create({
      userId: repo.userId,
      title: "Analysis",
      message: `Repository analysis completed successfully for repo: ${repo.fullName}`
    })

    console.log(`[Background] Analysis completed for repo ${parsedRepoId}`);

    triggerAlertScan(parsedRepoId, repo.userId).catch((error) => {
      console.log("error trigger alert scan", error)
    });

  } catch (error) {
    console.error(`[Background] Analysis failed for repo ${repoId}:`, error);

    io.to(`user:${repo.userId}`).emit('notification', {
      type: "analysis",
      success: false,
      repoId,
      repoName: repo.fullName,
      message: `Repository analysis failed for repo: ${repo.fullName}`,
      timestamp: new Date().toISOString()
    })

    // await notification.create({
    //   userId:repo.userId,
    //   title:"Ananlysis failed",
    //   message:`Repository analysis failed for repo: ${repo.fullName}`
    // })

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
        message: "Success",
        repoId,
        aiInsights: JSON.parse(cachedData),
      });
    }

    const repo = await Project.findOne({ where: { repoId, initialised: true } });
    if (!repo) return res.status(404).json({ message: "No repository found" });

    const fullName = repo.fullName;
    const [owner, repoName] = fullName.split("/");

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
    let response;
    try {
      response = await axios.post(url, aiRequestData);
    } catch (axiosError) {
      console.error("AI Service Error:", axiosError);

      await createAlertNotification(
        repo.userId,
        "AI-Insights Generation Failed",
        `Failed to generate AI insights for ${owner}/${repoName}.`
      );

      if (axiosError.response) {
        return res.status(axiosError.response.status).json({
          message: "AI service error",
          error: axiosError.response.data,
        });
      }

      return res.status(500).json({
        message: "Failed to connect to AI service",
        error: errorMessage
      });
    }

    await connection.set(cacheKey, JSON.stringify(response.data), "EX", 60 * 60 * 24);

    console.log("Cached new AI insights in Redis");

    await notification.create({
      userId: repo.userId,
      title: "AI-Insights",
      message: `Your AI-analysis has been completed for ${repoName}. You can carry new AI-insights after 24 hours.`
    })

    const triggeredAt = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
    });

    await activity.create({
      userId: repo.userId,
      activity: `${owner} triggered AI-Insights for ${repoName} on ${triggeredAt}`
    })

    return res.status(200).json({
      message: "Success",
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

export const uninitializeRepo = async (req, res) => {
  try {
    const { repoId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "Unauthorised" })
    }
    if (!repoId) {
      return res.status(400).json({ message: "repoId is missing" });
    }

    const repo = await Project.findOne({
      where: {
        repoId: repoId,
        initialised: "true",
      }
    })

    if (!repo) {
      return res.status(400).json({ message: "repo is not initialised" });
    }

    await Promise.all([
      RepoFileMetrics.destroy({
        where: { repoId: repoId }
      }),
      PushAnalysisMetrics.destroy({
        where: { repoId: repoId }
      }),
      CommitsAnalysis.destroy({
        where: { repoId: repoId }
      }),
      Commit.destroy({
        where: { repoId: repoId }
      }),
      RepoMetadata.destroy({
        where: { repoId: repoId }
      }),
      RepositoryAnalysis.destroy({
        where: { repoId: repoId }
      }),
      PullRequestAnalysis.destroy({
        where: { repoId: repoId }
      }),
      trend.destroy({
        where: { repoId: repoId }
      })
    ]);

    await repo.update({ initialised: "false" })

    const cacheKey = `metrics:repo:${repoId}`;
    await connection.del(cacheKey);

    const fullName = repo.fullName;
    const [owner, repoName] = fullName.split("/");

    await activity.create({
      userId: userId,
      activity: `${owner} uninitialized a repo ${repoName}`
    })

    return res.status(200).json({
      success: true,
      message: "Repo Uninitialized"
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error" }, error)
  }
}
