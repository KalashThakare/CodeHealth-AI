import User from "../database/models/User.js";
import OAuthConnection from "../database/models/OauthConnections.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import  BlacklistToken  from "../database/models/blacklistToken.js"; 
import { generateState, generateCodeVerifier } from "arctic";
import {google} from "../lib/OAuth/google.js"
import { github } from "../lib/OAuth/github.js";

const frontendBaseURL = process.env.FRONTEND_URL

function decodeIdToken(idToken) {
  
  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid ID token format');
  }

  const payload = Buffer.from(parts[1], 'base64url').toString('utf-8');
  return JSON.parse(payload);
}

// ============= GOOGLE AUTH =============

export const googleLogin = async (req, res) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const scopes = ["openid", "email", "profile"];

  res.cookie("google_oauth_state", state, {
    path: "/",
    httpOnly: true,
    maxAge: 600000,
    sameSite: "none",
    secure: true,
  });
  res.cookie("google_code_verifier", codeVerifier, {
    path: "/",
    httpOnly: true,
    maxAge: 600000,
    sameSite: "none",
    secure: true,
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
      return res.redirect(`${frontendBaseURL}/oauth/callback?error=missing_parameters&provider=google`);
    }
    if (state !== storedState) {
      return res.redirect(`${frontendBaseURL}/oauth/callback?error=invalid_state&provider=google`);
    }

    // Exchange the auth code for tokens
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);

    // Decoding the ID token to get user info
    const claims = decodeIdToken(tokens.idToken());
    const googleId = claims.sub;
    const email = claims.email;
    const name = claims.name;

    const accessToken = tokens.accessToken();
    let refreshToken = null;

    try {
      refreshToken = tokens.refreshToken();
    } catch (error) {
      console.log("No refresh token available");
    }

    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      user = await User.create({
        email,
        name,
        password: null, 
      });
    }

    await OAuthConnection.upsert({
      userId: user.id,
      provider: 'google',
      providerId: googleId,
      accessToken: accessToken,
      refreshToken: refreshToken,
    }, {
      conflictFields: ['userId', 'provider']
    });

    const jwtPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    const jwtSecret = process.env.JWT_SECRET;
    const authToken = jwt.sign(jwtPayload, jwtSecret, { expiresIn: "24h" });

    res.cookie("token", authToken, {
      path: "/",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: true,
    });

    res.redirect(`${frontendBaseURL}/dashboard?token=${authToken}`);
  } catch (e) {
    console.error("Google auth error:", e);
    res.redirect(`${frontendBaseURL}/oauth/callback?error=authentication_failed&provider=google`);
  }
}

// ============= GITHUB AUTH =============

export const githubLogin = async (req, res) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const scopes = ["read:user", "user:email"];

  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  const stateData = { 
    state, 
    token: token || null 
  };
  const encodedState = Buffer.from(JSON.stringify(stateData)).toString('base64');

  res.cookie("github_oauth_state", state, {
    path: "/",
    httpOnly: true,
    maxAge: 600000,
    sameSite: "none",
    secure: true,
  });
  res.cookie("github_code_verifier", codeVerifier, {
    path: "/",
    httpOnly: true,
    maxAge: 600000,
    sameSite: "none",
    secure: true,
  });

  const authURL = github.createAuthorizationURL(encodedState, scopes);
  res.redirect(authURL);
};

