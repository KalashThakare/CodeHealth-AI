import { triggerAlertScan } from "../controller/alertController.js";
import notification from "../database/models/notification.js";
import { Project } from "../database/models/project.js";
import RepoFileMetrics from "../database/models/repoFileMetrics.js";
import { connection } from "../lib/redis.js";
import { io } from "../server.js";

const activePollers = new Map();

export const startAnalysisPolling = (repoId, expectedTotal) => {
  if (activePollers.has(repoId)) {
    clearInterval(activePollers.get(repoId));
  }
  
  console.log(`[Polling] Started for repo ${repoId}, expecting ${expectedTotal} files`);
  
  const pollInterval = setInterval(async () => {
    try {
      await checkAnalysisProgress(repoId, expectedTotal, pollInterval);
    } catch (error) {
      console.error(`[Polling] Error for repo ${repoId}:`, error.message);
    }
  }, 15000);
  
  activePollers.set(repoId, pollInterval);
};

const checkAnalysisProgress = async (repoId, expectedTotal, pollInterval) => {
  try {
    const currentCount = await RepoFileMetrics.count({
      where: { repoId }
    });

    const parsedRepoId = parseInt(repoId);
    
    console.log(`[Polling] Repo ${repoId}: ${currentCount}/${expectedTotal} files analyzed`);
    
    if (currentCount >= expectedTotal) {
      console.log(`[Polling] Analysis complete for repo ${repoId}`);
      
      clearInterval(pollInterval);
      activePollers.delete(repoId);
      
      const repo = await Project.findOne({ where: { repoId } });
      
      if (!repo) {
        console.error(`[Polling] Repo ${repoId} not found in database`);
        return;
      }
      
      await Project.update(
        { 
          analysisStatus: 'completed',
          analysisCompletedAt: new Date()
        },
        { where: { repoId } }
      );

      await notification.create({
            userId: repo.userId,
            title: "Analysis",
            message: `Repository analysis completed successfully for repo: ${repo.fullName}`
        })
      
      const redisKey = `analysisPooler:${repoId}:totalFiles`;
      await connection.del(redisKey);
      
      io.to(`user:${repo.userId}`).emit('notification', {
        type: "analysis",
        success: true,
        repoId,
        repoName: repo.fullName,
        message: `Repository analysis completed successfully for repo: ${repo.fullName}`,
        filesAnalyzed: currentCount,
        timestamp: new Date().toISOString()
      });
      
      console.log(`[Polling] Notification sent to user ${repo.userId} for repo ${repoId}`);

      triggerAlertScan(parsedRepoId, repo.userId).catch((error) => {
      console.log("error trigger alert scan", error)
    });
    }
  } catch (error) {
    console.error(`[checkAnalysisProgress] Error for repo ${repoId}:`, error.message);
    
    clearInterval(pollInterval);
    activePollers.delete(repoId);
    
    await Project.update(
      { 
        analysisStatus: 'failed',
        analysisCompletedAt: new Date()
      },
      { where: { repoId } }
    );
  }
};

export const stopAnalysisPolling = (repoId) => {
  if (activePollers.has(repoId)) {
    clearInterval(activePollers.get(repoId));
    activePollers.delete(repoId);
    console.log(`[Polling] stopped for repo ${repoId}`);
    return true;
  }
  return false;
};

export const getPollingStatus = (repoId) => {
  return activePollers.has(repoId);
};

export const cleanupAllPollers = () => {
  activePollers.forEach((interval, repoId) => {
    clearInterval(interval);
    console.log(`[Cleanup] Stopped polling for repo ${repoId}`);
  });
  activePollers.clear();
};