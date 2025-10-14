import { Project } from "../database/models/project.js";
import dotenv from "dotenv";
import { analyzeCommitPatterns, calculateDistributions, calculateRepoHealthScore, calculateRepoMetrics } from "../services/analysis.Service.js";
import RepositoryAnalysis from "../database/models/analysis.js";
import axios from "axios";
dotenv.config();

RepositoryAnalysis.sync();

export const analyze_repo = async (req, res) => {
    try {
        const { repoId } = req.params;

        if (!repoId) return res.status(404).json({ message: "repoId is missing" });

        const repo = await Project.findOne({
            where: {
                repoId: repoId,
            }
        });

        if (!repo) return res.status(400).json({ message: `No repo found with repoId: ${repoId}` });

        const result = await calculateRepoMetrics(repoId);
        const commitAnalysis = await analyzeCommitPatterns(repoId);
        const repoHealthScore = await calculateRepoHealthScore(repoId);
        const distributions = await calculateDistributions(repoId);

        const analysis = await RepositoryAnalysis.createFromMetrics(
            repoId,
            result,
            commitAnalysis,
            repoHealthScore,
            distributions
        );

        return res.status(200).json({ message: "Success", analysis })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getAiInsights = async (req, res) => {
    try {
        const { repoId } = req.params;
        if (!repoId) return res.status(404).json({ message: "repoId not found" });

        const repo = await Project.findOne({
            where: {
                repoId: repoId
            }
        });

        if (!repo) return res.status(404).json({ message: "No repository found" });

        const analysis = await RepositoryAnalysis.findOne({
            where: {
                repoId: repoId
            }
        });

        if (!analysis) return res.status(404).json({ message: "No analysis found for this repo, please do analysis first" });

        // Build AI request data from the analysis record
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
                refactorPriorityFiles: analysis.refactorPriorityFiles
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
                    consistency: analysis.velocityConsistency
                }
            },
            repoHealthScore: {
                overallHealthScore: analysis.overallHealthScore,
                healthRating: analysis.healthRating,
                componentScores: {
                    codeQuality: analysis.codeQualityScore,
                    developmentActivity: analysis.developmentActivityScore,
                    busFactor: analysis.busFactorScore,
                    community: analysis.communityScore
                },
                strengths: analysis.strengths,
                weaknesses: analysis.weaknesses
            },
            distributions: {
                maintainabilityDistribution: analysis.maintainabilityDistribution,
                complexityDistribution: analysis.complexityDistribution
            }
        };

        // Call AI API
        const url = process.env.ANALYSIS_INTERNAL_URL + "/v2/api/analyze";
        const response = await axios.post(url, aiRequestData);

        return res.status(200).json({
            message: "Success",
            repoId,
            aiInsights: response.data
        });

    } catch (error) {
        console.error(error);
        
        // Handle axios errors specifically
        if (error.response) {
            return res.status(error.response.status).json({
                message: "AI service error",
                error: error.response.data
            });
        }
        
        return res.status(500).json({ message: "Internal server error" });
    }
}