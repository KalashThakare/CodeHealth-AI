import User from '../../models/user.js';
import { Project } from '../../database/models/project.js';

export async function handleInstallationLifecycle(payload) {
  const action = payload.action;
  const installationId = payload.installation?.id;
  const accountId = payload.installation?.account?.id?.toString();

  if (!installationId || !accountId) return;

  const user = await User.findOne({ where: { oauthProviderId: accountId } });
  if (!user) return;

  if (action === 'created') {
    const repos = payload.repositories || [];
    for (const repo of repos) {
      const repoUrl = repo.html_url || `https://github.com/${repo.full_name}`;
      await Project.findOrCreate({
        where: { repoName: repo.name, userId: user.id },
        defaults: {
          userId: user.id,
          repoId: repo.id,
          repoName: repo.name,
          fullName: repo.full_name,
          repoUrl,
          installationId
        }
      });
    }
    return;
  }

  if (action === 'added') {
    const repos = payload.repositories_added || [];
    for (const repo of repos) {
      const repoUrl = repo.html_url || `https://github.com/${repo.full_name}`;
      await Project.findOrCreate({
        where: { repoName: repo.name, userId: user.id },
        defaults: {
          userId: user.id,
          repoId: repo.id,
          repoName: repo.name,
          fullName: repo.full_name,
          repoUrl,
          installationId
        }
      });
    }
    return;
  }

  if (action === 'removed') {
    const repos = payload.repositories_removed || [];
    for (const repo of repos) {
      await Project.destroy({ where: { repoName: repo.name, userId: user.id } });
    }
    return;
  }
}
