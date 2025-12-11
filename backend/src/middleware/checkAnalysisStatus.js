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