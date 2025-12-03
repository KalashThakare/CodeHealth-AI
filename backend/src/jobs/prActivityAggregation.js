import { PRVelocityMetrics } from "../database/models/observability/prVelocityMetrics.js";
import { ReviewerMetrics } from "../database/models/observability/reviewerMetrics.js";
import { Op } from "sequelize";
import { Project } from "../database/models/project.js";
import { PullRequestActivity, PullRequestReviewActivity } from "../database/models/repoAnalytics.js";
import { getTimeDiffInMinutes, categorizeTime, getMedian } from "../utils/functions.js";
import cron from "node-cron";

/**
 * Compute missing time metrics for PRs
 */
async function computeMissingPRMetrics() {
  console.log('Computing missing PR metrics...');
  
  try {
    // Find PRs missing timeToFirstReview
    const prsNeedingFirstReview = await PullRequestActivity.findAll({
      where: {
        timeToFirstReview: null,
        createdAtGitHub: { [Op.ne]: null }
      },
      include: [{
        model: PullRequestReviewActivity,
        as: 'reviews',
        required: false
      }]
    });

    for (const pr of prsNeedingFirstReview) {
      if (pr.reviews && pr.reviews.length > 0) {
        const firstReview = pr.reviews.sort((a, b) => 
          new Date(a.reviewedAt) - new Date(b.reviewedAt)
        )[0];
        
        const timeToFirstReview = getTimeDiffInMinutes(
          pr.createdAtGitHub,
          firstReview.reviewedAt
        );
        
        await pr.update({
          timeToFirstReview,
          firstReviewedAt: firstReview.reviewedAt,
          reviewCount: pr.reviews.length
        });
      }
    }

    // Find merged PRs missing timeToMerge
    const prsNeedingMergeTime = await PullRequestActivity.findAll({
      where: {
        state: 'merged',
        timeToMerge: null,
        createdAtGitHub: { [Op.ne]: null },
        mergedAtGitHub: { [Op.ne]: null }
      }
    });

    for (const pr of prsNeedingMergeTime) {
      const timeToMerge = getTimeDiffInMinutes(
        pr.createdAtGitHub,
        pr.mergedAtGitHub
      );
      
      await pr.update({ timeToMerge });
    }

    console.log(`Updated ${prsNeedingFirstReview.length} PRs with first review time`);
    console.log(`Updated ${prsNeedingMergeTime.length} PRs with merge time`);
  } catch (error) {
    console.error('Error computing missing metrics:', error.message);
  }
}

/**
 * Aggregate PR velocity metrics for all repositories
 */
