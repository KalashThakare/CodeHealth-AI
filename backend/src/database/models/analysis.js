import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const RepositoryAnalysis = sequelize.define('RepositoryAnalysis', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    repoId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
        index: true
    },
    message: {
        type: DataTypes.STRING,
        defaultValue: 'Success'
    },

    // Result metrics
    avgCyclomaticComplexity: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    avgMaintainabilityIndex: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    avgHalsteadVolume: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    weightedCyclomaticComplexity: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    weightedMaintainabilityIndex: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    weightedHalsteadVolume: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    technicalDebtScore: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    totalLOC: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    totalFiles: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    // Refactor priority files (stored as JSON)
    refactorPriorityFiles: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },

    // Commit analysis
    totalCommits: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    daysActive: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    activeDays: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    activityRatio: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    avgCommitsPerDay: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    recentCommits30Days: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    contributorCount: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    topContributorRatio: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    busFactor: {
        type: DataTypes.STRING,
        allowNull: true
    },
    avgMessageLength: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    firstCommit: {
        type: DataTypes.DATE,
        allowNull: true
    },
    lastCommit: {
        type: DataTypes.DATE,
        allowNull: true
    },
    velocityTrend: {
        type: DataTypes.STRING,
        allowNull: true
    },
    velocityConsistency: {
        type: DataTypes.FLOAT,
        allowNull: true
    },

    // Repo health score
    overallHealthScore: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    healthRating: {
        type: DataTypes.STRING,
        allowNull: true
    },
    codeQualityScore: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    developmentActivityScore: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    busFactorScore: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    communityScore: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    strengths: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    weaknesses: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },

    // Distributions
    maintainabilityDistribution: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    complexityDistribution: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    }
}, {
    tableName: 'repository_analyses',
    timestamps: true,
    indexes: [
        {
            fields: ['repoId']
        },
        {
            fields: ['healthRating']
        },
        {
            fields: ['overallHealthScore']
        },
        {
            fields: ['technicalDebtScore']
        }
    ]
});

RepositoryAnalysis.createFromMetrics = async function (repoId, result, commitAnalysis, repoHealthScore, distributions) {
    return await this.create({
        repoId,
        message: 'Success',

        // Result metrics
        avgCyclomaticComplexity: result.avgCyclomaticComplexity,
        avgMaintainabilityIndex: result.avgMaintainabilityIndex,
        avgHalsteadVolume: result.avgHalsteadVolume,
        weightedCyclomaticComplexity: result.weightedCyclomaticComplexity,
        weightedMaintainabilityIndex: result.weightedMaintainabilityIndex,
        weightedHalsteadVolume: result.weightedHalsteadVolume,
        technicalDebtScore: result.technicalDebtScore,
        totalLOC: result.totalLOC,
        totalFiles: result.totalFiles,
        refactorPriorityFiles: result.refactorPriorityFiles,

        // Commit Analysis
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

        // Health Score
        overallHealthScore: repoHealthScore.overallHealthScore,
        healthRating: repoHealthScore.healthRating,
        codeQualityScore: repoHealthScore.componentScores?.codeQuality,
        developmentActivityScore: repoHealthScore.componentScores?.developmentActivity,
        busFactorScore: repoHealthScore.componentScores?.busFactor,
        communityScore: repoHealthScore.componentScores?.community,
        strengths: repoHealthScore.strengths,
        weaknesses: repoHealthScore.weaknesses,

        // Distributions
        maintainabilityDistribution: distributions.maintainabilityDistribution,
        complexityDistribution: distributions.complexityDistribution
    });
};

export default RepositoryAnalysis

