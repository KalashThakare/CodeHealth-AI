import OAuthConnection from "../database/models/OauthConnections.js";
import User from "../database/models/User.js";
import BlacklistToken from "../database/models/blacklistToken.js";
import { uninstallGitHubApp } from "../utils/uninstallGithub.js";

export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const user = await User.findOne({
            where: {
                id: userId,
            }
        });

        if (!user) return res.status(404).json({ message: "No user found" });

        const token = req.token;

        if (!token) {
            return res.status(404).json({message:"No token found"});
        }

        const githubConnection = await OAuthConnection.findOne({
            where: {
                userId: userId,
                provider: 'github'
            }
        });

        if (githubConnection?.installationId) {
            console.log(`Uninstalling GitHub App installation ${githubConnection.installationId} for user ${userId}`);

            try {
                await uninstallGitHubApp(githubConnection.installationId);
                console.log(`Successfully uninstalled GitHub App for user ${userId}`);
            } catch (uninstallError) {
                console.error(`Failed to uninstall GitHub App for user ${userId}:`, uninstallError);

                return res.status(500).json({ 
                  message: "Failed to disconnect GitHub App. Please try again or contact support.",
                  gihubAppUninstallFailure:true 
                });

            }
        }

        await OAuthConnection.destroy({
            where: {
                userId: userId
            }
        });

        await user.destroy();

        if (token) {
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

        res.status(200).json({ message: "Account deleted successfully" });

    } catch (error) {
        console.error("Delete account error:", error);
        return res.status(500).json({ message: "Internal server error", gihubAppUninstallFailure:false });
    }
}

export const updateName = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { name } = req.body;

        if (!name) {
            return res.status(404).json({ message: "fields missing" });
        }

        const [updated] = await User.update(
            { name: name },
            {
                where: { id: userId }
            }
        );

        if (updated === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ success: true, message: "Name updated successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const addAlternateEmail = async (req, res) => {
    try {
        const userId = req.user?.id
        const { alternateEmail } = req.body;
        if (!alternateEmail) {
            return res.status(404).json({ message: "field is missing" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(alternateEmail)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const [updated] = await User.update(
            { alternateEmail: alternateEmail },
            {
                where: {
                    id: userId
                }
            }
        )

        if (updated == 0) {
            return res.status(404).josn({ message: "User not found" })
        }

        return res.status(200).json({
            success: true,
            message: "alternate email added successfully"
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const addPhoneNumber = async (req, res) => {
    try {
        const userId = req.user?.id
        const { number } = req.body;

        const phoneRegex = /^\+?[0-9]{7,15}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ message: "Invalid phone number format" });
        }

        const [updated] = await User.update(
            { contactNo: number },
            {
                where: {
                    id: userId
                }
            }
        );

        if (updated == 0) {
            return res.status(404).josn({ message: "User not found" })
        }

        return res.status(200).json({
            success: true,
            message: "Contact details updated successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}