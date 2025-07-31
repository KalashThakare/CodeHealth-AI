import User from "../database/models/User.js";
import { generateState, generateCodeVerifier } from "arctic";
import { google } from "../lib/OAuth/google.js";
import { decodeIdToken } from "arctic";

export const googleLogin = async (req, res) => {

    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const scopes = ["openid", "email", "profile"];

    res.cookie("google_oauth_state", state, { httpOnly: true, maxAge: 600000, sameSite: "lax" });
    res.cookie("google_code_verifier", codeVerifier, { httpOnly: true, maxAge: 600000, sameSite: "lax" });

    const authURL = google.createAuthorizationURL(state, codeVerifier, scopes);
    res.redirect(authURL);

}