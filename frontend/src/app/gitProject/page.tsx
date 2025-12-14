"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGitHubStore } from "@/store/githubStore";
import { useAnalysisStore } from "@/store/analysisStore";
import { useTheme } from "@/components/ui/themeToggle";
import {
  FiGithub,
  FiSearch,
  FiLoader,
  FiAlertCircle,
  FiX,
  FiRefreshCw,
  FiExternalLink,
  FiGitBranch,
  FiLock,
  FiUnlock,
  FiActivity,
  FiTrendingUp,
  FiCode,
  FiAlertTriangle,
  FiPlus,
  FiCheckCircle,
} from "react-icons/fi";
import "./gitProject.css";
import { DashboardNavbar } from "../dashboard/_components/DashboardNavbar";
import Link from "next/link";

export default function GitHubImportPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    repositories,
    isLoading: githubLoading,
    error: githubError,
    fetchGitHubRepos,
    clearError: clearGithubError,
    selectRepository,
    initializeRepository,
    uninitializeRepository,
    getInitializedCount,
    initializingRepoId,
    githubAppRedirect,
  } = useGitHubStore();

  const {
    fetchFullAnalysis,
    loading: analysisLoading,
    error: analysisError,
    clearError: clearAnalysisError,
    fullAnalysis,
    socketNotifications,
    initSocketNotificationListeners,
    removeSocketNotificationListeners,
    clearSocketNotifications,
  } = useAnalysisStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [analytics, setAnalytics] = useState(false);
  const [showAnalysisResults, setShowAnalysisResults] = useState(false);
  const [analyzingRepoId, setAnalyzingRepoId] = useState<number | null>(null);

  const selectedRepoFromStore = useGitHubStore((s) => s.selectedRepo);
  const [selectedRepo, setSelectedRepo] = useState<any>(selectedRepoFromStore);

  const initializedCount = mounted ? getInitializedCount() : 0;

  useEffect(() => {
    fetchGitHubRepos();
  }, [fetchGitHubRepos]);

  useEffect(() => {
    const initListeners = async () => {
      await initSocketNotificationListeners();
    };
    initListeners();

    return () => {
      removeSocketNotificationListeners();
    };
  }, [initSocketNotificationListeners, removeSocketNotificationListeners]);

  useEffect(() => {
    if (socketNotifications.length === 0 || !analyzingRepoId) return;

    const latestNotification = socketNotifications[0];
    const { event, payload } = latestNotification as any;

    const tryHandleCompletion = (repoIdFromPayload?: any) => {
      const completedRepoId =
        repoIdFromPayload || payload?.repoId || payload?.repositoryId;
      if (!completedRepoId) return false;
      if (String(completedRepoId) !== String(analyzingRepoId)) return false;

      setAnalyzingRepoId(null);

      setShowAnalysisResults(true);

      if (selectedRepo?.repoId !== Number(completedRepoId)) {
        const repo = repositories.find(
          (r) => String(r.repoId) === String(completedRepoId)
        );
        if (repo) {
          setSelectedRepo(repo);
          selectRepository(repo);
        }
      }

      fetchFullAnalysis(String(completedRepoId), true)
        .then(() => {
          setTimeout(() => clearSocketNotifications(), 1000);
        })
        .catch((error) => {
          console.error("Failed to fetch completed analysis:", error);
          setShowAnalysisResults(false);
          clearSocketNotifications();
        });

      return true;
    };

    if (event === "analysis_complete") {
      tryHandleCompletion(payload?.repoId || payload?.repositoryId);
      return;
    }

    if (
      event === "notification" &&
      payload?.type === "analysis" &&
      payload?.success
    ) {
      tryHandleCompletion(payload?.repoId);
      return;
    }

    if (event === "notification" && typeof payload?.message === "string") {
      const msg = payload.message as string;
      const repo = repositories.find((r) => r.repoId === analyzingRepoId);
      if (repo && msg.includes(repo.fullName)) {
        tryHandleCompletion(analyzingRepoId);
        return;
      }
    }
  }, [
    socketNotifications,
    analyzingRepoId,
    selectedRepo,
    fetchFullAnalysis,
    clearSocketNotifications,
    repositories,
  ]);

  useEffect(() => {
    if (
      selectedRepoFromStore &&
      selectedRepoFromStore.repoId !== selectedRepo?.repoId
    ) {
      setSelectedRepo(selectedRepoFromStore);
      setShowAnalysisResults(false);
      clearAnalysisError();
    }
  }, [selectedRepoFromStore]);

  useEffect(() => {
    if (selectedRepo && repositories.length > 0) {
      const repoExists = repositories.some(
        (r) => r.repoId === selectedRepo.repoId
      );
      if (!repoExists) {
        setSelectedRepo(null);
        selectRepository(null as any);
      }
    } else if (selectedRepo && repositories.length === 0) {
      setSelectedRepo(null);
      selectRepository(null as any);
    }
  }, [repositories, selectedRepo]);

  const filteredRepos = repositories
    .filter(
      (repo) =>
        repo.repoName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a.initialised && !b.initialised) return -1;
      if (!a.initialised && b.initialised) return 1;
      return 0;
    });

  const handleSelectRepo = async (repo: any) => {
    if (selectedRepo?.repoId !== repo.repoId) {
      clearSocketNotifications();
    }

    setSelectedRepo(repo);
    selectRepository(repo);
    clearAnalysisError();

    if (repo.initialised) {
      try {
        await fetchFullAnalysis(String(repo.repoId), true);
        setShowAnalysisResults(true);
      } catch (error) {
        setShowAnalysisResults(false);
      }
    } else {
      setShowAnalysisResults(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedRepo) {
      return;
    }

    try {
      await fetchFullAnalysis(String(selectedRepo.repoId), false);
      setShowAnalysisResults(true);
    } catch (error) {
      console.error("Failed to start analysis:", error);
      setShowAnalysisResults(false);
    }
  };

  const handleInitializeRepo = async (repoId: number) => {
    clearSocketNotifications();
    setShowAnalysisResults(false);

    const staleTimer = setTimeout(() => {
      setAnalyzingRepoId((cur) => (cur === repoId ? null : cur));
      clearSocketNotifications();
    }, 1000 * 60 * 5);

    try {
      const success = await initializeRepository(repoId);
      if (success) {
        await fetchGitHubRepos();
        const refreshed =
          useGitHubStore
            .getState()
            .repositories.find((r) => r.repoId === repoId) || null;
        if (refreshed) {
          setSelectedRepo(refreshed);
          selectRepository(refreshed);
          setAnalyzingRepoId(repoId);
        }
        clearTimeout(staleTimer);
        return;
      }

      await fetchGitHubRepos();
      const refreshed = repositories.find((r) => r.repoId === repoId);
      if (refreshed?.initialised) {
        setSelectedRepo(refreshed);
        selectRepository(refreshed);
        setAnalyzingRepoId(repoId);
        clearTimeout(staleTimer);
        return;
      }

      setAnalyzingRepoId(null);
      clearTimeout(staleTimer);
    } catch (err) {
      console.error("initializeRepository error:", err);
      try {
        await fetchGitHubRepos();
        const refreshed = repositories.find((r) => r.repoId === repoId);
        if (refreshed?.initialised) {
          setSelectedRepo(refreshed);
          selectRepository(refreshed);
          clearTimeout(staleTimer);
          return;
        }
      } catch (e) {
        console.error("Failed to refresh repos after init error:", e);
      }

      setAnalyzingRepoId(null);
      clearTimeout(staleTimer);
    }
  };

  const hasAnalysisData = showAnalysisResults && fullAnalysis && selectedRepo;
  const displayAnalysis = fullAnalysis;

  return (
    <div className="gitproject-page min-h-screen bg-(--gp-bg)">
      <DashboardNavbar />
      <div className="max-w-7xl mx-auto p-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-(--gp-fg) mb-1">
            GitHub Repository Analysis
          </h1>
          <p className="text-sm text-(--gp-fg-secondary)">
            Select a repository to analyze code health metrics with AI-powered
            insights
          </p>
        </header>

        {(githubError || analysisError) && (
          <div className="alert alert-error animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiAlertCircle className="text-error" size={20} />
                <span>
                  {analysisError
                    ? `${analysisError}. Make sure the repo is initialized successfully`
                    : githubError ?? null}
                </span>
              </div>
              <button
                onClick={() => {
                  clearGithubError();
                  clearAnalysisError();
                }}
                className="p-2 glass-btn rounded-lg hover:bg-(--gp-bg-secondary) transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="apple-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-(--gp-fg) flex items-center gap-2">
                    <FiGithub size={18} />
                    Repositories
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-(--gp-bg-secondary) text-(--gp-fg-secondary)">
                    {initializedCount}/2 active
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={githubAppRedirect}
                    className="glassmorphism-button p-1 rounded-xl! transition-all"
                    title="Add new repository"
                  >
                    <FiPlus size={18} />
                  </button>
                  <button
                    onClick={fetchGitHubRepos}
                    disabled={githubLoading}
                    className="glassmorphism-button p-1 rounded-xl! transition-all disabled:opacity-50"
                    title="Refresh repositories"
                  >
                    <FiRefreshCw
                      size={18}
                      className={githubLoading ? "animate-spin" : ""}
                    />
                  </button>
                </div>
              </div>

              <div className="relative mb-3">
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-(--gp-fg-secondary)"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search repositories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 m-0! text-sm text-center"
                />
              </div>

              <div className="space-y-1.5 max-h-[600px]">
                {githubLoading ? (
                  <div className="empty-state">
                    <FiLoader size={24} className="animate-spin mx-auto" />
                  </div>
                ) : filteredRepos.length === 0 ? (
                  <div className="empty-state">
                    <FiGithub className="empty-state-icon" />
                    <p className="text-(--gp-fg-secondary)">
                      No repositories found
                    </p>
                  </div>
                ) : (
                  filteredRepos.map((repo) => {
                    const isInitialized = repo.initialised;
                    const isLoading = initializingRepoId === repo.repoId;

                    return (
                      <div
                        key={repo.repoId}
                        onClick={() => handleSelectRepo(repo)}
                        className={`repo-item flex justify-between items-center ${
                          selectedRepo?.repoId === repo.repoId ? "active" : ""
                        }`}
                      >
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <div className="font-medium truncate mb-0.5 text-sm">
                            {repo.repoName}
                          </div>
                          <div className="flex items-center gap-2 text-xs opacity-70">
                            {repo.visibility === "private" ? (
                              <span className="flex items-center gap-1">
                                <FiLock size={10} />
                                Private
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <FiUnlock size={10} />
                                Public
                              </span>
                            )}
                            {isInitialized && (
                              <span className="text-(--terminal-success) flex items-center gap-1">
                                • Initialized
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (isInitialized) {
                              const success = await uninitializeRepository(
                                repo.repoId
                              );
                              if (success) {
                                if (selectedRepo?.repoId === repo.repoId) {
                                  setSelectedRepo((s: any) =>
                                    s ? { ...s, initialised: false } : s
                                  );
                                  setAnalyzingRepoId(null);
                                  setShowAnalysisResults(false);
                                  clearSocketNotifications();
                                }
                              }
                            } else {
                              await handleInitializeRepo(repo.repoId);
                            }
                          }}
                          disabled={isLoading}
                          className={`glassmorphism-button px-2 py-1 text-xs whitespace-nowrap flex items-center gap-1 ${
                            isInitialized ? "text-(--terminal-error)!" : ""
                          }`}
                        >
                          {isLoading ? (
                            <>
                              <FiLoader size={12} className="animate-spin" />
                              {isInitialized
                                ? "Removing..."
                                : "Initializing..."}
                            </>
                          ) : isInitialized ? (
                            "Remove"
                          ) : (
                            "Initialize"
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {!selectedRepo ? (
              <div className="apple-card py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                  <div className="col-span-1 w-full flex items-center justify-center">
                    <div className="w-20 h-20 rounded-xl bg-(--gp-bg-secondary) flex items-center justify-center">
                      <FiGithub
                        size={40}
                        className="text-(--gp-fg-secondary) opacity-50"
                      />
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-3 text-center md:text-left">
                    <h3 className="text-lg font-semibold text-(--gp-fg) mb-2">
                      Select a Repository
                    </h3>
                    <p className="text-sm text-(--gp-fg-secondary) leading-relaxed">
                      Choose a repository from the list to check its code health
                      analysis. Our AI-powered system will provide comprehensive
                      insights into code quality, maintainability, and technical
                      debt.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="apple-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-(--gp-bg-secondary) flex items-center justify-center font-bold text-base text-(--gp-fg) neon-glow-subtle">
                      {selectedRepo.repoName[0]?.toUpperCase() || "R"}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-(--gp-fg)">
                        {selectedRepo.repoName}
                      </h3>
                      <div className="flex items-center gap-2.5 text-xs text-(--gp-fg-secondary) mt-0.5">
                        <span className="flex items-center gap-1">
                          <FiGitBranch size={12} />
                          {selectedRepo.defaultBranch || "main"}
                        </span>
                        {selectedRepo.visibility === "private" ? (
                          <span className="flex items-center gap-1">
                            <FiLock size={12} />
                            Private
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <FiUnlock size={12} />
                            Public
                          </span>
                        )}
                        {selectedRepo.initialised && (
                          <span className="text-(--terminal-success) flex items-center gap-1">
                            • Initialized
                          </span>
                        )}
                        {analyzingRepoId === selectedRepo?.repoId && (
                          <span className="text-(--terminal-warning) flex items-center gap-1">
                            <FiLoader size={10} className="animate-spin" />
                            Analyzing
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={selectedRepo.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glassmorphism-button p-2 rounded-lg transition-all"
                  >
                    <FiExternalLink size={16} />
                  </Link>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {!selectedRepo?.initialised ? (
                    <button
                      onClick={() => handleInitializeRepo(selectedRepo.repoId)}
                      disabled={initializingRepoId === selectedRepo?.repoId}
                      className="btn glassmorphism-button-primary flex-1 min-w-[180px] flex items-center justify-center gap-1.5"
                    >
                      {initializingRepoId === selectedRepo?.repoId ? (
                        <>
                          <FiLoader className="animate-spin" size={16} />
                          Initializing...
                        </>
                      ) : (
                        <>
                          <FiActivity size={16} />
                          Initialize Repository
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleStartAnalysis}
                      disabled={
                        analysisLoading ||
                        analyzingRepoId === selectedRepo?.repoId
                      }
                      className="btn glassmorphism-button-primary flex-1 min-w-[180px] flex items-center justify-center gap-1.5"
                    >
                      {analyzingRepoId === selectedRepo?.repoId ? (
                        <>
                          <FiLoader className="animate-spin" size={16} />
                          Analyzing...
                        </>
                      ) : analysisLoading ? (
                        <>
                          <FiLoader className="animate-spin" size={16} />
                          Loading...
                        </>
                      ) : showAnalysisResults && fullAnalysis ? (
                        <>
                          <FiActivity size={16} />
                          Run New Analysis
                        </>
                      ) : (
                        <>
                          <FiActivity size={16} />
                          Start Analysis
                        </>
                      )}
                    </button>
                  )}
                </div>
                {hasAnalysisData && (
                  <div className="w-full mt-2 flex justify-center items-center bg-transparent!">
                    <button
                      onClick={() => {
                        setAnalytics(true);
                        router.push(`/analytics/${selectedRepo.repoId}`);
                      }}
                      className="repo-item active flex gap-2 justify-center items-center"
                      title="View Analytics Dashboard"
                    >
                      <FiActivity size={16} />
                      {analytics ? (
                        <span>Loading ...</span>
                      ) : (
                        <span>View Detailed Analytics</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {analyzingRepoId === selectedRepo?.repoId && (
              <AnalysisLoadingState
                notifications={socketNotifications}
                selectedRepo={selectedRepo}
              />
            )}
            {!hasAnalysisData &&
              analyzingRepoId !== selectedRepo?.repoId &&
              !analysisLoading && <DefaultAnalysisInfo />}
            {hasAnalysisData && analyzingRepoId !== selectedRepo?.repoId && (
              <AnalysisResults repo={selectedRepo} analysis={displayAnalysis} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisLoadingState({
  notifications,
  selectedRepo,
}: {
  notifications: Array<{ event: string; payload: any; receivedAt: string }>;
  selectedRepo: any;
}) {
  const getEventIcon = (event: string) => {
    switch (event) {
      case "analysis_update":
        return <FiActivity className="text-primary animate-pulse" size={16} />;
      case "file_analyzed":
        return <FiCode className="text-success" size={16} />;
      case "analysis_complete":
        return <FiCheckCircle className="text-success" size={16} />;
      case "notification":
        return <FiAlertCircle className="text-info" size={16} />;
      default:
        return <FiActivity className="text-primary" size={16} />;
    }
  };

  const getEventTitle = (event: string) => {
    switch (event) {
      case "analysis_update":
        return "Analysis Update";
      case "file_analyzed":
        return "File Analyzed";
      case "analysis_complete":
        return "Analysis Complete";
      case "notification":
        return "Notification";
      default:
        return event
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  const getEventMessage = (notification: any) => {
    const { event, payload } = notification;

    if (event === "file_analyzed" && payload?.file) {
      return `Analyzed: ${payload.file}`;
    }
    if (event === "analysis_update" && payload?.message) {
      return payload.message;
    }
    if (event === "analysis_complete") {
      return "Repository analysis completed successfully!";
    }
    if (event === "notification" && payload?.message) {
      return payload.message;
    }

    return payload?.message || "Processing...";
  };

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [notifications.length]);

  const lines = [...notifications];

  return (
    <div className="apple-card animate-fadeIn z-10">
      <div className="terminal-header">
        <div>
          <div className="title">Analyzing Repository</div>
          {selectedRepo && (
            <div className="sub">
              Running analysis on {selectedRepo.repoName}
            </div>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="terminal-panel custom-scrollbar"
        onWheel={(e) => {
          const el = containerRef.current;
          if (!el) return;
          const { scrollTop, scrollHeight, clientHeight } = el;
          const delta = e.deltaY;
          const atTop = scrollTop === 0;
          const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

          if ((delta < 0 && !atTop) || (delta > 0 && !atBottom)) {
            e.stopPropagation();
          }
        }}
      >
        {lines.length === 0 ? (
          <div className="terminal-line">
            <div className="terminal-time">--:--:--</div>
            <div className="terminal-dot terminal-event-info" />
            <div className="terminal-msg muted">Initializing analysis...</div>
          </div>
        ) : (
          lines.map((notification, idx) => {
            const t = new Date(notification.receivedAt).toLocaleTimeString();
            const msg = getEventMessage(notification);
            let kind = "info";
            if (notification.event === "file_analyzed") kind = "success";
            if (notification.event === "analysis_complete") kind = "success";
            if (notification.event === "analysis_update") kind = "info";
            if (
              notification.event === "notification" &&
              notification.payload?.success === false
            )
              kind = "error";

            const filePath =
              notification.payload?.file ||
              notification.payload?.filePath ||
              notification.payload?.path ||
              notification.payload?.pathname ||
              notification.payload?.pathName ||
              notification.payload?.meta?.filePath ||
              notification.payload?.meta?.path ||
              notification.payload?.meta?.pathName ||
              null;

            return (
              <div
                key={idx}
                className={`terminal-line terminal-event-${kind}`}
                style={{ animationDelay: `${idx * 20}ms` }}
              >
                <div className="terminal-time">{t}</div>
                <div className="terminal-dot" />
                <div style={{ flex: 1 }}>
                  {filePath && (
                    <div className="terminal-file" title={filePath}>
                      <code>{filePath}</code>
                    </div>
                  )}
                  <div className="terminal-msg">{msg}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-(--gp-border)">
        <div className="flex items-center justify-between text-xs text-secondary">
          <span className="flex items-center gap-1">
            <FiActivity size={12} />
            {notifications.length} events received
          </span>
          <span>This may take a few moments...</span>
        </div>
      </div>
    </div>
  );
}

function AnalysisResults({ repo, analysis }: { repo: any; analysis: any }) {
  const result = analysis?.result || {};
  const commitAnalysis = analysis?.commitAnalysis || {};
  const repoHealthScore = analysis?.repoHealthScore || {};

  const totalFiles = result.totalFiles || 0;
  const totalLOC = result.totalLOC || 0;
  const avgComplexity = result.avgCyclomaticComplexity || 0;
  const avgMaintainability = result.avgMaintainabilityIndex || 0;
  const technicalDebt = result.technicalDebtScore || 0;
  const totalCommits = commitAnalysis.totalCommits || 0;
  const overallHealth = repoHealthScore.overallHealthScore || 0;
  const componentScores = repoHealthScore.componentScores || {};
  const refactorFiles = result.refactorPriorityFiles || [];

  return (
    <div className="apple-card space-y-4 animate-fadeIn z-10">
      <div className="pb-3 border-b border-(--gp-border)">
        <h3 className="text-base font-semibold text-(--gp-fg) mb-2">
          Analysis Results
        </h3>
        <div className="flex items-center gap-3 text-xs text-(--gp-fg-secondary)">
          <span className="flex items-center gap-1">
            <FiCode size={14} />
            {totalFiles} files
          </span>
          <span className="flex items-center gap-1">
            <FiActivity size={14} />
            {totalLOC.toLocaleString()} LOC
          </span>
          <span className="badge badge-primary text-xs py-0.5">
            Health: {overallHealth.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={<FiCode />}
          label="Avg Complexity"
          value={avgComplexity.toFixed(1)}
          color="var(--gp-primary)"
        />
        <MetricCard
          icon={<FiTrendingUp />}
          label="Maintainability"
          value={avgMaintainability.toFixed(1)}
          color="var(--terminal-success)"
        />
        <MetricCard
          icon={<FiAlertTriangle />}
          label="Technical Debt"
          value={technicalDebt.toFixed(1)}
          color="var(--terminal-warning)"
        />
        <MetricCard
          icon={<FiActivity />}
          label="Total Commits"
          value={totalCommits.toString()}
          color="var(--terminal-info)"
        />
      </div>

      {Object.keys(componentScores).length > 0 && (
        <div className="card">
          <h4 className="font-medium text-(--gp-fg) text-sm mb-3">
            Health Score Breakdown
          </h4>
          <div className="space-y-2.5">
            {Object.entries(componentScores).map(
              ([key, value]: [string, any]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-secondary capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="text-xs font-medium">
                      {(value || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="progress-bar h-1.5">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${value || 0}%` }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {refactorFiles.length > 0 && (
        <div>
          <h4 className="font-medium text-(--gp-fg) text-sm mb-2 flex items-center gap-1.5">
            <FiAlertTriangle className="text-warning" size={14} />
            High Priority Files ({refactorFiles.length})
          </h4>
          <div className="space-y-2!">
            {refactorFiles.slice(0, 5).map((file: any, idx: number) => (
              <div
                key={idx}
                className="card flex items-center justify-between p-3!"
              >
                <span className="text-xs font-mono truncate flex-1">
                  {file.path || "Unknown file"}
                </span>
                <span className="badge badge-warning ml-2 text-xs py-0.5">
                  {(file.riskScore || 0).toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalCommits > 0 && (
        <div className="card">
          <h4 className="font-medium text-(--gp-fg) text-sm mb-2.5">
            Commit Activity
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-secondary text-xs">Total Commits</div>
              <div className="font-semibold text-base">{totalCommits}</div>
            </div>
            {commitAnalysis.daysActive && (
              <div>
                <div className="text-secondary text-xs">Days Active</div>
                <div className="font-semibold text-base">
                  {commitAnalysis.daysActive}
                </div>
              </div>
            )}
            {commitAnalysis.contributorCount && (
              <div>
                <div className="text-secondary text-xs">Contributors</div>
                <div className="font-semibold text-base">
                  {commitAnalysis.contributorCount}
                </div>
              </div>
            )}
            {commitAnalysis.busFactor && (
              <div>
                <div className="text-secondary text-xs">Bus Factor</div>
                <div className="font-semibold text-base capitalize">
                  {commitAnalysis.busFactor}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {totalFiles === 0 && totalCommits === 0 && (
        <div className="empty-state">
          <FiAlertCircle className="empty-state-icon" />
          <p className="font-medium mb-1">No analysis data available</p>
          <p className="text-sm text-secondary">
            The analysis may still be processing or encountered an error.
          </p>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-1.5 mb-1.5" style={{ color }}>
        <span className="text-sm">{icon}</span>
        <span className="text-xs text-secondary">{label}</span>
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

function DefaultAnalysisInfo() {
  const features = [
    {
      title: "Code Quality & Complexity",
      desc: "Cyclomatic complexity and code structure",
    },
    {
      title: "Maintainability Index",
      desc: "How easy it is to maintain your codebase",
    },
    {
      title: "Technical Debt",
      desc: "Areas that need refactoring",
    },
    {
      title: "Commit Patterns",
      desc: "Development activity and velocity",
    },
    {
      title: "Health Score",
      desc: "Overall repository health rating",
    },
    {
      title: "AI Recommendations",
      desc: "Powered suggestions for improvements",
    },
  ];

  return (
    <div className="apple-card animate-fadeIn z-10">
      <h3 className="text-base font-semibold text-(--gp-fg) mb-2">
        About Code Health Analysis
      </h3>
      <p className="text-sm text-secondary leading-relaxed mb-2">
        Our AI-powered analysis provides comprehensive insights into your
        repository's code quality, maintainability, and health metrics.
      </p>

      <div className="grid grid-cols-2 gap-0 mb-1">
        {features.map((item, idx) => (
          <div key={idx} className="card p-4! m-1!">
            <div className="font-medium text-(--gp-fg) text-xs mb-1">
              {item.title}
            </div>
            <div className="text-xs text-secondary leading-snug">
              {item.desc}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-1">
        <div className="card text-center">
          <div className="text-xl font-bold text-primary">10+</div>
          <div className="text-xs text-secondary mt-0.5">Metrics</div>
        </div>
        <div className="card text-center">
          <div className="text-xl font-bold text-primary">AI</div>
          <div className="text-xs text-secondary mt-0.5">Powered</div>
        </div>
        <div className="card text-center">
          <div className="text-xl font-bold text-primary">Real-time</div>
          <div className="text-xs text-secondary mt-0.5">Insights</div>
        </div>
      </div>

      <div className="alert alert-info m-0!">
        <p className="text-xs font-medium mb-0.5">
          <strong>Pro Tip:</strong> Best Practices
        </p>
        <p className="text-xs opacity-90">
          Run analysis after major changes or weekly to track improvements.
        </p>
      </div>
    </div>
  );
}
