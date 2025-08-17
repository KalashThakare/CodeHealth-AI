import Team from "../database/models/team.js"
import User from "../database/models/User.js"

export const createTeam = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { name, description } = req.body;

        if (!userId) {
            res.status(404).json({ message: "Unauthorised" });
        }
        if (!name || !description) {
            res.status(404).json({ message: "Body looks empty" });
        }

        const user = await User.findOne({
            where: {
                id: userId
            }
        });

        if (!user) {
            res.status(400).json({ message: "User not found" });
        }

        const team = await Team.create({
            userId,
            name,
            description
        });

        return res.status(201).json({
            message: "Team created",
            team
        });

    } catch (error) {

        console.error("createTeam error:", error);

        if (error?.name === "SequelizeValidationError") {
            return res.status(400).json({
                message: "Validation error",
                errors: error.errors?.map(e => e.message) || []
            });
        }

        if (error?.name === "SequelizeForeignKeyConstraintError") {
            return res.status(400).json({ message: "Invalid userId" });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
}

export const sendInvite = async(req,res)=>{
    try {
        const {email,role} = req.body;
        
    } catch (error) {
        
    }
}

export const addMember = async(req,res)=>{
    try {
        
    } catch (error) {
        
    }
}