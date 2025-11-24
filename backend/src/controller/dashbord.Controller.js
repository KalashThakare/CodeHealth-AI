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

        const teamCount = await Team.count({
            where:{
                userId:{
                    userId
                }
            }
        })

        res.status(200).json({
            message:"Success",
            repoCount,
            teamCount
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Internal server error"},error);
    }
}