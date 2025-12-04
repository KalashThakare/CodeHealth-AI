import BlacklistToken from "../database/models/blacklistToken.js";
import jwt from "jsonwebtoken";
import User from "../database/models/User.js";

export const protectRoute = async (req, res, next) => {

    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZjllYmYxOS1iZTA5LTQ4MTMtYjNkOC02OGJjMWJkMGJjMjQiLCJlbWFpbCI6ImthbGFzaHRoYWthcmU4OThAZ21haWwuY29tIiwibmFtZSI6IkthbGFzaCBUaGFrYXJlIiwiaWF0IjoxNzY0Nzg2MjM4LCJleHAiOjE3NjQ4NzI2Mzh9.H9QArOJYH9y4wMx4fFUvyfs3unsS7CAQXbGY5Wf_kkE";

    if (!token) {
        return res.status(400).json({ message: "Unauthorised" });
    }

    const isBlacklisted = await BlacklistToken.findOne({ where: { token: token } });

    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.userId) {
            return res.status(401).json({ message: "Unauthorized: Invalid token payload" });
        }
        const user = await User.findOne({ where: { id: decoded.userId } });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        req.user = user;

        next();

    } catch (error) {

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Unauthorized: Token expired" });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        console.error("Authentication error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }

}
