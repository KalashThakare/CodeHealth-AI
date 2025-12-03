import { PRVelocityMetrics } from "../database/models/observability/prVelocityMetrics.js";
import { PushActivityMetrics } from "../database/models/observability/pushActivityMetrics.js";
import { Op } from "sequelize";
import { PullRequestActivity, PullRequestReviewActivity } from "../database/models/repoAnalytics.js";
import { calculateAverage, calculateTrend, formatTime, calculatePerformanceRating, generateRecommendations } from "../utils/functions.js";
import { ReviewerMetrics } from "../database/models/observability/reviewerMetrics.js";
import trend from "../database/models/trend.js";
import { Project } from "../database/models/project.js";

export const pushActivity = async (req, res) => {
    try {
        const { repoId } = req.params;
        const days = parseInt(req.query.days) || 30;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const metrics = await PushActivityMetrics.findAll({
            where: {
                repoId: repoId,
                date: {
                    [Op.gte]: startDate.toISOString().split('T')[0]
                }
            },
            order: [['date', 'ASC']]
        });

        // Calculate summary statistics
        const summary = {
            totalPushes: metrics.reduce((sum, m) => sum + m.totalPushes, 0),
            totalCommits: metrics.reduce((sum, m) => sum + m.totalCommits, 0),
            avgPushesPerDay: metrics.length > 0
                ? (metrics.reduce((sum, m) => sum + m.totalPushes, 0) / metrics.length).toFixed(2)
                : 0,
            avgCommitsPerDay: metrics.length > 0
                ? (metrics.reduce((sum, m) => sum + m.totalCommits, 0) / metrics.length).toFixed(2)
                : 0,
            activeDays: metrics.filter(m => m.isActive).length,
            uniqueContributors: new Set(
                metrics.flatMap(m => m.contributorActivity.map(c => c.userId))
            ).size
        };

        // Aggregate hourly heatmap (combine all days)
        const heatmapData = Array(24).fill(0);
        metrics.forEach(metric => {
            metric.hourlyDistribution.forEach((count, hour) => {
                heatmapData[hour] += count;
            });
        });

        // Top contributors (across all days)
        const contributorMap = new Map();
        metrics.forEach(metric => {
            metric.contributorActivity.forEach(contributor => {
                if (!contributorMap.has(contributor.userId)) {
                    contributorMap.set(contributor.userId, {
                        userId: contributor.userId,
                        totalPushes: 0,
                        totalCommits: 0
                    });
                }
                const c = contributorMap.get(contributor.userId);
                c.totalPushes += contributor.pushCount;
                c.totalCommits += contributor.commitCount;
            });
        });

        const topContributors = Array.from(contributorMap.values())
            .sort((a, b) => b.totalCommits - a.totalCommits)
            .slice(0, 10);

        return res.status(200).json({
            summary,
            dailyMetrics: metrics,
            heatmapData: heatmapData.map((count, hour) => ({ hour, count })),
            topContributors
        });
    } catch (error) {
        console.error('Error fetching push activity:', error);
        return res.status(500).json({ error: error.message });
    }
}

export const heatMap = async (req, res) => {
    try {
        const { repoId } = req.params;
        const days = parseInt(req.query.days) || 30;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const metrics = await PushActivityMetrics.findAll({
            where: {
                repoId: repoId,
                date: {
                    [Op.gte]: startDate.toISOString().split('T')[0]
                }
            }
        });

        // Build heatmap: [{ day: "Monday", hour: 9, count: 15 }, ...]
        const heatmap = {};
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        metrics.forEach(metric => {
            const dayOfWeek = new Date(metric.date).getDay();
            const dayName = dayNames[dayOfWeek];

            metric.hourlyDistribution.forEach((count, hour) => {
                const key = `${dayName}-${hour}`;
                if (!heatmap[key]) {
                    heatmap[key] = { day: dayName, hour, count: 0 };
                }
                heatmap[key].count += count;
            });
        });

        const heatmapData = Object.values(heatmap);

        res.json({ heatmapData });
    } catch (error) {
        console.error('Error fetching activity heatmap:', error);
        res.status(500).json({ error: error.message });
    }
}