async function aggregatePRVelocity() {
  console.log('Starting PR velocity aggregation...');
  
  try {
    await computeMissingPRMetrics();
    
    const projects = await Project.findAll({
      attributes: ['repoId', 'fullName']
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (const project of projects) {
      await aggregateRepoPRMetrics(project.repoId, today, tomorrow);
      await aggregateReviewerMetrics(project.repoId, today, tomorrow);
    }

    console.log(`PR velocity aggregation completed for ${projects.length} repositories`);
  } catch (error) {
    console.error('Error in PR velocity aggregation:', error);
  }
}

/**
 * Aggregate PR metrics for a single repository
 */
async function aggregateRepoPRMetrics(repoId, startDate, endDate) {
  try {
    // Get all PRs
    const allPRs = await PullRequestActivity.findAll({
      where: { repoId },
      include: [{
        model: PullRequestReviewActivity,
        as: 'reviews',
        required: false
      }]
    });

    // PRs opened today
    const prsOpened = allPRs.filter(pr => {
      const created = new Date(pr.createdAtGitHub);
      return created >= startDate && created < endDate;
    }).length;

    // PRs merged today
    const prsMerged = allPRs.filter(pr => {
      const merged = new Date(pr.mergedAtGitHub);
      return merged >= startDate && merged < endDate;
    }).length;

    // PRs closed today (not merged)
    const prsClosed = allPRs.filter(pr => {
      const closed = new Date(pr.closedAtGitHub);
      return pr.state === 'closed' && closed >= startDate && closed < endDate;
    }).length;

    // Current open PRs
    const openPRs = allPRs.filter(pr => pr.state === 'open').length;

    // Stale PRs (open > 7 days, no review in last 3 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const stalePRs = allPRs.filter(pr => {
      if (pr.state !== 'open') return false;
      const created = new Date(pr.createdAtGitHub);
      if (created > sevenDaysAgo) return false;
      
      // Check last review activity
      if (pr.reviews && pr.reviews.length > 0) {
        const lastReview = pr.reviews.sort((a, b) => 
          new Date(b.reviewedAt) - new Date(a.reviewedAt)
        )[0];
        return new Date(lastReview.reviewedAt) < threeDaysAgo;
      }
      return true; // No reviews at all
    }).length;

    // Time to merge metrics (merged PRs only)
    const mergedPRs = allPRs.filter(pr => 
      pr.state === 'merged' && pr.timeToMerge != null
    );
    const mergeTimes = mergedPRs.map(pr => pr.timeToMerge);
    const avgTimeToMerge = mergeTimes.length > 0
      ? mergeTimes.reduce((a, b) => a + b, 0) / mergeTimes.length
      : 0;
    const medianTimeToMerge = getMedian(mergeTimes);

    // Time to first review metrics
    const reviewedPRs = allPRs.filter(pr => pr.timeToFirstReview != null);
    const reviewTimes = reviewedPRs.map(pr => pr.timeToFirstReview);
    const avgTimeToFirstReview = reviewTimes.length > 0
      ? reviewTimes.reduce((a, b) => a + b, 0) / reviewTimes.length
      : 0;
    const medianTimeToFirstReview = getMedian(reviewTimes);

    // Average reviews per PR
    const totalReviews = allPRs.reduce((sum, pr) => sum + (pr.reviewCount || 0), 0);
    const avgReviewsPerPR = allPRs.length > 0 ? totalReviews / allPRs.length : 0;

    // PRs without any review
    const prsWithoutReview = allPRs.filter(pr => 
      pr.state === 'open' && (pr.reviewCount === 0 || pr.reviewCount === null)
    ).length;

    // PRs by state
    const prsByState = {
      open: allPRs.filter(pr => pr.state === 'open').length,
      merged: allPRs.filter(pr => pr.state === 'merged').length,
      closed: allPRs.filter(pr => pr.state === 'closed').length
    };

    // Merge time distribution
    const mergeTimeDistribution = {
      under1Hour: 0,
      under4Hours: 0,
      under1Day: 0,
      under1Week: 0,
      over1Week: 0
    };
    mergeTimes.forEach(time => {
      const category = categorizeTime(time);
      mergeTimeDistribution[category]++;
    });

    // Review time distribution
    const reviewTimeDistribution = {
      under1Hour: 0,
      under4Hours: 0,
      under1Day: 0,
      over1Day: 0
    };
    reviewTimes.forEach(time => {
      if (time < 60) reviewTimeDistribution.under1Hour++;
      else if (time < 240) reviewTimeDistribution.under4Hours++;
      else if (time < 1440) reviewTimeDistribution.under1Day++;
      else reviewTimeDistribution.over1Day++;
    });

    // Upsert metrics
    await PRVelocityMetrics.upsert({
      repoId,
      date: startDate.toISOString().split('T')[0],
      prsOpened,
      prsMerged,
      prsClosed,
      avgTimeToMerge: parseFloat(avgTimeToMerge.toFixed(2)),
      medianTimeToMerge: parseFloat(medianTimeToMerge.toFixed(2)),
      avgTimeToFirstReview: parseFloat(avgTimeToFirstReview.toFixed(2)),
      medianTimeToFirstReview: parseFloat(medianTimeToFirstReview.toFixed(2)),
      openPRs,
      stalePRs,
      avgReviewsPerPR: parseFloat(avgReviewsPerPR.toFixed(2)),
      prsWithoutReview,
      prsByState,
      mergeTimeDistribution,
      reviewTimeDistribution
    });

    console.log(`Repo ${repoId}: ${prsOpened} opened, ${prsMerged} merged, ${stalePRs} stale`);
  } catch (error) {
    console.error(`Error aggregating PR metrics for repo ${repoId}:`, error.message);
  }
}

/**
 * Aggregate reviewer performance metrics
 */
