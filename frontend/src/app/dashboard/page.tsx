"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useTeamStore } from "@/store/teamStore";
import { useGitHubStore } from "@/store/githubStore";
import { useRouter } from "next/navigation";
import { DashboardNavbar } from "./_components/DashboardNavbar";
import SocketStatus from "@/components/SocketStatus";
import {
  FiPlus,
  FiGithub,
  FiExternalLink,
  FiMoreHorizontal,
  FiLock,
  FiUnlock,
  FiActivity,
} from "react-icons/fi";
import "./dashboard.css";

const Dashboard = () => {
  const router = useRouter();

  const authUser = useAuthStore((s) => s.authUser);
  const isLoggingIn = useAuthStore((s) => s.isloggingin);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  const teams = useTeamStore((s) => s.teams);
  const myInvites = useTeamStore((s) => s.myInvites);
  const fetchTeams = useTeamStore((s) => s.fetchTeams);
  const fetchMyInvites = useTeamStore((s) => s.fetchMyInvites);
  const teamsLoading = useTeamStore((s) => s.loading);
  const teamsLoaded = useTeamStore((s) => s.teamsLoaded);
  const myInvitesLoaded = useTeamStore((s) => s.myInvitesLoaded);

  const repositories = useGitHubStore((s) => s.repositories);
  const fetchGitHubRepos = useGitHubStore((s) => s.fetchGitHubRepos);
  const githubLoading = useGitHubStore((s) => s.isLoading);
  const selectRepository = useGitHubStore((s) => s.selectRepository);

  const [isInitializing, setIsInitializing] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const initRef = useRef(false);
  const dataFetchRef = useRef(false);

  // One-time initialization (guard StrictMode double-call)
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initialize = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get("token");
        if (tokenFromUrl) {
          localStorage.setItem("authToken", tokenFromUrl);
          window.history.replaceState({}, "", window.location.pathname);
        }
        await checkAuth(router as any);
      } catch (e) {
        router.replace("/login");
      } finally {
        setIsInitializing(false);
      }
    };
    initialize();
  }, [checkAuth, router]);

  useEffect(() => {
    if (!authUser || isInitializing) return;
    if (dataFetchRef.current) return; // Prevent multiple calls

    dataFetchRef.current = true;

    const fetchData = async () => {
      try {
        const promises = [];

        if (!teamsLoaded) {
          promises.push(fetchTeams());
        }

        if (!myInvitesLoaded) {
          promises.push(fetchMyInvites());
        }

        // Fetch GitHub repositories
        promises.push(fetchGitHubRepos());

        await Promise.all(promises);
      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, [
    authUser,
    isInitializing,
    fetchTeams,
    fetchMyInvites,
    fetchGitHubRepos,
    teamsLoaded,
    myInvitesLoaded,
  ]);

  // Redirect if not authenticated after init
  useEffect(() => {
    if (!isInitializing && !isLoggingIn && !authUser) {
      router.replace("/login");
    }
  }, [isInitializing, isLoggingIn, authUser, router]);

  if (isInitializing || isLoggingIn) {
    return (
      <div className="min-h-screen glass-bg flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-center">Loading Dashboard...</p>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen glass-bg flex flex-col items-center justify-center">
        <h1 className="font-semibold text-2xl mb-4">Access Denied</h1>
        <p className="mb-6 text-text/70">
          Please log in to access the dashboard.
        </p>
        <button
          onClick={() => router.replace("/login")}
          className="glass-btn glass-btn-primary px-6 py-3 rounded-lg font-medium transition-all"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const pendingReceivedInvites = myInvites.filter((invite) => {
    const now = new Date();
    const expiresAt = new Date(invite.expiresAt);

    const isPending =
      invite.status === "pending" ||
      (!invite.acceptedAt && !invite.revokedAt && now < expiresAt);

    return isPending;
  });

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
    <div className="vercel-dashboard">
      <DashboardNavbar currentTeam={teams[0]} />

      {/* Socket Status Indicator */}
      <SocketStatus showDetails={false} position="bottom-right" />

      <div className="dashboard-container">
        {/* Left Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-section-title">Usage</div>
          <div className="sidebar-section">
            <div className="sidebar-header">
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
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
                        <div className="flex items-center">
                          <a
                            href={repo.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-url"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FiGithub size={12} className="github-icon" />
                            {repo.fullName}
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
                      {repo.installationId
                        ? "GitHub App Connected"
                        : "Imported Repository"}
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
    </div>
  );
};

export default Dashboard;
