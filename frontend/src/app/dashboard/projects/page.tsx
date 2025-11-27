"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTeamStore } from "@/store/teamStore";
import { useGitHubStore } from "@/store/githubStore";
import {
  FiPlus,
  FiGithub,
  FiExternalLink,
  FiMoreHorizontal,
  FiLock,
  FiUnlock,
  FiActivity,
} from "react-icons/fi";
import "../dashboard.css";

export default function ProjectsPage() {
  const router = useRouter();

  const myInvites = useTeamStore((s) => s.myInvites);
  const fetchMyInvites = useTeamStore((s) => s.fetchMyInvites);
  const myInvitesLoaded = useTeamStore((s) => s.myInvitesLoaded);

  const repositories = useGitHubStore((s) => s.repositories);
  const fetchGitHubRepos = useGitHubStore((s) => s.fetchGitHubRepos);
  const githubLoading = useGitHubStore((s) => s.isLoading);
  const selectRepository = useGitHubStore((s) => s.selectRepository);

  const [searchTerm, setSearchTerm] = useState("");
  const dataFetchRef = useRef(false);

  useEffect(() => {
    if (dataFetchRef.current) return;
    dataFetchRef.current = true;

    const fetchData = async () => {
      try {
        const promises = [];

        if (!myInvitesLoaded) {
          promises.push(fetchMyInvites());
        }

        // Fetch GitHub repositories
        promises.push(fetchGitHubRepos());

        await Promise.all(promises);
      } catch (error) {
        console.error("❌ Error fetching projects data:", error);
      }
    };

    fetchData();
  }, [fetchMyInvites, fetchGitHubRepos, myInvitesLoaded]);

  const filteredRepositories = repositories.filter(
    (repo) =>
      repo.repoName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProjectClick = (repo: any) => {
    selectRepository(repo);
    console.log("Navigating to project:", repo.fullName);
    router.push("/gitProject");
  };

  const getProjectIcon = (repoName: string) => {
    const firstLetter = repoName.charAt(0).toUpperCase();
    return firstLetter;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return "1d ago";
    if (diffInDays < 30) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="dashboard-container">
      {/* Left Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-section-title">Usage</div>
        <div className="sidebar-section">
          <div className="sidebar-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="usage-period">Last 30 days</span>
            </div>
          </div>
        </div>

        <div className="sidebar-section-title">Alerts</div>
        <div className="sidebar-section">
          <div>
            <h3>Get alerted for anomalies</h3>
          </div>
        </div>

        <div className="sidebar-section-title">Recent Previews</div>
        <div className="sidebar-section">
          <div>
            Preview deployments that you have recently visited or created will
            appear here.
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main !gap-4">
        {/* Projects Header */}
        <div className="projects-header">
          <h2 className="!text-[15px]">Projects</h2>
        </div>

        {/* Projects Grid/List */}
        {githubLoading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p className="loading-text">Loading projects...</p>
          </div>
        ) : filteredRepositories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiGithub size={32} />
            </div>
            <h3>No Projects Found</h3>
            <p>
              {searchTerm
                ? "No projects match your search. Try a different query."
                : "Connect your GitHub account to import and analyze your repositories."}
            </p>
            {!searchTerm && (
              <button
                className="empty-state-btn"
                onClick={() =>
                  router.push(
                    process.env.NEXT_PUBLIC_WEB_APP_REDIRECT_URI ||
                      "/gitProject"
                  )
                }
              >
                <FiPlus size={16} />
                Import Project
              </button>
            )}
          </div>
        ) : (
          <div className="projects-grid">
            {filteredRepositories.map((repo, index) => (
              <div
                key={repo.id}
                className="project-card"
                onClick={() => handleProjectClick(repo)}
              >
                <div className="project-card-header mb-2">
                  <div className="flex items-center gap-4">
                    <div className="project-icon" data-index={index % 10}>
                      {getProjectIcon(repo.repoName)}
                    </div>

                    <div className="project-info">
                      <div className="project-name">{repo.repoName}</div>
                      <div className="flex items-center gap-2">
                        <a
                          href={repo.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-url"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiExternalLink size={10} />
                        </a>
                        <span className="visibility-badge">
                          {repo.visibility === "private" ? (
                            <>
                              <FiLock size={10} /> Private
                            </>
                          ) : (
                            <>
                              <FiUnlock size={10} /> Public
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <FiActivity
                      size={32}
                      style={{
                        backgroundColor: "var(--color-bg-tertiary)",
                        color: "var(--color-fg)",
                        borderColor: "var(--color-border)",
                      }}
                      className="border-4 rounded-full p-1"
                    />
                    <FiMoreHorizontal
                      size={20}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                <div className="project-meta">
                  <span>
                    {repo.installationId ? (
                      <div
                        className="flex gap-1 rounded-full w-fit px-1 py-0.5"
                        style={{
                          backgroundColor: "var(--color-bg-secondary)",
                        }}
                      >
                        <FiGithub
                          size={18}
                          className="github-icon rounded-full p-[3px]"
                          style={{
                            backgroundColor: "var(--color-bg)",
                            color: "var(--color-fg)",
                          }}
                        />
                        <span>{repo.fullName}</span>
                      </div>
                    ) : (
                      "Imported Repository"
                    )}
                  </span>
                </div>

                <div className="project-status">
                  <div className="status-indicator">
                    <div className="status-dot" />
                    <span className="status-text">Ready</span>
                  </div>
                  <div className="activity-info">
                    <FiActivity size={12} />
                    {formatDate(repo.updatedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