export const prVelocity = async(req,res)=>{
    try {
    const { repoId } = req.params;
    const days = parseInt(req.query.days) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await PRVelocityMetrics.findAll({
      where: {
        repoId: repoId,
        date: {
          [Op.gte]: startDate.toISOString().split('T')[0]
        }
      },
      order: [['date', 'ASC']]
    });

    // Calculate summary statistics
    const summary = {
      totalPRsOpened: metrics.reduce((sum, m) => sum + m.prsOpened, 0),
      totalPRsMerged: metrics.reduce((sum, m) => sum + m.prsMerged, 0),
      totalPRsClosed: metrics.reduce((sum, m) => sum + m.prsClosed, 0),
      
      avgTimeToMerge: calculateAverage(metrics.map(m => m.avgTimeToMerge)),
      medianTimeToMerge: calculateAverage(metrics.map(m => m.medianTimeToMerge)),
      
      avgTimeToFirstReview: calculateAverage(metrics.map(m => m.avgTimeToFirstReview)),
      medianTimeToFirstReview: calculateAverage(metrics.map(m => m.medianTimeToFirstReview)),
      
      currentOpenPRs: metrics.length > 0 ? metrics[metrics.length - 1].openPRs : 0,
      currentStalePRs: metrics.length > 0 ? metrics[metrics.length - 1].stalePRs : 0,
      
      avgReviewsPerPR: calculateAverage(metrics.map(m => m.avgReviewsPerPR)),
      prsWithoutReview: metrics.length > 0 ? metrics[metrics.length - 1].prsWithoutReview : 0
    };

    // Format times for display
    summary.avgTimeToMergeFormatted = formatTime(summary.avgTimeToMerge);
    summary.avgTimeToFirstReviewFormatted = formatTime(summary.avgTimeToFirstReview);

    // Trend analysis (comparing first half vs second half)
    const midpoint = Math.floor(metrics.length / 2);
    const firstHalf = metrics.slice(0, midpoint);
    const secondHalf = metrics.slice(midpoint);

    const trend = {
      mergeTime: calculateTrend(
        firstHalf.map(m => m.avgTimeToMerge),
        secondHalf.map(m => m.avgTimeToMerge)
      ),
      reviewTime: calculateTrend(
        firstHalf.map(m => m.avgTimeToFirstReview),
        secondHalf.map(m => m.avgTimeToFirstReview)
      ),
      throughput: calculateTrend(
        firstHalf.map(m => m.prsMerged),
        secondHalf.map(m => m.prsMerged)
      )
    };

    return res.status(200).json({
      summary,
      trend,
      dailyMetrics: metrics,
      chartData: metrics.map(m => ({
        date: m.date,
        opened: m.prsOpened,
        merged: m.prsMerged,
        timeToMerge: m.avgTimeToMerge,
        timeToReview: m.avgTimeToFirstReview
      }))
    });
  } catch (error) {
    console.error('Error fetching PR velocity:', error);
    return res.status(500).json({ error: error.message });
  }
}

