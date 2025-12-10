import cron from 'node-cron';
import { Op } from 'sequelize';
import AlertTrigger from '../database/models/observability/alertTrigger.js';

async function deleteResolvedAlerts(daysOld = 7) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const deletedCount = await AlertTrigger.destroy({
      where: {
        status: 'resolved',
        resolvedAt: {
          [Op.lte]: cutoffDate
        }
      }
    });

    console.log(`[${new Date().toISOString()}] Deleted ${deletedCount} resolved alerts older than ${daysOld} days`);
    return deletedCount;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error deleting resolved alerts:`, error);
    throw error;
  }
}

export const alertCleanupCron = cron.schedule("0 2 * * *", async () => {
  console.log(`[${new Date().toISOString()}] Starting alert cleanup job...`);
  try {
    await deleteResolvedAlerts(7); 
  } catch (error) {
    console.error('Alert cleanup job failed:', error);
  }
}, {
  scheduled: false,
  timezone: "UTC"
});
