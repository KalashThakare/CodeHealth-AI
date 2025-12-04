import RepositoryAnalysis from "../database/models/analysis.js";
import { PRVelocityMetrics } from "../database/models/observability/prVelocityMetrics.js";

export function evaluateCondition(currentValue, operator, threshold) {
    switch (operator) {
        case '<': return currentValue < threshold;
        case '>': return currentValue > threshold;
        case '<=': return currentValue <= threshold;
        case '>=': return currentValue >= threshold;
        case '==': return currentValue === threshold;
        default: return false;
    }
}

export function isInCooldown(lastTriggeredAt, cooldownMinutes) {
    if (!lastTriggeredAt) return false;
    const cooldownMs = cooldownMinutes * 60 * 1000;
    const timeSinceLastTrigger = Date.now() - new Date(lastTriggeredAt).getTime();
    return timeSinceLastTrigger < cooldownMs;
}

export async function getRepoMetrics(repoId) {

    if (!repoId) {
        throw Error("repoId is missing");
    }

    const metrics = await RepositoryAnalysis.findOne({
        where: {
            repoId: repoId
        }
    })

    const stalePr = await PRVelocityMetrics.findOne({
        where: { repoId },
        order: [['date', 'DESC']],   // latest date
        attributes: ['stalePRs']     // only fetch stalePRs column
    });

    const latestStaleCount = stalePr ? stalePr.stalePRs : 0;

    return {
        healthScore: metrics.overallHealthScore || 0, // Get from your health score calculation
        stalePRs: latestStaleCount, // Count of stale PRs
        codeQuality: metrics.codeQualityScore || 0, // Your code quality metric
        highRiskFiles: metrics.refactorPriorityFiles.length || 0, // Count of high risk files
        technicalDebt: metrics.technicalDebtScore || 0 // Your technical debt metric
    };
}