export const stalePRs = async(req,res)=>{
    try {
    const { repoId } = req.params;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const stalePRs = await PullRequestActivity.findAll({
      where: {
        repoId: repoId,
        state: 'open',
        createdAtGitHub: {
          [Op.lt]: sevenDaysAgo
        }
      },
      include: [{
        model: PullRequestReviewActivity,
        as: 'reviews',
        required: false
      }],
      order: [['createdAtGitHub', 'ASC']]
    });

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Filter PRs with no recent activity
    const staleList = stalePRs.filter(pr => {
      if (!pr.reviews || pr.reviews.length === 0) return true;
      
      const lastReview = pr.reviews.sort((a, b) => 
        new Date(b.reviewedAt) - new Date(a.reviewedAt)
      )[0];
      
      return new Date(lastReview.reviewedAt) < threeDaysAgo;
    });

    const formattedPRs = staleList.map(pr => ({
      id: pr.id,
      prNumber: pr.prNumber,
      title: pr.title,
      authorId: pr.authorId,
      createdAt: pr.createdAtGitHub,
      daysSinceCreated: Math.floor(
        (new Date() - new Date(pr.createdAtGitHub)) / (1000 * 60 * 60 * 24)
      ),
      reviewCount: pr.reviewCount || 0,
      lastReviewDate: pr.reviews && pr.reviews.length > 0
        ? pr.reviews.sort((a, b) => 
            new Date(b.reviewedAt) - new Date(a.reviewedAt)
          )[0].reviewedAt
        : null
    }));

    res.status(200).json({
      count: formattedPRs.length,
      stalePRs: formattedPRs
    });
  } catch (error) {
    console.error('Error fetching stale PRs:', error);
    return res.status(500).json({ error: error.message });
  }
}

export const reviewerPerformance = async(req,res)=>{
    try {
    const { repoId } = req.params;
    if(!repoId){
        return res.status(400).json({message:"repoId is missing", success:false})
    }
    const days = parseInt(req.query.days) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get reviewer metrics
    const reviewerMetrics = await ReviewerMetrics.findAll({
      where: {
        repoId: repoId,
        date: {
          [Op.gte]: startDate.toISOString().split('T')[0]
        }
      },
      order: [['date', 'ASC']]
    });

    // Aggregate by reviewer
    const reviewerMap = new Map();

    reviewerMetrics.forEach(metric => {
      if (!reviewerMap.has(metric.reviewerId)) {
        reviewerMap.set(metric.reviewerId, {
          reviewerId: metric.reviewerId,
          reviewerName: metric.reviewerName,
          totalReviews: 0,
          responseTimes: [],
          approvals: 0,
          changesRequested: 0,
          comments: 0,
          bottleneckDays: 0,
          currentPendingReviews: 0
        });
      }

      const reviewer = reviewerMap.get(metric.reviewerId);
      reviewer.totalReviews += metric.reviewsGiven;
      reviewer.responseTimes.push(metric.avgResponseTime);
      reviewer.approvals += metric.approvals;
      reviewer.changesRequested += metric.changesRequested;
      reviewer.comments += metric.comments;
      if (metric.isBottleneck) reviewer.bottleneckDays++;
      reviewer.currentPendingReviews = metric.pendingReviews; // Latest value
    });

    // Calculate performance metrics
    const reviewers = Array.from(reviewerMap.values()).map(reviewer => {
      const avgResponseTime = reviewer.responseTimes.length > 0
        ? reviewer.responseTimes.reduce((a, b) => a + b, 0) / reviewer.responseTimes.length
        : 0;

      return {
        reviewerId: reviewer.reviewerId,
        reviewerName: reviewer.reviewerName,
        totalReviews: reviewer.totalReviews,
        avgResponseTime: parseFloat(avgResponseTime.toFixed(2)),
        avgResponseTimeFormatted: formatTime(avgResponseTime),
        approvals: reviewer.approvals,
        changesRequested: reviewer.changesRequested,
        comments: reviewer.comments,
        isBottleneck: reviewer.bottleneckDays > (days * 0.3), // Bottleneck > 30% of time
        bottleneckDays: reviewer.bottleneckDays,
        pendingReviews: reviewer.currentPendingReviews,
        performanceRating: calculatePerformanceRating(avgResponseTime)
      };
    });

    // Sort by response time (fastest first)
    reviewers.sort((a, b) => a.avgResponseTime - b.avgResponseTime);

    // Identify bottlenecks
    const bottlenecks = reviewers
      .filter(r => r.isBottleneck)
      .sort((a, b) => b.pendingReviews - a.pendingReviews);

    // Team statistics
    const teamStats = {
      totalReviewers: reviewers.length,
      totalReviews: reviewers.reduce((sum, r) => sum + r.totalReviews, 0),
      avgTeamResponseTime: calculateAverage(reviewers.map(r => r.avgResponseTime)),
      bottleneckCount: bottlenecks.length,
      totalPendingReviews: reviewers.reduce((sum, r) => sum + r.pendingReviews, 0)
    };

    teamStats.avgTeamResponseTimeFormatted = formatTime(teamStats.avgTeamResponseTime);

    return res.status(200).json({
      teamStats,
      reviewers,
      bottlenecks,
      recommendations: generateRecommendations(reviewers, bottlenecks)
    });
  } catch (error) {
    console.error('Error fetching reviewer performance:', error);
    return res.status(500).json({ error: error.message });
  }
}

