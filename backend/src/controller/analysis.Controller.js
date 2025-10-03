import { Project } from "../database/models/project.js"
import { handleAnalyse } from "../services/handlers/analyse.handler.js";
import { filesQueue } from "../lib/redis.js";
import PushAnalysisMetrics from "../database/models/pushAnalysisMetrics.js";

await Project.sync();
await PushAnalysisMetrics.sync();

export const Analyse_repo = async(req,res)=>{
    try {
        const repoId = req.body.repoId;
        if(!repoId){
            return res.status(404).json({message:"repo for analysis not selected"});
        }
        const repo = await Project.findOne({where:{repoId:repoId}})

        if(!repo){
            return res.status(404).json({message:"Repo selected for analysis not found"});
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
        return res.status(500).json({message:"Internal server error"});
    }
}

export const enqueueBatch = async(req,res)=>{
    const {files, repoId} = req.body;
    if(!Array.isArray(files)){
        return res.status(400).json({message:"Invalid response"});
    }

    const jobs = files.map(file=>({
        name:file.path,
        data: {
            ...file,        
            repoId: repoId  
        }

    }));

    await filesQueue.addBulk(jobs);

    res.send({added:jobs.length});
}

export const collectPushMetrics = async (req, res) => {
  try {
    const { message, impact, prio, repoId } = req.body;

    // Validate required fields
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

    // Verify project exists
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

    // Parse the message to extract repository and branch
    // Format: "Analyzed {repo} on {branch}. Impact={score}, threshold={threshold}."
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

    // Create the push analysis metrics record
    const metric = await PushAnalysisMetrics.create({
      repository: repository,
      repoId: repoId,
      branch: branch,
      commitSha: null, // Add if available in future
      impact: impactValue,
      threshold: thresholdValue,
      score: impact.score,
      ok: impactValue < thresholdValue,
      message: message,
      files: [], // Add if files data is sent from Python
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