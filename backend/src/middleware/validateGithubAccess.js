import OAuthConnection from "../database/models/OauthConnections.js"

export const validateGitHubAppAccess = async (req, res, next) => {
  try {

    const user = req.user;

    const githubConnection = await OAuthConnection.findOne({
      where: {
        userId: user.id,
        provider: 'github'
      }
    });

    if (!githubConnection) {
      return res.status(400).json({
        error: 'GITHUB_NOT_CONNECTED',
        message: 'Please connect your GitHub account before installing the GitHub App',
        action: '/api/auth/github/login', 
        requiresGitHubConnection: true
      });
    }

    if (!githubConnection.accessToken) {
      return res.status(400).json({
        error: 'INVALID_GITHUB_TOKEN',
        message: 'GitHub access token is missing. Please reconnect your GitHub account',
        action: '/api/auth/github/login',
        requiresGitHubConnection: true
      });
    }

    try {
      const githubResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${githubConnection.accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!githubResponse.ok) {
        if (githubResponse.status === 401) {
          return res.status(401).json({
            error: 'GITHUB_TOKEN_EXPIRED',
            message: 'Your GitHub connection has expired. Please reconnect your GitHub account',
            action: '/api/auth/github/login',
            requiresGitHubConnection: true
          });
        }

        throw new Error(`GitHub API error: ${githubResponse.status}`);
      }

      const githubProfile = await githubResponse.json();
      
      if (githubConnection.installationId) {
        const installationValid = await verifyGitHubInstallation(
          githubConnection.installationId,
          githubConnection.accessToken
        );

        if (!installationValid) {

          await githubConnection.update({
            installationId: null
          });
          console.log(`Cleared invalid installation ${githubConnection.installationId} for user ${user.id}`);
        } else {
          req.existingInstallation = {
            installationId: githubConnection.installationId,
            isValid: true
          };
        }
      }

      req.githubConnection = githubConnection;
      req.githubProfile = githubProfile;

      next();

    } catch (fetchError) {
      console.error('GitHub API validation error:', fetchError);
      
      console.warn(`Could not verify GitHub token for user ${user.id}, proceeding anyway`);
      req.githubConnection = githubConnection;
      next();
    }

  } catch (error) {
    console.error('validateGitHubAppAccess middleware error:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to validate GitHub access. Please try again'
    });
  }
};


export const requireGitHubInstallation = async (req, res, next) => {
  try {
    const user = req.user;

    const githubConnection = await OAuthConnection.findOne({
      where: {
        userId: user.id,
        provider: 'github'
      }
    });

    if (!githubConnection) {
      return res.status(400).json({
        error: 'GITHUB_NOT_CONNECTED',
        message: 'GitHub account not connected',
        requiresGitHubConnection: true
      });
    }

    if (!githubConnection.installationId) {
      return res.status(400).json({
        error: 'NO_INSTALLATION',
        message: 'GitHub App is not installed. Please install the app first',
        requiresInstallation: true,
        installUrl: process.env.WEB_APP_REDIRECT_URI
      });
    }

    // Verify installation is still valid
    const isValid = await verifyGitHubInstallation(
      githubConnection.installationId,
      githubConnection.accessToken
    );

    if (!isValid) {
      // Clear invalid installation
      await githubConnection.update({ installationId: null });
      
      return res.status(400).json({
        error: 'INSTALLATION_INVALID',
        message: 'GitHub App installation is no longer valid. Please reinstall',
        requiresInstallation: true,
        installUrl: process.env.WEB_APP_REDIRECT_URI
      });
    }

    req.githubConnection = githubConnection;
    next();

  } catch (error) {
    console.error('requireGitHubInstallation middleware error:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to verify GitHub App installation'
    });
  }
};

async function verifyGitHubInstallation(installationId, accessToken) {
  try {
    // Check if installation exists and is accessible
    const response = await fetch(
      `https://api.github.com/user/installations/${installationId}/repositories`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    return response.ok;

  } catch (error) {
    console.error('Error verifying GitHub installation:', error);
    return false;
  }
}