export const prDistribution = async(req,res)=>{
    try {
    const { repoId } = req.params;
    const days = parseInt(req.query.days) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await PRVelocityMetrics.findAll({
      where: {
        repoId: repoId,
        date: {
          [Op.gte]: startDate.toISOString().split('T')[0]
        }
      }
    });

    // Aggregate distributions
    const mergeTimeDistribution = {
      under1Hour: 0,
      under4Hours: 0,
      under1Day: 0,
      under1Week: 0,
      over1Week: 0
    };

    const reviewTimeDistribution = {
      under1Hour: 0,
      under4Hours: 0,
      under1Day: 0,
      over1Day: 0
    };

    metrics.forEach(metric => {
      Object.keys(mergeTimeDistribution).forEach(key => {
        mergeTimeDistribution[key] += metric.mergeTimeDistribution[key] || 0;
      });

      Object.keys(reviewTimeDistribution).forEach(key => {
        reviewTimeDistribution[key] += metric.reviewTimeDistribution[key] || 0;
      });
    });

    return res.status(200).json({
      mergeTimeDistribution,
      reviewTimeDistribution
    });
  } catch (error) {
    console.error('Error fetching PR distribution:', error);
    return res.status(500).json({ error: error.message });
  }
}



export const getTrendAnalysis = async(req, res)=>{
  try {
    const { repoId } = req.params;

    if (!repoId) {
      return res.status(400).json({ error: "Missing repoId in params" });
    }

    const project = await Project.findOne({
      where: { repoId }
    });

    if (!project) {
      return res.status(404).json({
        error: "Repository not found or you do not have access."
      });
    }

    const trendRows = await trend.findAll({
      where: { repoId },
      order: [["createdAt", "ASC"]],
    });

    if (!trendRows.length) {
      return res.json({
        healthTimeline: [],
        riskTimeline: [],
        velocityTimeline: [],
        quickSummary: {}
      });
    }

    const healthTimeline = trendRows.map(t => ({
      date: t.createdAt,
      healthScore: t.healthScore ?? null,
      codeQuality: t.codeQuality ?? null,
    }));

    const riskTimeline = trendRows.map(t => ({
      date: t.createdAt,
      technicalDebt: t.technicalDebth ?? null,
      highRiskFiles: t.highRiskFiles ?? 0,
    }));

    const velocityTimeline = trendRows.map(t => ({
      date: t.createdAt,
      velocityTrend: t.velocityTrend ?? null,
    }));

    const latest = trendRows.at(-1);

    const quickSummary = {
      currentHealthScore: latest.healthScore ?? null,
      currentTechnicalDebt: latest.technicalDebth ?? null,
      currentHighRiskFiles: latest.highRiskFiles ?? 0,
      currentVelocityTrend: latest.velocityTrend ?? null,
      currentCodeQuality: latest.codeQuality ?? null,
      lastUpdated: latest.createdAt
    };

    return res.json({
      healthTimeline,
      riskTimeline,
      velocityTimeline,
      quickSummary
    });

  } catch (error) {
    console.error("Trend analysis error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
