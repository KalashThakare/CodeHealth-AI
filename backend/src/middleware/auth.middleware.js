import BlacklistToken from "../database/models/blacklistToken.js";
import jwt from "jsonwebtoken";
import User from "../database/models/User.js";

export const protectRoute = async (req, res, next) => {
  console.log("========== AUTH DEBUG ==========");

  const authHeader = req.headers.authorization;
  const token =
    req.cookies?.token ||
    (authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null);

  console.log("Token present:", Boolean(token));

  if (!token) {
    console.log("No token found");
    console.log("========== AUTH DEBUG END ==========");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const isBlacklisted = await BlacklistToken.findOne({ where: { token } });

  if (isBlacklisted) {
    console.log("Token is blacklisted");
    console.log("========== AUTH DEBUG END ==========");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("JWT decoded payload:", decoded);

    if (!decoded.userId) {
      console.log("userId missing in token payload");
      console.log("========== AUTH DEBUG END ==========");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ where: { id: decoded.userId } });
    console.log("User found:", Boolean(user));

    if (!user) {
      console.log("No user found for ID:", decoded.userId);
      console.log("========== AUTH DEBUG END ==========");
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    req.token = token;

    console.log("Auth success, proceeding to next()");
    console.log("========== AUTH DEBUG END ==========");

    next();
  } catch (error) {
    console.log("JWT Error:", error.name, error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }

    return res.status(500).json({ message: "Internal Server Error" });
  }
};