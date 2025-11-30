import activity from "../database/models/activity.js";
import notification from "../database/models/notification.js";

export const getActivity = async(req, res)=>{
    try {
        const userId = req.user?.id;
        if(!userId){
            return res.status(400).json({message:"Unauthorised"});
        }

        const data = await activity.findAll({
            where:{
                userId:userId
            },
            order: [['createdAt', 'DESC']],
        });

        return res.status(200).json({message:"Success", data});

    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal server error", success:false, error});
    }
}