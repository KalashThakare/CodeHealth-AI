import OAuthConnection from "../database/models/OauthConnections.js";
import User from "../database/models/User.js";
import BlacklistToken from "../database/models/blacklistToken.js";

export const deleteAccount = async(req, res) => {
    try {
        const userId = req.user?.id;
        if(!userId) return res.status(401).json({message: "Unauthorized"});

        const user = await User.findOne({
            where: {
                id: userId,
            }
        });

        if(!user) return res.status(404).json({message: "No user found"});

        const token = req.token;

        if(!token){
            console.log("55555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555")
            return;
        }

        await OAuthConnection.destroy({
            where: {
                userId: userId
            }
        });

        await user.destroy();

        if(token) {
            await BlacklistToken.create({ token });
        }

        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "strict",
            path: "/" 
        });
        
        res.clearCookie("gitHubtoken", {
            httpOnly: true,
            sameSite: "lax",
            path: "/" 
        });

        res.status(200).json({message: "Account deleted successfully"});

    } catch (error) {
        console.error("Delete account error:", error);
        return res.status(500).json({message: "Internal server error"});
    }
}