export const githubAuthCallback = async (req, res) => {
  try {
    const { code, state: encodedState } = req.query;
    const storedState = req.cookies.github_oauth_state;
    const codeVerifier = req.cookies.github_code_verifier;

    // Cleaning up cookies
    res.clearCookie("github_oauth_state");
    res.clearCookie("github_code_verifier");

    if (!code || !encodedState || !storedState || !codeVerifier) {
      return res.redirect(`${frontendBaseURL}/oauth/callback?error=missing_parameters&provider=github`);
    }

    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(encodedState, 'base64').toString());
    } catch {
      return res.redirect(`${frontendBaseURL}/oauth/callback?error=invalid_state&provider=github`);
    }

    if (stateData.state !== storedState) {
      return res.redirect(`${frontendBaseURL}/oauth/callback?error=invalid_state&provider=github`);
    }

    // Exchange the authorization code for tokens using PKCE
    const tokens = await github.validateAuthorizationCode(code, codeVerifier);
    const githubAccessToken = tokens.accessToken();

    let refreshToken = null;
    try {
      refreshToken = tokens.refreshToken();
    } catch (error) {
      console.log("No refresh token available");
    }

    // Fetching GitHub profile
    const profileRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
      },
    });
    const profile = await profileRes.json();

    // Fetching user email
    let email = profile.email;
    if (!email) {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`,
        },
      });
      const emails = await emailRes.json();
      if (Array.isArray(emails)) {
        const primary = emails.find((e) => e.primary && e.verified);
        email = primary?.email || emails[0]?.email;
      }
    }

    let user;
    let isNewUser = false;

    // if User is already logged in (linking GitHub to existing account)
    if (stateData.token) {
      try {
        const decoded = jwt.verify(stateData.token, process.env.JWT_SECRET);
        user = await User.findByPk(decoded.userId);
   
        if (user) {
    
          const existingConnection = await OAuthConnection.findOne({
            where: {
              provider: 'github',
              providerId: profile.id?.toString(),
            }
          });

          if (existingConnection && existingConnection.userId !== user.id) {
            return res.redirect(`${frontendBaseURL}/oauth/callback?error=github_already_linked&provider=github`);
          }

          await OAuthConnection.upsert({
            userId: user.id,
            provider: 'github',
            providerId: profile.id?.toString(),
            accessToken: githubAccessToken,
            refreshToken: refreshToken,
          }, {
            conflictFields: ['userId', 'provider']
          });

          const jwtPayload = {
            userId: user.id,
            email: user.email,
            name: user.name,
          };
          const jwtSecret = process.env.JWT_SECRET;
          const authToken = jwt.sign(jwtPayload, jwtSecret, { expiresIn: "24h" });

          res.cookie("token", authToken, {
            path: "/",
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "none",
            secure: true,
          });

          res.cookie("gitHubtoken", githubAccessToken, {
            path: "/",
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });

          return res.redirect(`${frontendBaseURL}/oauth/callback?success=true&provider=github&linked=true&token=${authToken}`);
        }
        console.log("Token valid but user not found in database, treating as new login");

      } catch (error) {
        console.error("Token verification failed:", error);
      }
    }
    
    const existingConnection = await OAuthConnection.findOne({
      where: {
        provider: 'github',
        providerId: profile.id?.toString(),
      },
      include: [{ model: User, as: 'user' }]
    });

    if (existingConnection) {

      user = existingConnection.user;

      await existingConnection.update({
        accessToken: githubAccessToken,
        refreshToken: refreshToken,
      });
    } else {
      user = await User.findOne({ where: { email } });

      if (user) {

        await OAuthConnection.create({
          userId: user.id,
          provider: 'github',
          providerId: profile.id?.toString(),
          accessToken: githubAccessToken,
          refreshToken: refreshToken,
        });
      } else {

        user = await User.create({
          email,
          name: profile.name || profile.login,
          password: null,
        });


        await OAuthConnection.create({
          userId: user.id,
          provider: 'github',
          providerId: profile.id?.toString(),
          accessToken: githubAccessToken,
          refreshToken: refreshToken,
        });

        isNewUser = true;
      }
    }


    const jwtPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
    const jwtSecret = process.env.JWT_SECRET;
    const authToken = jwt.sign(jwtPayload, jwtSecret, { expiresIn: "24h" });

    res.cookie("token", authToken, {
      path: "/",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: true,
    });

    // Set GitHub token cookie
    res.cookie('gitHubtoken', githubAccessToken, {
      path: "/",
      httpOnly: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: true,
    });

    const redirectUrl = isNewUser 
      ? `${frontendBaseURL}/dashboard?token=${authToken}&new_user=true`
      : `${frontendBaseURL}/dashboard?token=${authToken}`;

    res.redirect(redirectUrl);

  } catch (e) {
    console.error("GitHub OAuth callback error:", e);
    res.redirect(`${frontendBaseURL}/oauth/callback?error=authentication_failed&provider=github`);
  }
};

// ============= EMAIL/PASSWORD AUTH =============

export const Signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      // Check if they signed up with OAuth
      const oauthConnections = await OAuthConnection.findAll({
        where: { userId: existingUser.id }
      });

      if (oauthConnections.length > 0) {
        const providers = oauthConnections.map(c => c.provider).join(', ');
        return res.status(409).json({ 
          message: `An account with this email already exists. Please login using ${providers}.` 
        });
      }

      return res.status(409).json({ message: "User with this email already exists." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const jwtPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
    const jwtSecret = process.env.JWT_SECRET;
    const authToken = jwt.sign(jwtPayload, jwtSecret, { expiresIn: "24h" });

    res.cookie("token", authToken, {
      path: "/",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    res.status(201).json({ message: "User registered successfully", token: authToken });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error during signup" });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.password) {
 
      const oauthConnections = await OAuthConnection.findAll({
        where: { userId: user.id },
        attributes: ['provider']
      });

      if (oauthConnections.length > 0) {
        const providers = oauthConnections.map(c => c.provider).join(' or ');
        return res.status(400).json({ 
          message: `This account was created using ${providers}. Please login using ${providers}.` 
        });
      }

      return res.status(400).json({ message: "No password set for this account." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const jwtPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
    const jwtSecret = process.env.JWT_SECRET;
    const authToken = jwt.sign(jwtPayload, jwtSecret, { expiresIn: "24h" });

    res.cookie("token", authToken, {
      path: "/",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    res.status(200).json({ message: "Login successful", token: authToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error during login" });
  }
};

// ============= UTILITY ENDPOINTS =============

export const logout = async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "Unauthorised" });
    }

    await BlacklistToken.create({ token });

    res.clearCookie("token");
    res.clearCookie("gitHubtoken"); 

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Logout controller error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    if (!req.user) {
      const cookieNames = req.cookies ? Object.keys(req.cookies) : [];
      console.warn(
        "[auth] protectRoute failed: no user, cookieNames=",
        cookieNames,
        "authHeaderPresent=",
        !!req.headers.authorization,
        "authHeaderLen=",
        req.headers.authorization ? req.headers.authorization.length : 0
      );
      return res.status(400).json({ error: "Authentication required" });
    }
    res.status(200).json(req.user);
  } catch (error) {
    console.log("error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};