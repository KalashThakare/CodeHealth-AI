import { Project } from "../database/models/project.js";
import { fullRepoAnalyse } from "../services/handlers/analyse.handler.js";
import { connection, filesQueue } from "../lib/redis.js";
import PushAnalysisMetrics from "../database/models/pushAnalysisMetrics.js";
import RepoFileMetrics from "../database/models/repoFileMetrics.js";
import CommitsAnalysis from "../database/models/commit_analysis.js";
import Commit from "../database/models/commitsMetadata.js";
import RepoMetadata from "../database/models/repoMedata.js";
import { triggerBackgroundAnalysis } from "./analysisController.js";
import PullRequestAnalysis from "../database/models/pr_analysis_metrics.js";
import activity from "../database/models/activity.js";
import { startAnalysisPolling, stopAnalysisPolling } from "../services/pooling.Service.js";
import { io } from "../server.js";

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

    await repo.update({
      initialised: true,
      analysisStatus: 'processing',
      analysisStartedAt: new Date()
    });

    const fullName = repo.fullName;
    const [owner, repoName] = fullName.split("/");

    if (!owner || !repoName) {
      return res
        .status(400)
        .json({ error: "Invalid repository full name format" });
    }

    await activity.create({
      userId: userId,
      activity: `${owner} initialised a repo ${repoName}`
    })

    const payload = {
      repoId: repo.repoId,
      installationId: repo.installationId,
      owner: owner,
      repoName: repoName,
      defaultBranch: repo.defaultBranch || "main",
      requestedBy: null,
    };

    setImmediate(() => {
      fullRepoAnalyse(payload)
        .then(res => console.log("Analysis started:", res.jobId))
        .catch(console.error);
    });


    return res.status(200).json({
      message: "Initialization successful. Analysis in progress.",
      data: {
        status: "processing",
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

export const initialiseAnalysis = async (req, res) => {
  const { repoId, totalFiles } = req.body;

  if (!repoId || !totalFiles) {
    return res.status(400).json({ message: "repoId and totalFiles are required" });
  }

  console.log(`[initializeAnalysis] Received request for repo ${repoId} with ${totalFiles} files`);

  try {
    const redisKey = `analysisPooler:${repoId}:totalFiles`;
    await connection.set(redisKey, totalFiles);

    startAnalysisPolling(repoId, totalFiles);

    return res.status(200).json({
      success: true,
      message: `Analysis initialized for ${totalFiles} files`,
      repoId,
      totalFiles
    });
  } catch (error) {
    const { repoId } = req.body;
    console.error(`[initializeAnalysis] Error: ${error.message}`);
    stopAnalysisPolling(repoId);
    return res.status(500).json({
      success: false,
      message: "Failed to initialize analysis",
      error: error.message
    });
  }
}

export const enqueueBatch = async (req, res) => {
  const { files, repoId, branch, isPushEvent = false } = req.body;

  console.log('[enqueueBatch] Received request:', {
    filesCount: files?.length,
    repoId,
    branch,
    isPushEvent,
    firstFile: files?.[0] // Log first file structure
  });

  if (!Array.isArray(files)) {
    return res.status(400).json({ message: "Invalid response" });
  }

  const project = await Project.findOne({
    where: {
      repoId: repoId
    }
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const jobs = files.map((file) => ({
    name: file.path,
    data: {
      ...file,
      repoId: repoId,
      branch: branch,
      project: {
        userId: project.userId,
        id: project.id
      }
    },
  }));

  if (isPushEvent) {
    console.log(`[enqueueBatch] Push event: Adding ${jobs.length} JS/TS files for repo ${repoId}`);
  } else {
    console.log(`[enqueueBatch] Initial analysis: Adding ${jobs.length} JS/TS files for repo ${repoId}`);
  }

  console.log('[enqueueBatch] Adding jobs to queue:', jobs.length);

  const resp = await filesQueue.addBulk(jobs);

  console.log('[enqueueBatch] Jobs added successfully:', resp.length);
  console.log('[enqueueBatch] Job IDs:', resp.map(j => j.id));

  if (resp && io) {  // Check if io exists
    io.to(`user:${project.userId}`).emit('analysis_update', {
      repoId,
      phase: "JOB_DISPATCH",
      level: "INFO",
      message: "Analysis job dispatched to worker queue",
      meta: {
        jobType: "AST_ANALYSIS",
        filesCount: jobs.length
      },
      timestamp: new Date().toISOString()
    });
  }

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

    console.log(`[collectePythonMetrics] Processing ${Metrics.length} Python files for repo ${repoId}`);

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

    // Trigger analysis after saving metrics
    console.log(`[collectePythonMetrics] Triggering background analysis for repo ${repoId}`);

    try {
      await triggerBackgroundAnalysis(repoId, repo.userId);

      return res.status(200).json({
        success: true,
        message: `Successfully saved ${savedRecords.length} file metrics and completed analysis`,
        count: savedRecords.length,
        analysisTriggered: true,
      });
    } catch (error) {
      console.error('[collectePythonMetrics] Background analysis failed:', error);
      stopAnalysisPolling(repoId);
      return res.status(500).json({
        message: "Failed to complete repository analysis",
        filesProcessed: savedRecords.length,
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error collecting Python metrics:", error);
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
