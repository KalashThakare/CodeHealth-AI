import { Project } from "../database/models/project.js";
import Team from "../database/models/team.js";

export const getUsage = async(req,res)=>{
    try {
        const userId = req.user?.id;
        if(!userId){
            return res.status(400).json({message:"Unauthorised"});
        }

        const repoCount = await Project.count({
            where:{
                userId:userId,
                initialised:true
            }
        })

        // const teamCount = await Team.count({
        //     where:{
        //         userId:{
        //             userId
        //         }
        //     }
        // })

        res.status(200).json({
            message:"Success",
            repoCount,
            // teamCount
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Internal server error"},error);
    }
}

export const getRecentPreview = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: "Unauthorised" });
    }

    const recentRepo = await Project.findOne({
      where: {
        userId: userId,
        initialised: true,
        analysisStatus: 'completed' 
      },
      attributes: ['repoId', 'fullName', 'repoName', 'analysisCompletedAt'],
      order: [['analysisCompletedAt', 'DESC']] 
    });

    if (!recentRepo) {
      return res.status(200).json({
        message: "No initialized repositories found",
        metrics: null
      });
    }

    return res.status(200).json({
      success: true,
      userId: userId,
      fullName:recentRepo.fullName,
      repoName:recentRepo.repoName,
      analysisCompletedAt:recentRepo.analysisCompletedAt
    });

  } catch (error) {
    console.error("Error fetching recent metrics preview:", error);
    return res.status(500).json({
      error: "Failed to fetch recent metrics",
      details: error.message
    });
  }
};