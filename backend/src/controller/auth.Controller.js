import User from "../database/models/User.js";
import { generateState, generateCodeVerifier } from "arctic";
import { google } from "../lib/OAuth/google.js";
import { decodeIdToken } from "arctic";
import { github } from "../lib/OAuth/github.js";

await User.sync();

export const googleLogin = async (req, res) => {

    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const scopes = ["openid", "email", "profile"];

    res.cookie("google_oauth_state", state, { httpOnly: true, maxAge: 600000, sameSite: "lax" });
    res.cookie("google_code_verifier", codeVerifier, { httpOnly: true, maxAge: 600000, sameSite: "lax" });

    const authURL = google.createAuthorizationURL(state, codeVerifier, [
        "openid", "email", "profile"
    ], { accessType: "offline", prompt: "consent" });
    res.redirect(authURL);

}

export async function googleAuthCallback(req, res) {
    try {
        const { code, state } = req.query;
        // Retrieve and delete cookies to prevent replay attacks
        const storedState = req.cookies.google_oauth_state;
        const codeVerifier = req.cookies.google_code_verifier;
        console.log("Received code:", code);
        console.log("Received state:", state);
        console.log("Stored state:", storedState);
        console.log("Stored codeVerifier:", codeVerifier);
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

        console.log(tokens)

        // Decode the ID token to get user info
        const claims = decodeIdToken(tokens.idToken());
        const googleId = claims.sub;
        const email = claims.email;
        const name = claims.name;


        console.log(claims);
        console.log(googleId);
        console.log(email);
        console.log(name);

        // Upsert user into your DB
        let user = await User.findOne({ where: { oauthProvider: "google", oauthProviderId: googleId } });
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

        // Log in or set session/token as desired
        // Example: req.session.userId = user.id; or generate JWT

        res.redirect("/dashboard"); // or wherever in your app

    } catch (e) {
        console.error(e);
        res.status(500).send("Google authentication failed.");
    }
}

export const githubLogin = async (req, res) => {

    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const scopes = ['read:user', 'user:email'];

    res.cookie('github_oauth_state', state, { httpOnly: true, maxAge: 600000, sameSite: 'lax' });
    res.cookie('github_code_verifier', codeVerifier, { httpOnly: true, maxAge: 600000, sameSite: 'lax' });

    const authURL = github.createAuthorizationURL(state, scopes);
    res.redirect(authURL);

}

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
                Authorization: `Bearer ${tokens.accessToken()}`
            }
        });
        const profile = await profileRes.json();

        // Fetch user email (if not public in profile)
        let email = profile.email;
        if (!email) {
            const emailRes = await fetch("https://api.github.com/user/emails", {
                headers: {
                    Authorization: `Bearer ${tokens.accessToken()}`
                }
            });
            const emails = await emailRes.json();
            if (Array.isArray(emails)) {
                const primary = emails.find((e) => e.primary && e.verified);
                email = primary?.email || emails[0]?.email;
            }
        }

        // Upsert user into your DB by unique GitHub user ID
        let user = await User.findOne({ where: { oauthProvider: "github", oauthProviderId: profile.id?.toString() } });
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

        // Session/JWT logic here (if used)
        // e.g., req.session.userId = user.id; or send token

        // Redirect to frontend after successful login
        res.redirect("/dashboard"); // Update as appropriate for your app
    } catch (e) {
        console.error("GitHub OAuth callback error:", e);
        res.status(500).send("GitHub authentication failed.");
    }
};
