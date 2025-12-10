import { pushActivityCron, backfillPushActivity, prVelocityCron, backfillPRVelocity, notificationCleanUp, alertCleanupCron } from './jobs/index.js';

//start cron jobs
export function startCronJobs() {
  console.log('Starting cron jobs');

  //push cron
  pushActivityCron.start();
  console.log('Push activity aggregation cron started (hourly)');
  //pr cron
  prVelocityCron.start();
  console.log('PR velocity cron job started (runs every 2 hours)');

  notificationCleanUp.start();
  console.log("Notification cleanup set to start");

  alertCleanupCron.start();

  
  console.log('All cron jobs are running');
}



// stop cron
export function stopCronJobs() {
  console.log('Stopping cron jobs...');
  
  pushActivityCron.stop();
  console.log("push cron job stopped")

  prVelocityCron.stop();
  console.log('PR velocity cron job stopped');

  notificationCleanUp.stop();
  console.log("Notification cleanUp stopped");

  alertCleanupCron.stop();
  
  console.log('All cron jobs stopped');
}



//backfill
export async function runInitialBackfill() {
  console.log('Running initial backfill...');
  await backfillPushActivity(30);
  await backfillPRVelocity(30);
  console.log('Backfill completed');

}