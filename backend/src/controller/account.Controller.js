import User from "../database/models/User.js";

export const deleteAccount = async(req,res)=>{
    try {
        const userId = req.user?.id;
        if(! userId) return res.status(400).json({message:"Unacuthorised"});

        const user = await User.findOne({
            where:{
                id:userId,
            }
        });

        if(!user) return res.status(400).json({message:"No user found"});

        await user.destroy();

        res.status(200).json({message:"Account deleted successfully"});

    } catch (error) {
        
    }
}