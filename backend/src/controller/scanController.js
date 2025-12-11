import { Project } from "../database/models/project.js";
import { handleAnalyse } from "../services/handlers/analyse.handler.js";
import { connection, filesQueue } from "../lib/redis.js";
import PushAnalysisMetrics from "../database/models/pushAnalysisMetrics.js";
import RepoFileMetrics from "../database/models/repoFileMetrics.js";
import CommitsAnalysis from "../database/models/commit_analysis.js";
import Commit from "../database/models/commitsMetadata.js";
import RepoMetadata from "../database/models/repoMedata.js";
import { triggerBackgroundAnalysis } from "./analysisController.js";
import PullRequestAnalysis from "../database/models/pr_analysis_metrics.js";
import activity from "../database/models/activity.js";

export const Analyse_repo = async (req, res) => {
  try {
    const { repoId } = req.params;
    const userId = req.user?.id;

    if (!repoId) {
      return res.status(400).json({ error: "Repository ID is required" });
    }

    const repo = await Project.findOne({ where: { repoId: repoId } });

    if (!repo) {
      return res.status(404).json({ error: "Repository not found" });
    }

    // Previously initialized
    if (repo.initialised) {
      return res.status(200).json({
        message: "Repository is already initialized",
        repoId: repo.repoId,
        alreadyInitialized: true,
      });
    }

    // max 2 repos limit
    const initializedCount = await Project.count({
      where: { userId, initialised: true },
    });

    if (initializedCount >= 2) {
      return res.status(400).json({
        error:
          "Maximum 2 repositories can be initialized at a time. Please uninitialize another repository first.",
        maxReached: true,
        currentCount: initializedCount,
      });
    }

    await repo.update({ initialised: true });

    const fullName = repo.fullName;
    const [owner, repoName] = fullName.split("/");

    if (!owner || !repoName) {
      return res
        .status(400)
        .json({ error: "Invalid repository full name format" });
    }

    await activity.create({
        userId:userId,
        activity:`${owner} initialised a repo ${repoName}`
    })

    const payload = {
      repoId: repo.repoId,
      installationId: repo.installationId,
      owner: owner,
      repoName: repoName,
      defaultBranch: repo.defaultBranch || "main",
      requestedBy: null,
    };

    const result = await handleAnalyse(payload);
    console.log(result);
    return res.status(200).json({
      message: "Initialization successful. Analysis in progress.",
      data: {
        jobId: result.jobId,
        status: "queued",
        repoId: repo.repoId,
        estimatedWaitTime: "2-5 minutes",
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Failed to queue repository analysis",
      details: error.message,
    });
  }
};

export const initialiseAnalysis = async(req,res)=>{
  const { repoId, totalFiles } = req.body;
  
  if (!repoId || !totalFiles) {
    return res.status(400).json({ message: "repoId and totalFiles are required" });
  }
  
  const repoJobsKey = `analysis:jobs:${repoId}`;
  await connection.set(repoJobsKey, totalFiles, 'EX', 3600);
  
  console.log(`[initializeAnalysis] Initialized counter for repo ${repoId} with ${totalFiles} files`);
  
  return res.status(200).json({
    success: true,
    message: `Analysis initialized for ${totalFiles} files`,
    repoId,
    totalFiles
  });
}

export const enqueueBatch = async (req, res) => {
  const { files, repoId, branch, isPushEvent = false } = req.body;
  if (!Array.isArray(files)) {
    return res.status(400).json({ message: "Invalid response" });
  }

  const jobs = files.map((file) => ({
    name: file.path,
    data: {
      ...file,
      repoId: repoId,
      branch: branch,
    },
  }));

  // DON'T modify counter - it's already initialized
  const repoJobsKey = `analysis:jobs:${repoId}`;

  if (isPushEvent) {
    const currentCount = await connection.get(repoJobsKey);
    const newCount = await connection.incrby(repoJobsKey, jobs.length);
    await connection.expire(repoJobsKey, 3600);
    
    console.log(`[enqueueBatch] Push event: Adding ${jobs.length} JS/TS files for repo ${repoId}, current counter: ${currentCount}, new counter: ${newCount}`);
  } else {
    const currentCount = await connection.get(repoJobsKey);
    console.log(`[enqueueBatch] Initial analysis: Adding ${jobs.length} JS/TS files for repo ${repoId}, counter remains: ${currentCount}`);
  }
  

  await filesQueue.addBulk(jobs);

  res.send({ added: jobs.length });
};

export const collectPushMetrics = async (req, res) => {
  try {
    const { message, impact, prio, repoId } = req.body;

    if (!message || !impact || !prio) {
      return res.status(400).json({
        message: "Required fields are missing (message, impact, prio)",
      });
    }

    if (!repoId) {
      return res.status(400).json({
        message: "repoId is missing",
      });
    }

    const repo = await Project.findOne({
      where: {
        repoId: repoId,
      },
    });

    if (!repo) {
      return res.status(404).json({
        message: "No project found associated with this repoId",
      });
    }

    const messageMatch = message.match(
      /Analyzed (.+?) on (.+?)\. Impact=([\d.]+), threshold=([\d.]+)/
    );

    let repository = repo.name;
    let branch = "main";
    let impactValue = impact.score;
    let thresholdValue = 0.5;

    if (messageMatch) {
      repository = messageMatch[1];
      branch = messageMatch[2];
      impactValue = parseFloat(messageMatch[3]);
      thresholdValue = parseFloat(messageMatch[4]);
    }

    const files = impact.files || [];

    const metric = await PushAnalysisMetrics.create({
      repository: repository,
      repoId: repoId,
      branch: branch,
      commitSha: null,
      impact: impactValue,
      threshold: thresholdValue,
      score: impact.score,
      ok: impactValue < thresholdValue,
      message: message,
      files: files,
      riskAnalysis: {
        impactedFiles: impact.impactedFiles || [],
        candidates: prio.candidates || [],
      },
      analyzedAt: new Date(),
    });

    return res.status(201).json({
      message: "Push analysis metrics collected successfully",
      data: {
        id: metric.id,
        repository: metric.repository,
        branch: metric.branch,
        impact: metric.impact,
        score: metric.score,
        ok: metric.ok,
        filesCount: files.length,
        analyzedAt: metric.analyzedAt,
      },
    });
  } catch (error) {
    console.error("Error collecting push metrics:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const collectePythonMetrics = async (req, res) => {
  try {
    const { Metrics, repoId, commitSha, branch } = req.body;

    if (!repoId) return res.status(400).json({ message: "repoId is missing" });
    if (!Metrics || !Array.isArray(Metrics)) {
      return res
        .status(400)
        .json({ message: "Metrics array is missing or invalid" });
    }

    const repo = await Project.findOne({
      where: {
        repoId: repoId,
      },
    });

    if (!repo) return res.status(404).json({ message: "No repository found" });

    // DON'T increment - counter is already initialized by initializeAnalysis
    const repoJobsKey = `analysis:jobs:${repoId}`;
    const currentCount = await connection.get(repoJobsKey);
    
    console.log(`[collectePythonMetrics] Processing ${Metrics.length} Python files for repo ${repoId}, current counter: ${currentCount}`);

    const records = Metrics.map((metric) => {
      const avgComplexity =
        metric.cyclomatic && metric.cyclomatic.length > 0
          ? Math.round(
              metric.cyclomatic.reduce(
                (sum, item) => sum + (item.complexity || 0),
                0
              ) / metric.cyclomatic.length
            )
          : null;

      return {
        path: metric.path,
        repoId: repoId,
        commitSha: commitSha || null,
        branch: branch || null,

        cyclomaticComplexity: avgComplexity,

        maintainabilityIndex: metric.maintainability?.mi || null,

        locTotal: metric.loc || null,
        locSource: metric.sloc || null,
        locLogical: metric.lloc || null,
        locComments: metric.comments || null,
        locBlank: metric.blank || null,

        halsteadUniqueOperators: metric.halstead?.h1 || null,
        halsteadUniqueOperands: metric.halstead?.h2 || null,
        halsteadTotalOperators: metric.halstead?.N1 || null,
        halsteadTotalOperands: metric.halstead?.N2 || null,
        halsteadVocabulary: metric.halstead?.vocabulary || null,
        halsteadLength: metric.halstead?.length || null,
        halsteadVolume: metric.halstead?.volume || null,

        analyzedAt: new Date(),
      };
    });

    const savedRecords = await RepoFileMetrics.bulkCreate(records, {
      updateOnDuplicate: [
        "cyclomaticComplexity",
        "maintainabilityIndex",
        "locTotal",
        "locSource",
        "locLogical",
        "locComments",
        "locBlank",
        "halsteadUniqueOperators",
        "halsteadUniqueOperands",
        "halsteadTotalOperators",
        "halsteadTotalOperands",
        "halsteadVocabulary",
        "halsteadLength",
        "halsteadVolume",
        "analyzedAt",
      ],
    });

    console.log(
      `Successfully saved ${savedRecords.length} file metrics to database`
    );

    // Decrement counter and check if we should trigger analysis
    const lockKey = `analysis:lock:${repoId}`;
    
    const luaScript = `
      local jobsKey = KEYS[1]
      local lockKey = KEYS[2]
      local decrementBy = tonumber(ARGV[1])
      
      local remaining = redis.call('DECRBY', jobsKey, decrementBy)
      
      if remaining == 0 then
        local lockSet = redis.call('SET', lockKey, 'python', 'NX', 'EX', 300)
        if lockSet then
          return 1  -- This process should trigger analysis
        else
          return 0  -- Lock already exists
        end
      elseif remaining > 0 then
        return 2  -- More jobs remaining
      else
        return -1 -- Counter went negative
      end
    `;
    
    const result = await connection.eval(
      luaScript,
      2,
      repoJobsKey,
      lockKey,
      savedRecords.length.toString()
    );
    
    console.log(`[collectePythonMetrics] Repo ${repoId}: result=${result}, remaining after processing ${savedRecords.length} Python files`);

    if (result === 1) {
      // All files processed, trigger analysis
      console.log(`[collectePythonMetrics] All files processed for repo ${repoId}, triggering background analysis`);
      
      try {
        await triggerBackgroundAnalysis(repoId);
        
        // Cleanup
        await connection.del(repoJobsKey);
        await connection.del(lockKey);
        
        return res.status(200).json({
          success: true,
          message: `Successfully saved ${savedRecords.length} file metrics and completed analysis`,
          count: savedRecords.length,
          analysisTriggered: true,
        });
      } catch (error) {
        console.error('[collectePythonMetrics] Background analysis failed:', error);
        await connection.del(lockKey);
        
        return res.status(500).json({
          message: "Failed to complete repository analysis",
          filesProcessed: savedRecords.length,
          error: error.message,
        });
      }
    } else if (result === 0) {
      console.log(`[collectePythonMetrics] Analysis already triggered by another process for repo ${repoId}`);
    } else if (result === 2) {
      console.log(`[collectePythonMetrics] More files remaining for repo ${repoId}`);
    } else if (result === -1) {
      console.warn(`[collectePythonMetrics] Counter went negative for repo ${repoId} - possible race condition`);
    }

    return res.status(200).json({
      success: true,
      message: `Successfully saved ${savedRecords.length} file metrics`,
      count: savedRecords.length,
      analysisTriggered: false,
    });
  } catch (error) {
    console.error("Error collecting Python metrics:", error);
    
    // Decrement counter on error to avoid blocking analysis
    try {
      const repoJobsKey = `analysis:jobs:${repoId}`;
      if (Metrics && Metrics.length > 0) {
        await connection.decrby(repoJobsKey, Metrics.length);
        console.log(`[collectePythonMetrics] Decremented counter by ${Metrics.length} due to error`);
      }
    } catch (redisError) {
      console.error("Failed to decrement counter on error:", redisError);
    }
    
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getFileMetrics = async (req, res) => {
  try {
    const { repoId } = req.params;

    if (!repoId) return res.status(400).json({ message: "repoId is missing" });

    const repo = await Project.findOne({
      where: {
        repoId: repoId,
      },
    });

    if (!repo) return res.status(400).json({ message: "No repo found" });

    const metric = await RepoFileMetrics.findAll({
      where: {
        repoId: repoId,
      },
    });

    if (!metric)
      return res
        .status(400)
        .json({ message: "No metrics found for perticular repository" });

    return res.status(200).json({ message: "Success", metric });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPushMetrics = async (req, res) => {
  try {
    const { repoId } = req.params;

    if (!repoId) return res.status(400).json({ message: "repoId is missing" });

    const repo = await Project.findOne({
      where: {
        repoId: repoId,
      },
    });

    if (!repo) return res.status(400).json({ message: "No repo found" });

    const metric = await PushAnalysisMetrics.findAll({
      where: {
        repoId: repoId,
      },
    });

    if (!metric)
      return res
        .status(400)
        .json({ message: "No metrics found for perticular repository" });

    return res.status(200).json({ message: "Success", metric });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getCommitAnalysis = async (req, res) => {
  try {
    const { commits_analysis, repoId, branch } = req.body;

    if (!commits_analysis || !repoId || !branch) {
      return res.status(400).json({ message: "fields are empty" });
    }

    const repo = await Project.findOne({
      where: {
        repoId: repoId,
      },
    });

    if (!repo) return res.status(400).json({ message: "No repository found" });

    await CommitsAnalysis.create({
      repoId: repoId,
      branch: branch,
      totalCommits: commits_analysis.totalCommits,
      topContributors: commits_analysis.topContributors,
      commitsPerDay: commits_analysis.commitsPerDay,
    });

    return res.status(201).json({ message: "Success" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getCommitMetadata = async (req, res) => {
  try {
    const { commits, repoId, branch } = req.body;

    if (!commits || !repoId || !branch) {
      return res.status(400).json({ message: "fields are empty" });
    }

    const repo = await Project.findOne({
      where: {
        repoId: repoId,
      },
    });

    if (!repo) return res.status(400).json({ message: "No repository found" });

    const incomingShas = commits.map((commit) => commit.sha);

    const existingCommits = await Commit.findAll({
      where: {
        sha: incomingShas,
      },
      attributes: ["sha"],
    });

    const existingShas = new Set(existingCommits.map((commit) => commit.sha));

    const newCommits = commits.filter(
      (commit) => !existingShas.has(commit.sha)
    );

    if (newCommits.length === 0) {
      return res.status(200).json({
        message: "All commits already exist in database",
        skipped: commits.length,
        added: 0,
      });
    }

    const commitsData = newCommits.map((commit) => ({
      repoId: repoId,
      branch: branch,
      sha: commit.sha,
      message: commit.message,
      authorName: commit.author.name,
      authorEmail: commit.author.email,
      authorDate: new Date(commit.author.date),
      committerName: commit.committer.name,
      committerDate: new Date(commit.committer.date),
    }));

    // Bulk insert only new commits
    const result = await Commit.bulkCreate(commitsData, {
      validate: true,
    });

    return res.status(201).json({ message: "Success", added: result.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getRepoMetadata = async (req, res) => {
  try {
    const { metadata, repoId, branch } = req.body;

    if (!metadata || !repoId || !branch) {
      return res.status(400).json({ message: "fields are empty" });
    }

    const repo = await Project.findOne({
      where: {
        repoId: repoId,
      },
    });

    if (!repo) return res.status(400).json({ message: "No repository found" });

    const existingMeta = await RepoMetadata.findOne({
      where: { repoId },
    });

    if (existingMeta) {
      await existingMeta.update({
        stars: metadata.stars,
        forks: metadata.forks,
        watchers: metadata.watchers,
        license: metadata.license,
        defaultBranch: metadata.default_branch,
        visibility: metadata.visibility,
      });
    } else {
      await RepoMetadata.create({
        repoId,
        branch,
        stars: metadata.stars,
        forks: metadata.forks,
        watchers: metadata.watchers,
        license: metadata.license,
        defaultBranch: metadata.default_branch,
        visibility: metadata.visibility,
      });
    }

    return res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const fetchCommits = async (req, res) => {
  try {
    const { repoId } = req.params;

    if (!repoId) return res.status(404).json({ message: "repoId is missing" });

    const repo = await Project.findOne({
      where: {
        repoId: repoId,
      },
    });

    if (!repo) {
      return res.status(403).json({ message: "Access denied" });
    }

    const commits = await Commit.findAll({
      where: {
        repoId: repoId,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ message: "success", commits });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const fetchCommitAnalysis = async (req, res) => {
  try {
    const { repoId } = req.params;
    if (!repoId) return res.status(404).json({ message: "repoId is missing" });

    const repo = await Project.findOne({
      where: {
        repoId: repoId,
      },
    });

    if (!repo) return res.status(404).json({ message: "repo not found" });

    const analysis = await CommitsAnalysis.findAll({
      where: {
        repoId: repoId,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ message: "Success", analysis });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getContributers = async (req, res) => {
  try {
    const { repoId, contributors } = req.body;
    if (!repoId) return res.status(404).json({ message: "repoId is missing" });
    if (!contributors)
      return res.status(404).json({ message: "contributers are missing" });

    const repo = await Project.findOne({
      where: {
        repoId: repoId,
      },
    });

    if (!repo) return res.status(404).json({ message: "No repository found" });

    console.log(contributors);

    return res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPrAnalysis = async (req, res) => {
  try {
    const { repoId } = req.params;

    if (!repoId) {
      return res.status(404).json({ message: "RepoId not found" });
    }

    const repo = await Project.findOne({
      where: {
        repoId: repoId,
      },
    });

    if (!repo) {
      return res
        .status(400)
        .json({ message: "No project exist with this repoId" });
    }

    const prAnanlysis = await PullRequestAnalysis.findAll({
      where: {
        repoId: repoId,
      },
    });

    if (!prAnanlysis) {
      return res.status(400).json({ message: "prAnanlysis not found" });
    }

    return res.status(200).json({
      success: true,
      message: "pr-Ananlysis returned successfully",
      prAnanlysis,
    });
  } catch (error) {
    console.error("Internal server error", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
