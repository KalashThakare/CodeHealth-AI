import support from "../database/models/support.js";

export const createCase = async(req, res)=>{
    try {

        const userId = req.user?.id;
        const {problem} = req.body;

        if(!userId){
            return res.status(400).json({message:"user is unauthorised"});
        }
        if(!problem){
            return res.status(400).json({message:"problem send by user not found"});
        }

        const count = await support.count();
        const caseId = `${String(count + 1).padStart(9, '0')}`;

        const newCase = await support.create({
            caseId:caseId,
            userId:userId,
            status:"open",
            problem:problem
        })

        return res.status(200).json({message:"Success", success:true, caseId: newCase.caseId});
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal server error", success:false, error});
    }
}

export const deleteCase = async(req,res)=>{
    try {
        const{caseId} = req.params;
        const userId = req.user?.id;

        if(!userId){
            return res.status(401).json({message: "User is unauthorised", success: false});
        }
        if(!caseId){
            return res.status(400).json({message:"caseId not found"});
        };

        const userCase = await support.findOne({
            where:{
                caseId:caseId,
                userId:userId
            }
        })

        if(!userCase){
            return res.status(400).json({message:"case not found"});
        }

        await userCase.destroy()

        return res.status(200).json({message:"success", success:true});
        
        
    } catch (error) {
        console.error(error)
        return res.status(500).json({message:"Internal server error", success:false, error})
    }
}

export const getCases = async(req, res)=>{
    try {
        const userId = req.user?.id;
        if(!userId){
            return res.status(400).json({message:"Unauthorised"});
        }

        const cases = await support.findAll({
            where:{
                userId:userId
            }
        });

        return res.status(200).json({message:"Success", success:true, cases});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal server error", error, success:false})
    }
}