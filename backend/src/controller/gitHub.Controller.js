import axios from "axios";
import { generateState, generateCodeVerifier } from "arctic";
import { github } from "../lib/OAuth/github.js";

export const ListRepos = async (req, res) => {
    try {
        const token = req.cookies?.gitHubtoken || req.headers.authorization?.split(" ")[1];

        if (!token) {
            res.status(400).json({ message: "Unauthorised" });
        }

        const response = await axios.get('https://api.github.com/user/repos', {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
            }
        });

        return res.status(200).json(response.data);

    } catch (error) {

        console.error('GitHub API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch repositories' });

    }
}

export const manageGitHubScopes =async(req,res)=>{
    try {

        const state = generateState();
        const codeVerifier = generateCodeVerifier();
        const scopes = ["repo", "read:user", "user:email"];

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
        
    } catch (error) {

        console.error('GitHub API error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Internal server error' });
        
    }
}