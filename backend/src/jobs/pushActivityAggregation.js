import { PushActivityMetrics } from "../database/models/observability/pushActivityMetrics.js";
import { Project } from "../database/models/project.js";
import { Op } from 'sequelize';
import { RepoPushEvent } from "../database/models/repoAnalytics.js";
import cron from 'node-cron';

export async function aggregatePushActivity() {
  console.log('Starting push activity aggregation...');
  
  try {
    // Get all active projects
    const projects = await Project.findAll({
      attributes: ['repoId', 'fullName']
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (const project of projects) {
      await aggregateRepoActivity(project.repoId, today, tomorrow);
    }

    console.log(`Push activity aggregation completed for ${projects.length} repositories`);
  } catch (error) {
    console.error('Error in push activity aggregation:', error);
  }
}

export async function aggregateRepoActivity(repoId, startDate, endDate) {
  try {
    // Fetch all push events for today
    const pushEvents = await RepoPushEvent.findAll({
      where: {
        repoId: repoId,
        pushedAt: {
          [Op.gte]: startDate,
          [Op.lt]: endDate
        }
      },
      order: [['pushedAt', 'ASC']]
    });

    if (pushEvents.length === 0) {
      // Mark as inactive day if no pushes
      await PushActivityMetrics.upsert({
        repoId: repoId,
        date: startDate.toISOString().split('T')[0],
        totalPushes: 0,
        totalCommits: 0,
        uniqueContributors: 0,
        hourlyDistribution: Array(24).fill(0),
        activeBranches: [],
        contributorActivity: [],
        isActive: false
      });
      return;
    }

    // Calculate metrics
    const totalPushes = pushEvents.length;
    const totalCommits = pushEvents.reduce((sum, event) => sum + event.commitCount, 0);
    
    // Unique contributors
    const uniqueUserIds = new Set(
      pushEvents.filter(e => e.userId).map(e => e.userId)
    );
    const uniqueContributors = uniqueUserIds.size;

    // Hourly distribution
    const hourlyDistribution = Array(24).fill(0);
    pushEvents.forEach(event => {
      const hour = new Date(event.pushedAt).getHours();
      hourlyDistribution[hour]++;
    });

    // Active branches
    const branches = new Set(pushEvents.map(e => e.branch));
    const activeBranches = Array.from(branches);

    // Contributor activity
    const contributorMap = new Map();
    pushEvents.forEach(event => {
      if (!event.userId) return;
      
      if (!contributorMap.has(event.userId)) {
        contributorMap.set(event.userId, {
          userId: event.userId,
          pushCount: 0,
          commitCount: 0
        });
      }
      
      const contributor = contributorMap.get(event.userId);
      contributor.pushCount++;
      contributor.commitCount += event.commitCount;
    });

    const contributorActivity = Array.from(contributorMap.values())
      .sort((a, b) => b.commitCount - a.commitCount); // Sort by most active

    // Upsert metrics for this day
    await PushActivityMetrics.upsert({
      repoId: repoId,
      date: startDate.toISOString().split('T')[0],
      totalPushes,
      totalCommits,
      uniqueContributors,
      hourlyDistribution,
      activeBranches,
      contributorActivity,
      isActive: true
    });

    console.log(`Aggregated ${totalPushes} pushes, ${totalCommits} commits for repo ${repoId}`);
  } catch (error) {
    console.error(`Error aggregating repo ${repoId}:`, error.message);
  }
}

/**
 * Backfill historical data for last 30 days
 */
export async function backfillPushActivity(days = 30) {
  console.log(`Backfilling push activity for last ${days} days...`);
  
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
        await aggregateRepoActivity(project.repoId, date, nextDate);
      }
    }

    console.log(`Backfill completed for ${projects.length} repositories`);
  } catch (error) {
    console.error('Error in backfill:', error);
  }
}

/**
 * Clean up old metrics
 */
export async function cleanupOldMetrics() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const deleted = await PushActivityMetrics.destroy({
      where: {
        date: {
          [Op.lt]: cutoffDate.toISOString().split('T')[0]
        }
      }
    });

    if (deleted > 0) {
      console.log(`Cleaned up ${deleted} old metric records`);
    }
  } catch (error) {
    console.error('Error cleaning up old metrics:', error);
  }
}

//cron jobs

export const pushActivityCron = cron.schedule('0 * * * *', async () => {
  console.log('Running hourly push activity aggregation');
  await aggregatePushActivity();
}, {
  scheduled: false,
  timezone: "UTC"
});
