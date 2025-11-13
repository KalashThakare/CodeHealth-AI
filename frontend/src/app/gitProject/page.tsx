"use client";
import { useState, useEffect } from "react";
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
} from "react-icons/fi";
import { toast } from "sonner";
import "./gitProject.css";
import { DashboardNavbar } from "../dashboard/_components/DashboardNavbar";

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
  } = useGitHubStore();

  const {
    fetchFullAnalysis,
    loading: analysisLoading,
    error: analysisError,
    clearError: clearAnalysisError,
    fullAnalysis,
  } = useAnalysisStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [analytics, setAnalytics] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  const [showAnalysisResults, setShowAnalysisResults] = useState(false);

  useEffect(() => {
    fetchGitHubRepos();
  }, [fetchGitHubRepos]);

  const filteredRepos = repositories.filter(
    (repo) =>
      repo.repoName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectRepo = (repo: any) => {
    setSelectedRepo(repo);
    selectRepository(repo);
    setShowAnalysisResults(false);
    clearAnalysisError();
  };

  const handleStartAnalysis = async () => {
    if (!selectedRepo) {
      toast.error("Please select a repository first");
      return;
    }

    try {
      // Fetch new analysis (backend handles caching)
      await fetchFullAnalysis(String(selectedRepo.repoId), false);
      setShowAnalysisResults(true);
      toast.success("New analysis completed");
    } catch (error) {
      console.error("Failed to start analysis:", error);
      setShowAnalysisResults(false);
    }
  };

  const hasAnalysisData = showAnalysisResults && fullAnalysis && selectedRepo;
  const displayAnalysis = fullAnalysis;

  const handleAddNewRepo = () => {
    router.push(`${process.env.NEXT_PUBLIC_WEB_APP_REDIRECT_URI}`);
  };

  return (
    <div className="gitproject-page min-h-screen bg-[var(--gp-bg)]">
      <DashboardNavbar />

      {/* Theme Toggle */}
      {/* <div className="theme-toggle-container">
        {mounted && (
          <div className="theme-toggle-wrapper">
            <button
              onClick={setSystemTheme}
              className={`theme-toggle-btn ${
                theme === "system" ? "active" : ""
              }`}
              title="System theme"
            >
              <FiMonitor size={18} />
            </button>

            <button
              onClick={setLightTheme}
              className={`theme-toggle-btn ${
                theme === "light" ? "active" : ""
              }`}
              title="Light theme"
            >
              <FiSun size={18} />
            </button>

            <button
              onClick={setDarkTheme}
              className={`theme-toggle-btn ${theme === "dark" ? "active" : ""}`}
              title="Dark theme"
            >
              <FiMoon size={18} />
            </button>
          </div>
        )}
      </div> */}

      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--gp-fg)] mb-1">
            GitHub Repository Analysis
          </h1>
          <p className="text-sm text-[var(--gp-fg-secondary)]">
            Select a repository to analyze code health metrics with AI-powered
            insights
          </p>
        </header>

        {/* Error Display */}
        {(githubError || analysisError) && (
          <div className="alert alert-error animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiAlertCircle className="text-error" size={20} />
                <span>{githubError || analysisError}</span>
              </div>
              <button
                onClick={() => {
                  clearGithubError();
                  clearAnalysisError();
                }}
                className="p-2 rounded-lg hover:bg-[var(--gp-bg-secondary)] transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Repository List */}
          <div className="lg:col-span-1">
            <div className="apple-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-[var(--gp-fg)] flex items-center gap-2">
                  <FiGithub size={18} />
                  Repositories
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddNewRepo}
                    className="glassmorphism-button p-1 !rounded-xl transition-all"
                    title="Add new repository"
                  >
                    <FiPlus size={18} />
                  </button>
                  <button
                    onClick={fetchGitHubRepos}
                    disabled={githubLoading}
                    className="glassmorphism-button p-1 !rounded-xl transition-all disabled:opacity-50"
                    title="Refresh repositories"
                  >
                    <FiRefreshCw
                      size={18}
                      className={githubLoading ? "animate-spin" : ""}
                    />
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gp-fg-secondary)]"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search repositories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 !m-0 text-sm text-center"
                />
              </div>

              {/* Repository List */}
              <div className="space-y-1.5 max-h-[600px]">
                {githubLoading ? (
                  <div className="empty-state">
                    <FiLoader size={24} className="animate-spin mx-auto" />
                  </div>
                ) : filteredRepos.length === 0 ? (
                  <div className="empty-state">
                    <FiGithub className="empty-state-icon" />
                    <p className="text-[var(--gp-fg-secondary)]">
                      No repositories found
                    </p>
                  </div>
                ) : (
                  filteredRepos.map((repo) => (
                    <button
                      key={repo.repoId}
                      onClick={() => handleSelectRepo(repo)}
                      className={`repo-item ${
                        selectedRepo?.repoId === repo.repoId ? "active" : ""
                      }`}
                    >
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
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Repository Info */}
            {!selectedRepo ? (
              <div className="apple-card py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                  {/* Left 1/4 - Icon */}
                  <div className="col-span-1 w-full flex items-center justify-center">
                    <div className="w-20 h-20 rounded-xl bg-[var(--gp-bg-secondary)] flex items-center justify-center">
                      <FiGithub
                        size={40}
                        className="text-[var(--gp-fg-secondary)] opacity-50"
                      />
                    </div>
                  </div>

                  {/* Right 3/4 - Content */}
                  <div className="col-span-1 md:col-span-3 text-center md:text-left">
                    <h3 className="text-lg font-semibold text-[var(--gp-fg)] mb-2">
                      Select a Repository
                    </h3>
                    <p className="text-sm text-[var(--gp-fg-secondary)] leading-relaxed">
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
                    <div className="w-10 h-10 rounded-lg bg-[var(--gp-bg-secondary)] flex items-center justify-center font-bold text-base text-[var(--gp-fg)] neon-glow-subtle">
                      {selectedRepo.repoName[0]?.toUpperCase() || "R"}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[var(--gp-fg)]">
                        {selectedRepo.repoName}
                      </h3>
                      <div className="flex items-center gap-2.5 text-xs text-[var(--gp-fg-secondary)] mt-0.5">
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
                      </div>
                    </div>
                  </div>
                  <a
                    href={selectedRepo.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glassmorphism-button p-2 rounded-lg transition-all"
                  >
                    <FiExternalLink size={16} />
                  </a>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleStartAnalysis}
                    disabled={analysisLoading}
                    className="btn glassmorphism-button-primary flex-1 min-w-[180px] flex items-center justify-center gap-1.5"
                  >
                    {analysisLoading ? (
                      <>
                        <FiLoader className="animate-spin" size={16} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <FiActivity size={16} />
                        {showAnalysisResults
                          ? "Run New Analysis"
                          : "Start Analysis"}
                      </>
                    )}
                  </button>
                </div>

                {/* View Analytics Button */}
                {hasAnalysisData && (
                  <div className="w-full flex justify-center items-center">
                    <button
                      onClick={() => {
                        setAnalytics(true);
                        router.push(`/analytics/${selectedRepo.repoId}`);
                      }}
                      className="repo-item flex gap-2 justify-center items-center"
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

            {/* About Section or Analysis Results */}
            {!hasAnalysisData && <DefaultAnalysisInfo />}
            {hasAnalysisData && (
              <AnalysisResults repo={selectedRepo} analysis={displayAnalysis} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Analysis Results Component */
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
      {/* Header */}
      <div className="pb-3 border-b border-[var(--gp-border)]">
        <h3 className="text-base font-semibold text-[var(--gp-fg)] mb-2">
          Analysis Results
        </h3>
        <div className="flex items-center gap-3 text-xs text-[var(--gp-fg-secondary)]">
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

      {/* Metrics Grid */}
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

      {/* Health Score Breakdown */}
      {Object.keys(componentScores).length > 0 && (
        <div className="card">
          <h4 className="font-medium text-[var(--gp-fg)] text-sm mb-3">
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

      {/* High Priority Files */}
      {refactorFiles.length > 0 && (
        <div>
          <h4 className="font-medium text-[var(--gp-fg)] text-sm mb-2 flex items-center gap-1.5">
            <FiAlertTriangle className="text-warning" size={14} />
            High Priority Files ({refactorFiles.length})
          </h4>
          <div className="space-y-1.5">
            {refactorFiles.slice(0, 5).map((file: any, idx: number) => (
              <div
                key={idx}
                className="card flex items-center justify-between p-2.5"
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

      {/* Commit Activity */}
      {totalCommits > 0 && (
        <div className="card">
          <h4 className="font-medium text-[var(--gp-fg)] text-sm mb-2.5">
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

      {/* No Data */}
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

/* Metric Card - Compact */
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

/* Default Info - Compact Grid Layout */
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
      <h3 className="text-base font-semibold text-[var(--gp-fg)] mb-2">
        About Code Health Analysis
      </h3>
      <p className="text-sm text-secondary leading-relaxed mb-2">
        Our AI-powered analysis provides comprehensive insights into your
        repository's code quality, maintainability, and health metrics.
      </p>

      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-0 mb-1">
        {features.map((item, idx) => (
          <div key={idx} className="card !p-4 !m-1">
            <div className="font-medium text-[var(--gp-fg)] text-xs mb-1">
              {item.title}
            </div>
            <div className="text-xs text-secondary leading-snug">
              {item.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Stats Grid */}
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

      {/* Tip */}
      <div className="alert alert-info !m-0">
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
