import { Project } from "../database/models/project.js"
import { handleAnalyse } from "../services/handlers/analyse.handler.js";
import { filesQueue } from "../lib/redis.js";
Project.sync();

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