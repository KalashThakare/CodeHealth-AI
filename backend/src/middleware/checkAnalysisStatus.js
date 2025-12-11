import { Project } from "../database/models/project.js";

export const checkAnalysisStatus = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    
    const repo = await Project.findOne({ where: { repoId } });
    
    if (!repo) {
      return res.status(404).json({ error: "Repository not found" });
    }
    
    if (repo.analysisStatus === 'processing') {
      return res.status(409).json({
        error: "Analysis is currently in progress",
        status: 'processing',
        message: "Please wait analysis is currently in progress"
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ error: "Failed to check analysis status" });
  }
};


export const checkProcessingStatus = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorised" });
    }

    const processingRepo = await Project.findOne({
      where: {
        userId: userId,
        analysisStatus: 'processing'
      },
      attributes: ['repoId', 'fullName', 'repoName', 'analysisStartedAt']
    });

    if (processingRepo) {
    
      return res.status(409).json({
        error: "Another repository analysis is currently in progress",
        processing: true,
        repository: {
          fullName: processingRepo.fullName,
          repoName: processingRepo.repoName,
          analysisStartedAt: processingRepo.analysisStartedAt,
        },
        message: `Please wait for the analysis of '${processingRepo.fullName}' to complete before initializing another repository.`,
        estimatedTimeRemaining: "2-5 minutes"
      });
    }

    next();
  } catch (error) {
    console.error("Error checking processing status:", error);
    return res.status(500).json({
      error: "Failed to check processing status",
      details: error.message
    });
  }
};