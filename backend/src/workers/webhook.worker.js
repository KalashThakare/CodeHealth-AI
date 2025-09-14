import { Worker } from 'bullmq';
import { handleInstallationLifecycle } from '../services/handlers/installation.handler.js';
import { handlePush } from '../services/handlers/push.hadler.js';
import { handlePullRequest } from '../services/handlers/pull.handler.js';
import { handleIssues } from '../services/handlers/issues.handler.js';
import { connection } from '../lib/redis.js';

export const worker = new Worker('webhooks', async job => {
  const { event, payload } = job.data;

  switch (job.name) {
    case 'installation.lifecycle':
      return handleInstallationLifecycle(payload);
    case 'repo.push':
      return handlePush(payload);
    case 'repo.pull_request':
      return handlePullRequest(payload);
    case 'repo.issues':
      return handleIssues(payload);
    default:
      // Optionally log unhandled
      return;
  }
}, { connection });

worker.on('completed', job => console.log('completed', job.id));
worker.on('failed', (job, err) => console.error('failed', job?.id, err));
