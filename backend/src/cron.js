import { pushActivityCron, backfillPushActivity } from './jobs/index.js';

//start cron jobs
export function startCronJobs() {
  console.log('Starting cron jobs');

  //push cron
  pushActivityCron.start();
  console.log('Push activity aggregation cron started (hourly)');

  
  console.log('All cron jobs are running');
}



// stop cron
export function stopCronJobs() {
  console.log('Stopping cron jobs...');
  
  pushActivityCron.stop();
  
  console.log('All cron jobs stopped');
}



//backfill
export async function runInitialBackfill() {
  console.log('Running initial backfill...');
  await backfillPushActivity(30); // Last 30 days
  console.log('Backfill completed');
}