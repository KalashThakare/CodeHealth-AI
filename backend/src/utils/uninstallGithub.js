import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Generate JWT for GitHub App authentication
function generateGitHubAppJWT() {
  const appId = process.env.APP_ID;
  const privateKey = process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n');
  
  const payload = {
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (10 * 60), // 10 minutes
    iss: appId
  };
  
  return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
}

// Uninstall GitHub App installation
export async function uninstallGitHubApp(installationId) {
  try {
    const jwtToken = generateGitHubAppJWT();
    
    const response = await fetch(
      `https://api.github.com/app/installations/${installationId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );
    
    if (response.status === 204 || response.status === 404) {
      return { success: true };
    }
    
    throw new Error(`GitHub API returned status ${response.status}`);
    
  } catch (error) {
    console.error('Error uninstalling GitHub App:', error);
    throw error;
  }
}
