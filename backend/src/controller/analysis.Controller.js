import { Project } from "../database/models/project.js"
import { handleAnalyse } from "../services/handlers/analyse.handler.js";
import { filesQueue } from "../lib/redis.js";
import PushAnalysisMetrics from "../database/models/pushAnalysisMetrics.js";
import RepoFileMetrics from "../database/models/repoFileMetrics.js";

await Project.sync();
await PushAnalysisMetrics.sync();

export const Analyse_repo = async (req, res) => {
  try {
    const repoId = req.body.repoId;
    if (!repoId) {
      return res.status(404).json({ message: "repo for analysis not selected" });
    }
    const repo = await Project.findOne({ where: { repoId: repoId } })

    if (!repo) {
      return res.status(404).json({ message: "Repo selected for analysis not found" });
    }

    const fullName = repo.fullName
    const [owner, repoName] = fullName.split("/");

    if (!owner || !repoName) {
      return res.status(400).json({
        message: "Invalid repository full name format",
        error: "INVALID_REPO_FORMAT"
      });
    }

    const payload = {
      repoId: repo.repoId,
      installationId: repo.installationId,
      owner: owner,
      repoName: repoName,
      defaultBranch: repo.defaultBranch || "main",
      requestedBy: req.user?.id || null
    };

    const result = await handleAnalyse(payload);
    console.log(result);
    return res.status(202).json({
      message: "Repository analysis has been queued successfully",
      data: {
        jobId: result.jobId,
        status: 'queued',
        repoId: repo.repoId,
        estimatedWaitTime: result.estimatedWaitTime || '2-5 minutes'
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const enqueueBatch = async (req, res) => {
  const { files, repoId, branch } = req.body;
  if (!Array.isArray(files)) {
    return res.status(400).json({ message: "Invalid response" });
  }

  const jobs = files.map(file => ({
    name: file.path,
    data: {
      ...file,
      repoId: repoId,
      branch:branch
    }

  }));

  await filesQueue.addBulk(jobs);

  res.send({ added: jobs.length });
}

export const collectPushMetrics = async (req, res) => {
  try {
    const { message, impact, prio, repoId } = req.body;

    if (!message || !impact || !prio) {
      return res.status(400).json({
        message: "Required fields are missing (message, impact, prio)"
      });
    }

    if (!repoId) {
      return res.status(400).json({
        message: "repoId is missing"
      });
    }

    const repo = await Project.findOne({
      where: {
        repoId: repoId
      }
    });

    if (!repo) {
      return res.status(404).json({
        message: "No project found associated with this repoId"
      });
    }

    const messageMatch = message.match(/Analyzed (.+?) on (.+?)\. Impact=([\d.]+), threshold=([\d.]+)/);

    let repository = repo.name;
    let branch = 'main';
    let impactValue = impact.score;
    let thresholdValue = 0.50;

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
        candidates: prio.candidates || []
      },
      analyzedAt: new Date()
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
        analyzedAt: metric.analyzedAt
      }
    });

  } catch (error) {
    console.error("Error collecting push metrics:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

export const collectePythonMetrics = async (req, res) => {
  try {
    const { Metrics, repoId, commitSha, branch } = req.body;

    if (!repoId) return res.status(400).json({ message: "repoId is missing" });
    if (!Metrics || !Array.isArray(Metrics)) {
      return res.status(400).json({ message: "Metrics array is missing or invalid" });
    }

    const repo = await Project.findOne({
      where: {
        repoId: repoId,
      },
    });

    if (!repo) return res.status(404).json({ message: "No repository found" });

    console.log(`Processing ${Metrics.length} file metrics for repo ${repoId}`);

    const records = Metrics.map((metric) => {
      const avgComplexity =
        metric.cyclomatic && metric.cyclomatic.length > 0
          ? Math.round(
              metric.cyclomatic.reduce((sum, item) => sum + (item.complexity || 0), 0) /
                metric.cyclomatic.length
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

    console.log(`Successfully saved ${savedRecords.length} file metrics to database`);

    return res.status(200).json({
      success: true,
      message: `Successfully saved ${savedRecords.length} file metrics`,
      count: savedRecords.length,
    });
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

    const { repoId } = req.body;

    if (!repoId) return res.status(400).json({ message: "repoId is missing" });

    const repo = await Project.findOne({
      where: {
        repoId: repoId
      }
    });

    if (!repo) return res.status(400).json({ message: "No repo found" });

    const metric = await RepoFileMetrics.findAll({
      where:{
        repoId:repoId
      }
    })

    if (!metric) return res.status(400).json({ message: "No metrics found for perticular repository" });

    return res.status(200).json({message:"Success",metric});

  } catch (error) {

    console.error(error);
    return res.status(500).json({message:"Internal server error"});

  }

}

export const getPushMetrics = async (req, res) => {

  try {

    const { repoId } = req.body;

    if (!repoId) return res.status(400).json({ message: "repoId is missing" });

    const repo = await Project.findOne({
      where: {
        repoId: repoId
      }
    });

    if (!repo) return res.status(400).json({ message: "No repo found" });

    const metric = await PushAnalysisMetrics.findAll({
      where:{
        repoId:repoId
      }
    })

    if (!metric) return res.status(400).json({ message: "No metrics found for perticular repository" });

    return res.status(200).json({message:"Success",metric});

  } catch (error) {

    console.error(error);
    return res.status(500).json({message:"Internal server error"});

  }

}