async function aggregateReviewerMetrics(repoId, startDate, endDate) {
  try {
    const today = new Date(startDate);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all reviews for this repo
    const reviews = await PullRequestReviewActivity.findAll({
      where: { repoId },
      include: [{
        model: PullRequestActivity,
        as: 'pullRequest',
        required: true
      }]
    });

    // Group by reviewer
    const reviewerMap = new Map();

    reviews.forEach(review => {
      if (!review.reviewerId) return;

      if (!reviewerMap.has(review.reviewerId)) {
        reviewerMap.set(review.reviewerId, {
          reviewerId: review.reviewerId,
          reviewerName: review.reviewerName,
          reviewsToday: [],
          reviews30Days: [],
          responseTimes: []
        });
      }

      const reviewer = reviewerMap.get(review.reviewerId);
      const reviewDate = new Date(review.reviewedAt);

      // Reviews today
      if (reviewDate >= startDate && reviewDate < endDate) {
        reviewer.reviewsToday.push(review);
      }

      // Reviews in last 30 days
      if (reviewDate >= thirtyDaysAgo) {
        reviewer.reviews30Days.push(review);
      }

      // Calculate response time
      if (review.pullRequest && review.pullRequest.createdAtGitHub) {
        const responseTime = getTimeDiffInMinutes(
          review.pullRequest.createdAtGitHub,
          review.reviewedAt
        );
        if (responseTime !== null && responseTime > 0) {
          reviewer.responseTimes.push(responseTime);
        }
      }
    });

    // Calculate team average response time
    const allResponseTimes = Array.from(reviewerMap.values())
      .flatMap(r => r.responseTimes);
    const teamAvgResponseTime = allResponseTimes.length > 0
      ? allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length
      : 0;

    // Count pending reviews per reviewer
    const openPRs = await PullRequestActivity.findAll({
      where: { repoId, state: 'open' }
    });

    // Process each reviewer
    for (const [reviewerId, data] of reviewerMap) {
      const reviewsGiven = data.reviewsToday.length;
      const avgResponseTime = data.responseTimes.length > 0
        ? data.responseTimes.reduce((a, b) => a + b, 0) / data.responseTimes.length
        : 0;

      // Count review outcomes
      const approvals = data.reviewsToday.filter(r => 
        r.reviewState === 'approved'
      ).length;
      const changesRequested = data.reviewsToday.filter(r => 
        r.reviewState === 'changes_requested'
      ).length;
      const comments = data.reviewsToday.filter(r => 
        r.reviewState === 'commented'
      ).length;

      // Detect bottleneck (slower than team average * 1.5)
      const isBottleneck = avgResponseTime > (teamAvgResponseTime * 1.5);

      // Estimate pending reviews (simplified - count open PRs they've reviewed)
      const prNumbersReviewed = new Set(
        data.reviews30Days.map(r => r.prNumber)
      );
      const pendingReviews = openPRs.filter(pr => 
        prNumbersReviewed.has(pr.prNumber)
      ).length;

      // 30-day metrics
      const reviews30Days = data.reviews30Days.length;
      const avgResponseTime30Days = data.responseTimes.length > 0
        ? data.responseTimes.reduce((a, b) => a + b, 0) / data.responseTimes.length
        : 0;

      await ReviewerMetrics.upsert({
        repoId,
        reviewerId,
        reviewerName: data.reviewerName,
        date: startDate.toISOString().split('T')[0],
        reviewsGiven,
        avgResponseTime: parseFloat(avgResponseTime.toFixed(2)),
        approvals,
        changesRequested,
        comments,
        isBottleneck,
        pendingReviews,
        reviews30Days,
        avgResponseTime30Days: parseFloat(avgResponseTime30Days.toFixed(2))
      });
    }

    console.log(`Repo ${repoId}: Aggregated ${reviewerMap.size} reviewers`);
  } catch (error) {
    console.error(`Error aggregating reviewer metrics for repo ${repoId}:`, error.message);
  }
}

// ========== BACKFILL FUNCTION ==========

export async function backfillPRVelocity(days = 30) {
  console.log(`Backfilling PR velocity for last ${days} days...`);
  
  try {
    const projects = await Project.findAll({
      attributes: ['repoId', 'fullName']
    });

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      console.log(`Processing ${date.toISOString().split('T')[0]}`);

      for (const project of projects) {
        await aggregateRepoPRMetrics(project.repoId, date, nextDate);
        await aggregateReviewerMetrics(project.repoId, date, nextDate);
      }
    }

    console.log(`Backfill completed for ${projects.length} repositories`);
  } catch (error) {
    console.error('Error in backfill:', error);
  }
}

// ========== CRON JOB SETUP ==========

/**
 * Schedule: Every 2 hours
 */
export const prVelocityCron = cron.schedule('0 */2 * * *', async () => {
  console.log('Running PR velocity aggregation');
  await aggregatePRVelocity();
}, {
  scheduled: false,
  timezone: "UTC"
});