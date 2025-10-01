"use client";
import { useEffect, useState } from "react";
import { useGitHubStore } from "@/store/githubStore";
import { useAnalysisStore } from "@/store/analysisStore";
import { DashboardThemeToggle } from "@/components/ui/DashboardThemeToggle";
import {
  FiGithub,
  FiSearch,
  FiRefreshCw,
  FiExternalLink,
  FiPlay,
  FiLoader,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

export default function GitHubImportPage() {
  const {
    githubToken,
    githubUser,
    repositories,
    isLoading,
    error,
    fetchGitHubUser,
    fetchGitHubRepos,
    checkGitHubTokenStatus,
  } = useGitHubStore();

  const {
    startAnalysis,
    currentJob,
    isAnalyzing,
    loading: analysisLoading,
    error: analysisError,
    clearError: clearAnalysisError,
    cancelAnalysis,
  } = useAnalysisStore();

  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analyzingRepos, setAnalyzingRepos] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!githubToken) {
      checkGitHubTokenStatus();
    } else {
      fetchGitHubUser();
      fetchGitHubRepos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [githubToken]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchGitHubRepos();
    setTimeout(() => setIsRefreshing(false), 450);
  };

  const handleAnalyzeRepository = async (repo: any) => {
    const repoId = repo.id?.toString() || repo.repoId?.toString();
    if (!repoId) {
      console.error("Repository ID not found");
      return;
    }

    console.log("Starting analysis for repository:", {
      id: repoId,
      name: repo.repoName || repo.name,
    });

    // Add to analyzing set
    setAnalyzingRepos((prev) => new Set(prev).add(repoId));

    try {
      const job = await startAnalysis(repoId);

      if (job) {
        console.log("Analysis job started successfully:", job);
      } else {
        console.error("Failed to start analysis job");
        setAnalyzingRepos((prev) => {
          const next = new Set(prev);
          next.delete(repoId);
          return next;
        });
      }
    } catch (error) {
      console.error("Error starting analysis:", error);
      setAnalyzingRepos((prev) => {
        const next = new Set(prev);
        next.delete(repoId);
        return next;
      });
    }
  };

  const handleCancelAnalysis = async () => {
    if (currentJob?.jobId) {
      const success = await cancelAnalysis(currentJob.jobId);
      if (success) {
        // Remove from analyzing set
        setAnalyzingRepos((prev) => {
          const next = new Set(prev);
          next.delete(currentJob.repoId);
          return next;
        });
      }
    }
  };

  // Remove from analyzing set when job completes
  useEffect(() => {
    if (currentJob && ["completed", "failed"].includes(currentJob.status)) {
      setAnalyzingRepos((prev) => {
        const next = new Set(prev);
        next.delete(currentJob.repoId);
        return next;
      });
    }
  }, [currentJob]);

  const isRepoAnalyzing = (repoId: string) => {
    return (
      analyzingRepos.has(repoId) ||
      (currentJob?.repoId === repoId && isAnalyzing)
    );
  };

  // normalized name/url/date fields used by store
  const filteredRepos = repositories.filter((repo: any) =>
    (repo.repoName ?? repo.name ?? "")
      .toString()
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (!githubToken) {
    return <ConnectGitHubPage />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-10">
      {/* Theme Toggle in Top Right Corner */}
      <div className="absolute top-4 right-4 z-50">
        <DashboardThemeToggle />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-fg)]">
            Analyze Your Repositories
          </h1>
          <p className="text-sm text-[var(--color-fg-secondary)] mt-2">
            Select repositories to analyze code health, security, and
            performance with AI-powered insights.
          </p>
        </header>

        {/* Analysis Status Banner */}
        {currentJob && (
          <div
            className="card mb-6 border-l-4"
            style={{
              borderLeftColor:
                currentJob.status === "completed"
                  ? "var(--terminal-success)"
                  : currentJob.status === "failed"
                  ? "var(--terminal-error)"
                  : "var(--terminal-warning)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentJob.status === "queued" && (
                  <FiLoader className="animate-spin text-[var(--terminal-warning)]" />
                )}
                {currentJob.status === "processing" && (
                  <FiLoader className="animate-spin text-[var(--color-primary)]" />
                )}
                {currentJob.status === "completed" && (
                  <FiCheckCircle className="text-[var(--terminal-success)]" />
                )}
                {currentJob.status === "failed" && (
                  <FiAlertCircle className="text-[var(--terminal-error)]" />
                )}

                <div>
                  <div className="font-medium text-[var(--color-fg)]">
                    Analysis{" "}
                    {currentJob.status === "completed"
                      ? "Complete"
                      : currentJob.status === "failed"
                      ? "Failed"
                      : currentJob.status === "processing"
                      ? "In Progress"
                      : "Queued"}
                  </div>
                  <div className="text-sm text-[var(--color-fg-secondary)]">
                    Job ID: {currentJob.jobId}
                    {currentJob.estimatedWaitTime && (
                      <> • Estimated time: {currentJob.estimatedWaitTime}</>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentJob.status === "completed" && (
                  <button className="btn glass-btn-primary">
                    View Results
                  </button>
                )}
                {(currentJob.status === "queued" ||
                  currentJob.status === "processing") && (
                  <button
                    onClick={handleCancelAnalysis}
                    className="btn glass-btn-danger"
                    disabled={analysisLoading}
                  >
                    <FiX size={16} />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analysis Error Banner */}
        {analysisError && (
          <div className="card mb-6 border-l-4 border-l-[var(--terminal-error)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiAlertCircle className="text-[var(--terminal-error)]" />
                <div>
                  <div className="font-medium text-[var(--color-fg)]">
                    Analysis Error
                  </div>
                  <div className="text-sm text-[var(--color-fg-secondary)]">
                    {analysisError}
                  </div>
                </div>
              </div>
              <button
                onClick={clearAnalysisError}
                className="p-2 rounded hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Repository Analysis */}
          <section className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[var(--color-fg)]">
                Repository Analysis
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading || isRefreshing}
                  className="btn"
                >
                  <FiRefreshCw
                    size={16}
                    className={`${
                      isLoading || isRefreshing ? "animate-spin" : ""
                    }`}
                  />
                  <span className="ml-2 hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center bg-[var(--color-input-bg)] rounded px-3 py-2 min-w-[160px]">
                <FiGithub className="text-[var(--color-fg-secondary)] mr-2" />
                <span className="font-medium text-[var(--color-fg)]">
                  {githubUser?.login ?? "GitHub User"}
                </span>
              </div>

              <div className="relative flex-1">
                <FiSearch
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-secondary)] pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  className="w-full pl-12 pr-4 py-2 rounded bg-[var(--color-input-bg)] border border-[var(--color-input-border)] focus:border-[var(--color-primary)] placeholder:text-[var(--color-fg-secondary)]"
                  placeholder="Search repositories…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {isLoading && (
                <div className="py-6 text-[var(--color-fg-secondary)]">
                  Loading repositories…
                </div>
              )}

              {!isLoading && filteredRepos.length === 0 && (
                <div className="py-6 text-[var(--color-fg-secondary)]">
                  No repositories found.
                  <div className="mt-3">
                    <a
                      href={process.env.NEXT_PUBLIC_WEB_APP_REDIRECT_URI}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link"
                    >
                      Adjust GitHub App Permissions →
                    </a>
                  </div>
                </div>
              )}

              {!isLoading &&
                filteredRepos.map((repo: any) => {
                  const name = repo.repoName ?? repo.name ?? "Repository";
                  const date =
                    repo.updatedAt ?? repo.updated_at ?? repo.createdAt ?? "";
                  const prettyDate = date
                    ? new Date(date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })
                    : "";
                  const isPrivate = Boolean(
                    repo.isPrivate ??
                      repo.private ??
                      repo.visibility === "private"
                  );
                  const repoId = repo.id?.toString() || repo.repoId?.toString();
                  const isCurrentlyAnalyzing = isRepoAnalyzing(repoId);

                  return (
                    <div
                      key={repo.id}
                      className="flex items-center justify-between py-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center font-bold text-[var(--color-fg)]">
                          {name[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="font-medium truncate">{name}</span>
                            <span className="text-xs text-[var(--color-fg-secondary)]">
                              {prettyDate}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-fg-secondary)]">
                              {isPrivate ? "Private" : "Public"}
                            </span>
                            {isCurrentlyAnalyzing && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--terminal-warning)] text-white flex items-center gap-1">
                                <FiLoader className="animate-spin" size={12} />
                                Analyzing
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <a
                          href={repo.repoUrl ?? repo.html_url ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded bg-[var(--color-bg-secondary)] text-[var(--color-fg-secondary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-btn-fg)] transition"
                          aria-label="Open repository"
                        >
                          <FiExternalLink size={16} />
                        </a>
                        <button
                          className="btn glass-btn-primary flex items-center gap-2"
                          onClick={() => handleAnalyzeRepository(repo)}
                          disabled={isCurrentlyAnalyzing || analysisLoading}
                        >
                          {isCurrentlyAnalyzing ? (
                            <>
                              <FiLoader className="animate-spin" size={16} />
                              <span>Analyzing...</span>
                            </>
                          ) : (
                            <>
                              <FiPlay size={16} />
                              <span>Analyze</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="border-t border-[var(--color-border)] mt-6 pt-4 text-sm text-[var(--color-fg-secondary)]">
              Need help? View our analysis documentation →
            </div>
          </section>

          {/* Right: Analysis Info */}
          <aside className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[var(--color-fg)]">
                What We Analyze
              </h2>
            </div>

            <div className="space-y-4">
              <AnalysisFeatureTile
                title="Code Quality"
                description="Detect code smells, complexity issues, and maintainability problems across your entire codebase."
                icon=""
              />
              <AnalysisFeatureTile
                title="Security Vulnerabilities"
                description="Identify security risks, dependency vulnerabilities, and potential attack vectors."
                icon=""
              />
              <AnalysisFeatureTile
                title="Performance Metrics"
                description="Analyze performance bottlenecks, memory usage patterns, and optimization opportunities."
                icon=""
              />
              <AnalysisFeatureTile
                title="AI-Powered Suggestions"
                description="Get intelligent recommendations for code improvements and best practices."
                icon=""
              />
            </div>

            <div className="mt-6 p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h3 className="font-medium text-[var(--color-fg)] mb-2">
                Analysis Process
              </h3>
              <div className="space-y-2 text-sm text-[var(--color-fg-secondary)]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div>
                  Repository is queued for analysis
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--terminal-warning)]"></div>
                  AI processes code structure and patterns
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--terminal-success)]"></div>
                  Detailed report with recommendations
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* Analysis feature tile component */
function AnalysisFeatureTile({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-card)]">
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <h3 className="font-semibold text-[var(--color-fg)] mb-1">{title}</h3>
          <p className="text-sm text-[var(--color-fg-secondary)]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* Lightweight connect prompt */
function ConnectGitHubPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="card w-full max-w-md text-center">
        <FiGithub
          size={48}
          className="mx-auto mb-4 text-[var(--color-primary)]"
        />
        <h2 className="text-2xl font-bold mb-2 text-[var(--color-fg)]">
          Connect your GitHub account
        </h2>
        <p className="text-[var(--color-fg-secondary)] mb-6">
          To import repositories and enable CodeHealth analysis, connect your
          GitHub account.
        </p>
        <button
          className="btn w-full"
          onClick={() =>
            (window.location.href = process.env.NEXT_PUBLIC_GITHUB_AUTH_URL!)
          }
        >
          Connect GitHub
        </button>
      </div>
    </div>
  );
}
