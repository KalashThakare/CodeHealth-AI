import User from "../database/models/User.js";
import { generateState, generateCodeVerifier } from "arctic";
import { google } from "../lib/OAuth/google.js";
import { decodeIdToken } from "arctic";
import { github } from "../lib/OAuth/github.js";
import jwt from "jsonwebtoken";
import BlacklistToken from "../database/models/blacklistToken.js";
import dotenv from "dotenv";
dotenv.config();

const frontendBaseURL = process.env.FRONTEND_URL;

await User.sync();
await BlacklistToken.sync();

export const googleLogin = async (req, res) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const scopes = ["openid", "email", "profile"];

  res.cookie("google_oauth_state", state, {
    httpOnly: true,
    maxAge: 600000,
    sameSite: "lax",
  });
  res.cookie("google_code_verifier", codeVerifier, {
    httpOnly: true,
    maxAge: 600000,
    sameSite: "lax",
  });

  const authURL = google.createAuthorizationURL(
    state,
    codeVerifier,
    ["openid", "email", "profile"],
    { accessType: "offline", prompt: "consent" }
  );
  res.redirect(authURL);
};

export async function googleAuthCallback(req, res) {
  try {
    const { code, state } = req.query;

    const storedState = req.cookies.google_oauth_state;
    const codeVerifier = req.cookies.google_code_verifier;
    res.clearCookie("google_oauth_state");
    res.clearCookie("google_code_verifier");

    if (!code || !state || !storedState || !codeVerifier) {
      return res.status(400).send("Missing parameters.");
    }
    if (state !== storedState) {
      return res.status(400).send("Invalid state.");
    }

    // Exchange the auth code for tokens
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);

    // Decode the ID token to get user info
    const claims = decodeIdToken(tokens.idToken());
    const googleId = claims.sub;
    const email = claims.email;
    const name = claims.name;

    // Upsert user into your DB
    let user = await User.findOne({
      where: { oauthProvider: "google", oauthProviderId: googleId },
    });
    if (!user) {
      user = await User.create({
        email,
        name,
        oauthProvider: "google",
        oauthProviderId: googleId,
        oauthAccessToken: tokens.accessToken(),
      });
    } else {
      await user.update({
        oauthAccessToken: tokens.accessToken(),
      });
    }

    const jwtPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      provider: user.oauthProvider,
    };

    const jwtSecret = process.env.JWT_SECRET;
    const authToken = jwt.sign(jwtPayload, jwtSecret, { expiresIn: "24h" });

    res.cookie("token", authToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    // res.redirect(`${frontendBaseURL}/dashboard?token=${authToken}`);
  } catch (e) {
    console.error(e);
    res.status(500).send("Google authentication failed.");
  }
}

export const githubLogin = async (req, res) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const scopes = ["read:user", "user:email"];

  res.cookie("github_oauth_state", state, {
    httpOnly: true,
    maxAge: 600000,
    sameSite: "lax",
  });
  res.cookie("github_code_verifier", codeVerifier, {
    httpOnly: true,
    maxAge: 600000,
    sameSite: "lax",
  });

  const authURL = github.createAuthorizationURL(state, scopes);
  res.redirect(authURL);
};

export const githubAuthCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const storedState = req.cookies.github_oauth_state;
    const codeVerifier = req.cookies.github_code_verifier;

    // Clean up cookies
    res.clearCookie("github_oauth_state");
    res.clearCookie("github_code_verifier");

    // Validate presence
    if (!code || !state || !storedState || !codeVerifier) {
      return res.status(400).send("Missing parameters.");
    }
    if (state !== storedState) {
      return res.status(400).send("Invalid state.");
    }

    // Exchange the authorization code for tokens using PKCE
    const tokens = await github.validateAuthorizationCode(code, codeVerifier);

    // Fetch GitHub profile
    const profileRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    });
    const profile = await profileRes.json();

    // Fetch user email (if not public in profile)
    let email = profile.email;
    if (!email) {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      });
      const emails = await emailRes.json();
      if (Array.isArray(emails)) {
        const primary = emails.find((e) => e.primary && e.verified);
        email = primary?.email || emails[0]?.email;
      }
    }

    // Upsert user into your DB by unique GitHub user ID
    let user = await User.findOne({
      where: {
        oauthProvider: "github",
        oauthProviderId: profile.id?.toString(),
      },
    });
    if (!user) {
      user = await User.create({
        email,
        name: profile.name || profile.login,
        oauthProvider: "github",
        oauthProviderId: profile.id?.toString(),
        oauthAccessToken: tokens.accessToken(),
      });
    } else {
      await user.update({
        oauthAccessToken: tokens.accessToken(),
      });
    }

    const jwtPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      provider: user.oauthProvider,
    };
    const jwtSecret = process.env.JWT_SECRET;
    const token = jwt.sign(jwtPayload, jwtSecret, { expiresIn: "24h" });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    res.redirect(`${frontendBaseURL}/dashboard?token=${authToken}`);
  } catch (e) {
    console.error("GitHub OAuth callback error:", e);
    res.status(500).send("GitHub authentication failed.");
  }
};

export const logout = async (req, res) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(400).json({ message: "Unauthorised" });
    }

    await BlacklistToken.create({ token });

    res.clearCookie("token");

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Logout controller error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
