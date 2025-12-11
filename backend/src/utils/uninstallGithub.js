import dotenv from "dotenv";
import { createAppAuth } from "@octokit/auth-app";

dotenv.config();

export async function uninstallGitHubApp(installationId) {
  try {
    const auth = createAppAuth({
      appId: process.env.APP_ID,
      privateKey: process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });

    // Get app authentication
    const appAuthentication = await auth({ type: "app" });

    const response = await fetch(
      `https://api.github.com/app/installations/${installationId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${appAuthentication.token}`,
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
