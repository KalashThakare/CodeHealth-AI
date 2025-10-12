import Commit from "../database/models/commitsMetadata.js";
import { Project } from "../database/models/project.js";
import dotenv from "dotenv";
import { analyzeCommitPatterns, calculateDistributions, calculateRepoHealthScore, calculateRepoMetrics } from "../services/analysis.Service.js";
dotenv.config();

export const analyze_repo = async(req,res)=>{
    try {
        const {repoId} = req.params;

        if(!repoId) return res.status(404).json({message:"repoId is missing"});

        const repo = await Project.findOne({
            where:{
                repoId:repoId,
            }
        });

        if(!repo) return res.status(400).json({message:`No repo found with repoId: ${repoId}`});

        const result = await calculateRepoMetrics(repoId);
        const commitAnalysis = await analyzeCommitPatterns(repoId);
        const repoHealthScore = await calculateRepoHealthScore(repoId);
        const distributions = await calculateDistributions(repoId);

        return res.status(200).json({message:"Success", result, commitAnalysis, repoHealthScore, distributions })

    } catch (error) {
        
    }
}