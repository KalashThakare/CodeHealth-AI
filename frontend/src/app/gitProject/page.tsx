// "use client";
// import { useEffect, useState } from "react";
// import { useGitHubStore } from "@/store/githubStore";
// import { useAnalysisStore } from "@/store/analysisStore";
// import { DashboardThemeToggle } from "@/components/ui/DashboardThemeToggle";
// import {
//   FiGithub,
//   FiSearch,
//   FiRefreshCw,
//   FiExternalLink,
//   FiPlay,
//   FiLoader,
//   FiX,
//   FiCheckCircle,
//   FiAlertCircle,
//   FiEye,
//   FiGitBranch,
//   FiLock,
//   FiUnlock,
//   FiCode,
//   FiAlertTriangle,
//   FiTrendingUp,
//   FiUsers,
//   FiActivity,
// } from "react-icons/fi";

// export default function GitHubImportPage() {
//   const {
//     githubToken,
//     githubUser,
//     repositories,
//     isLoading,
//     error,
//     fetchGitHubUser,
//     fetchGitHubRepos,
//     checkGitHubTokenStatus,
//   } = useGitHubStore();

//   const {
//     startAnalysis,
//     fetchAllMetrics,
//     currentJob,
//     isAnalyzing,
//     loading: analysisLoading,
//     error: analysisError,
//     clearError: clearAnalysisError,
//     cancelAnalysis,
//     fileMetrics,
//     pushMetrics,
//     commits,
//     commitAnalysis,
//   } = useAnalysisStore();

//   const [search, setSearch] = useState("");
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [analyzingRepos, setAnalyzingRepos] = useState<Set<string>>(new Set());
//   const [selectedRepo, setSelectedRepo] = useState<any>(null);
//   const [showingError, setShowingError] = useState(false);

//   useEffect(() => {
//     if (!githubToken) {
//       checkGitHubTokenStatus();
//     } else {
//       fetchGitHubUser();
//       fetchGitHubRepos();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [githubToken]);

//   // Watch for completed analysis and fetch metrics
//   useEffect(() => {
//     if (currentJob?.status === "completed" && currentJob.repoId) {
//       console.log("=== Analysis Completed ===");
//       console.log("Job:", currentJob);

//       // Fetch all metrics for the completed analysis
//       fetchAllMetrics(currentJob.repoId).then(() => {
//         console.log("=== All Metrics Fetched ===");
//       });
//     }
//   }, [currentJob?.status, currentJob?.repoId, fetchAllMetrics]);

//   // Handle failed analysis - show error for 5 seconds then revert
//   useEffect(() => {
//     if (currentJob?.status === "failed") {
//       console.log("=== Analysis Failed ===");
//       setShowingError(true);

//       const timer = setTimeout(() => {
//         setShowingError(false);
//         setSelectedRepo(null);
//         clearAnalysisError();
//       }, 5000);

//       return () => clearTimeout(timer);
//     }
//   }, [currentJob?.status, clearAnalysisError]);

//   // Log metrics whenever they update
//   useEffect(() => {
//     if (fileMetrics.length > 0) {
//       console.log("=== FILE METRICS ===");
//       console.log("Total Files Analyzed:", fileMetrics.length);
//       console.log("Sample File Metrics:", fileMetrics.slice(0, 3));
//       console.log("Full File Metrics:", fileMetrics);

//       const avgComplexity =
//         fileMetrics.reduce((sum, f) => sum + (f.cyclomaticComplexity || 0), 0) /
//         fileMetrics.length;
//       const avgMaintainability =
//         fileMetrics.reduce((sum, f) => sum + (f.maintainabilityIndex || 0), 0) /
//         fileMetrics.length;

//       console.log("Average Cyclomatic Complexity:", avgComplexity.toFixed(2));
//       console.log(
//         "Average Maintainability Index:",
//         avgMaintainability.toFixed(2)
//       );
//     }
//   }, [fileMetrics]);

//   useEffect(() => {
//     if (pushMetrics.length > 0) {
//       console.log("=== PUSH METRICS ===");
//       console.log("Total Pushes Analyzed:", pushMetrics.length);
//       console.log("Sample Push Metrics:", pushMetrics.slice(0, 3));
//       console.log("Full Push Metrics:", pushMetrics);
//     }
//   }, [pushMetrics]);

//   useEffect(() => {
//     if (commits.length > 0) {
//       console.log("=== COMMITS ===");
//       console.log("Total Commits:", commits.length);
//       console.log("Sample Commits:", commits.slice(0, 5));
//       console.log("Full Commits:", commits);

//       const contributors = commits.reduce((acc, commit) => {
//         const name = String(commit.authorName ?? "Unknown");
//         acc[name] = (acc[name] || 0) + 1;
//         return acc;
//       }, {} as Record<string, number>);

//       console.log(
//         "Top Contributors:",
//         (Object.entries(contributors) as [string, number][])
//           .sort(([, a], [, b]) => b - a)
//           .slice(0, 5)
//       );
//     }
//   }, [commits]);

//   useEffect(() => {
//     if (commitAnalysis.length > 0) {
//       console.log("=== COMMIT ANALYSIS ===");
//       console.log("Total Analysis Records:", commitAnalysis.length);
//       console.log("Full Commit Analysis:", commitAnalysis);
//     }
//   }, [commitAnalysis]);

//   const handleRefresh = async () => {
//     setIsRefreshing(true);
//     await fetchGitHubRepos();
//     setTimeout(() => setIsRefreshing(false), 450);
//   };

//   const handleAnalyzeRepository = async (repo: any) => {
//     const repoId = repo.repoId?.toString();
//     if (!repoId) {
//       console.error("❌ Repository ID not found");
//       return;
//     }

//     console.log("=== STARTING ANALYSIS ===");
//     console.log("Repository ID:", repoId);
//     console.log("Repository Name:", repo.repoName || repo.name);
//     console.log("Repository Data:", repo);

//     // Set selected repo for display
//     setSelectedRepo(repo);
//     setShowingError(false);

//     // Add to analyzing set
//     setAnalyzingRepos((prev) => new Set(prev).add(repoId));

//     try {
//       const job = await startAnalysis(repoId);

//       if (job) {
//         console.log("✅ Analysis job started successfully");
//         console.log("Job Details:", job);
//         console.log("Job ID:", job.jobId);
//         console.log("Status:", job.status);
//         console.log("Estimated Wait Time:", job.estimatedWaitTime);
//       } else {
//         console.error("❌ Failed to start analysis job - No job returned");
//         setAnalyzingRepos((prev) => {
//           const next = new Set(prev);
//           next.delete(repoId);
//           return next;
//         });
//         setSelectedRepo(null);
//       }
//     } catch (error) {
//       console.error("❌ Error starting analysis:", error);
//       setAnalyzingRepos((prev) => {
//         const next = new Set(prev);
//         next.delete(repoId);
//         return next;
//       });
//       setSelectedRepo(null);
//     }
//   };

//   const handleCancelAnalysis = async () => {
//     if (currentJob?.jobId) {
//       console.log("🛑 Cancelling analysis:", currentJob.jobId);
//       const success = await cancelAnalysis(currentJob.jobId);
//       if (success) {
//         console.log("✅ Analysis cancelled successfully");
//         setAnalyzingRepos((prev) => {
//           const next = new Set(prev);
//           next.delete(currentJob.repoId);
//           return next;
//         });
//         setSelectedRepo(null);
//       }
//     }
//   };

//   const handleViewResults = () => {
//     if (currentJob?.repoId) {
//       console.log("=== VIEWING RESULTS ===");
//       console.log("Repository ID:", currentJob.repoId);
//       console.log("Current Job:", currentJob);
//       console.log("File Metrics:", fileMetrics);
//       console.log("Push Metrics:", pushMetrics);
//       console.log("Commits:", commits);
//       console.log("Commit Analysis:", commitAnalysis);

//       // TODO: Navigate to results page or show modal
//       // router.push(`/analysis/${currentJob.repoId}`);
//     }
//   };

//   // Remove from analyzing set when job completes or fails
//   useEffect(() => {
//     if (currentJob && ["completed", "failed"].includes(currentJob.status)) {
//       setAnalyzingRepos((prev) => {
//         const next = new Set(prev);
//         next.delete(currentJob.repoId);
//         return next;
//       });
//     }
//   }, [currentJob]);

//   const isRepoAnalyzing = (repoId: string) => {
//     return (
//       analyzingRepos.has(repoId) ||
//       (currentJob?.repoId === repoId && isAnalyzing)
//     );
//   };

//   const filteredRepos = repositories.filter((repo: any) =>
//     (repo.repoName ?? repo.name ?? "")
//       .toString()
//       .toLowerCase()
//       .includes(search.toLowerCase())
//   );

//   if (!githubToken) {
//     return <ConnectGitHubPage />;
//   }

//   // Calculate analysis summary - FIXED: Better detection logic
//   const hasAnalysisData = fileMetrics.length > 0 || commits.length > 0;
//   const showAnalysisResults =
//     currentJob?.status === "completed" && hasAnalysisData && !showingError;

//   // Show skeleton if: selected repo exists AND (analyzing OR not completed yet OR showing error)
//   const showLoadingSkeleton =
//     selectedRepo !== null &&
//     currentJob?.status !== "completed" &&
//     !showingError;

//   // Show error message
//   const showErrorMessage = showingError && selectedRepo !== null;

//   console.log("Render State:", {
//     isAnalyzing,
//     analysisLoading,
//     selectedRepo: selectedRepo?.repoName,
//     currentJobStatus: currentJob?.status,
//     hasAnalysisData,
//     showAnalysisResults,
//     showLoadingSkeleton,
//     showErrorMessage,
//     showingError,
//   });

//   return (
//     <div className="min-h-screen bg-[var(--color-bg)] py-10">
//       <div className="absolute top-4 right-4 z-50">
//         <DashboardThemeToggle />
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <header className="mb-8">
//           <h1 className="text-4xl font-bold text-[var(--color-fg)]">
//             Analyze Your Repositories
//           </h1>
//           <p className="text-sm text-[var(--color-fg-secondary)] mt-2">
//             Select repositories to analyze code health, security, and
//             performance with AI-powered insights.
//           </p>
//         </header>

//         {/* Analysis Status Banner */}
//         {currentJob && !showingError && (
//           <div
//             className="card mb-6 border-l-4"
//             style={{
//               borderLeftColor:
//                 currentJob.status === "completed"
//                   ? "var(--terminal-success)"
//                   : currentJob.status === "failed"
//                   ? "var(--terminal-error)"
//                   : "var(--terminal-warning)",
//             }}
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 {currentJob.status === "queued" && (
//                   <FiLoader className="animate-spin text-[var(--terminal-warning)]" />
//                 )}
//                 {currentJob.status === "processing" && (
//                   <FiLoader className="animate-spin text-[var(--color-primary)]" />
//                 )}
//                 {currentJob.status === "completed" && (
//                   <FiCheckCircle className="text-[var(--terminal-success)]" />
//                 )}
//                 {currentJob.status === "failed" && (
//                   <FiAlertCircle className="text-[var(--terminal-error)]" />
//                 )}

//                 <div>
//                   <div className="font-medium text-[var(--color-fg)]">
//                     Analysis{" "}
//                     {currentJob.status === "completed"
//                       ? "Complete"
//                       : currentJob.status === "failed"
//                       ? "Failed"
//                       : currentJob.status === "processing"
//                       ? "In Progress"
//                       : "Queued"}
//                   </div>
//                   <div className="text-sm text-[var(--color-fg-secondary)]">
//                     Job ID: {currentJob.jobId}
//                     {currentJob.estimatedWaitTime && (
//                       <> • Estimated time: {currentJob.estimatedWaitTime}</>
//                     )}
//                   </div>
//                   {currentJob.status === "completed" && (
//                     <div className="text-xs text-[var(--terminal-success)] mt-1">
//                       ✓ {fileMetrics.length} files • {pushMetrics.length} pushes
//                       • {commits.length} commits analyzed
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="flex items-center gap-2">
//                 {currentJob.status === "completed" && (
//                   <button
//                     className="btn glass-btn-primary flex items-center gap-2"
//                     onClick={handleViewResults}
//                   >
//                     <FiEye size={16} />
//                     View Results
//                   </button>
//                 )}
//                 {(currentJob.status === "queued" ||
//                   currentJob.status === "processing") && (
//                   <button
//                     onClick={handleCancelAnalysis}
//                     className="btn glass-btn-danger"
//                     disabled={analysisLoading}
//                   >
//                     <FiX size={16} />
//                     Cancel
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Analysis Error Banner - Only shown temporarily */}
//         {analysisError && showingError && (
//           <div className="card mb-6 border-l-4 border-l-[var(--terminal-error)]">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <FiAlertCircle className="text-[var(--terminal-error)]" />
//                 <div>
//                   <div className="font-medium text-[var(--color-fg)]">
//                     Analysis Error
//                   </div>
//                   <div className="text-sm text-[var(--color-fg-secondary)]">
//                     {analysisError}
//                   </div>
//                   <div className="text-xs text-[var(--color-fg-secondary)] mt-1">
//                     This message will disappear in 5 seconds...
//                   </div>
//                 </div>
//               </div>
//               <button
//                 onClick={() => {
//                   setShowingError(false);
//                   setSelectedRepo(null);
//                   clearAnalysisError();
//                 }}
//                 className="p-2 rounded hover:bg-[var(--color-bg-secondary)] transition-colors"
//               >
//                 <FiX size={16} />
//               </button>
//             </div>
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Left: Repository Analysis */}
//           <section className="card">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-semibold text-[var(--color-fg)]">
//                 Repository Analysis
//               </h2>
//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={handleRefresh}
//                   disabled={isLoading || isRefreshing}
//                   className="btn !flex items-center gap-1.5 !px-5 !py-2"
//                 >
//                   <FiRefreshCw
//                     size={20}
//                     className={`${
//                       isLoading || isRefreshing ? "animate-spin" : ""
//                     }`}
//                   />
//                   <span className="ml-2 hidden sm:inline">Refresh</span>
//                 </button>
//               </div>
//             </div>

//             <div className="flex items-center justify-between gap-2 mb-4">
//               <div className="flex items-center bg-[var(--color-input-bg)] rounded px-3 py-2 min-w-[160px]">
//                 <FiGithub className="text-[var(--color-fg-secondary)] mr-2" />
//                 <span className="font-medium text-[var(--color-fg)]">
//                   {githubUser?.login ?? "GitHub User"}
//                 </span>
//               </div>

//               <div>
//                 <div className="relative flex-1 items-center">
//                   <FiSearch
//                     size={18}
//                     className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-secondary)] pointer-events-none"
//                     aria-hidden="true"
//                   />
//                   <input
//                     className="max-w-2xl truncate !mb-0 py-2 text-center rounded bg-[var(--color-input-bg)] border border-[var(--color-input-border)] focus:border-[var(--color-primary)] placeholder:text-[var(--color-fg-secondary)]"
//                     placeholder="Search repositories…"
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="divide-y divide-[var(--color-border)]">
//               {isLoading && (
//                 <div className="py-6 text-[var(--color-fg-secondary)]">
//                   Loading repositories…
//                 </div>
//               )}

//               {!isLoading && filteredRepos.length === 0 && (
//                 <div className="py-6 text-[var(--color-fg-secondary)]">
//                   No repositories found.
//                   <div className="mt-3">
//                     <a
//                       href={process.env.NEXT_PUBLIC_WEB_APP_REDIRECT_URI}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="link"
//                     >
//                       Adjust GitHub App Permissions →
//                     </a>
//                   </div>
//                 </div>
//               )}

//               {!isLoading &&
//                 filteredRepos.map((repo: any) => {
//                   const name = repo.repoName ?? repo.name ?? "Repository";
//                   const date =
//                     repo.updatedAt ?? repo.updated_at ?? repo.createdAt ?? "";
//                   const prettyDate = date
//                     ? new Date(date).toLocaleDateString(undefined, {
//                         month: "short",
//                         day: "numeric",
//                       })
//                     : "";
//                   const isPrivate = Boolean(
//                     repo.isPrivate ??
//                       repo.private ??
//                       repo.visibility === "private"
//                   );
//                   const repoId = repo.repoId?.toString();
//                   const isCurrentlyAnalyzing = isRepoAnalyzing(repoId);

//                   return (
//                     <div
//                       key={repo.id}
//                       className="flex items-center justify-between py-4"
//                     >
//                       <div className="flex items-center gap-3 min-w-0">
//                         <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center font-bold text-[var(--color-fg)]">
//                           {name[0]?.toUpperCase()}
//                         </div>
//                         <div className="min-w-0">
//                           <div className="flex items-center gap-3">
//                             <span className="font-medium truncate">{name}</span>
//                             <span className="text-xs text-[var(--color-fg-secondary)]">
//                               {prettyDate}
//                             </span>
//                             <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-fg-secondary)]">
//                               {isPrivate ? "Private" : "Public"}
//                             </span>
//                             {isCurrentlyAnalyzing && (
//                               <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--terminal-warning)] text-white flex items-center gap-1">
//                                 <FiLoader className="animate-spin" size={12} />
//                                 Analyzing
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-3">
//                         <a
//                           href={repo.repoUrl ?? repo.html_url ?? "#"}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="p-2 rounded bg-[var(--color-bg-secondary)] text-[var(--color-fg-secondary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-btn-fg)] transition"
//                           aria-label="Open repository"
//                         >
//                           <FiExternalLink size={16} />
//                         </a>
//                         <button
//                           className="btn glass-btn-primary flex items-center gap-2"
//                           onClick={() => handleAnalyzeRepository(repo)}
//                           disabled={isCurrentlyAnalyzing || analysisLoading}
//                         >
//                           {isCurrentlyAnalyzing ? (
//                             <>
//                               <FiLoader className="animate-spin" size={16} />
//                               <span>Analyzing...</span>
//                             </>
//                           ) : (
//                             <>
//                               <FiPlay size={16} />
//                               <span>Analyze</span>
//                             </>
//                           )}
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })}
//             </div>

//             <div className="border-t border-[var(--color-border)] mt-6 pt-4 text-sm text-[var(--color-fg-secondary)]">
//               Check browser console for detailed analysis logs
//             </div>
//           </section>

//           {/* Right: Analysis Results or Loading or Error or Default Info */}
//           <aside>
//             {/* Show Error Message - PRIORITY 1 */}
//             {showErrorMessage ? (
//               <AnalysisErrorDisplay
//                 repo={selectedRepo}
//                 error={analysisError || "Analysis failed. Please try again."}
//               />
//             ) : /* Show Loading Skeleton - PRIORITY 2 */
//             showLoadingSkeleton ? (
//               <AnalysisLoadingSkeleton repo={selectedRepo} />
//             ) : /* Show Analysis Results - PRIORITY 3 */
//             showAnalysisResults && selectedRepo ? (
//               <AnalysisResults
//                 repo={selectedRepo}
//                 fileMetrics={fileMetrics}
//                 pushMetrics={pushMetrics}
//                 commits={commits}
//                 commitAnalysis={commitAnalysis}
//               />
//             ) : (
//               /* Show Default Info - PRIORITY 4 */
//               <DefaultAnalysisInfo />
//             )}
//           </aside>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* Analysis Error Display Component */
// function AnalysisErrorDisplay({ repo, error }: { repo: any; error: string }) {
//   const repoName = repo?.repoName ?? repo?.name ?? "Repository";

//   return (
//     <div className="card space-y-6">
//       {/* Repository Header */}
//       <div className="border-b border-[var(--color-border)] pb-4">
//         <div className="flex items-center gap-3">
//           <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center font-bold text-lg text-[var(--color-fg)]">
//             {repoName[0]?.toUpperCase()}
//           </div>
//           <div>
//             <h3 className="text-xl font-bold text-[var(--color-fg)]">
//               {repoName}
//             </h3>
//             <div className="text-sm text-[var(--color-fg-secondary)] mt-1">
//               Analysis Failed
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Error Icon and Message */}
//       <div className="flex flex-col items-center justify-center py-12 text-center">
//         <div className="w-16 h-16 rounded-full bg-[var(--terminal-error)] bg-opacity-10 flex items-center justify-center mb-4">
//           <FiAlertCircle className="text-[var(--terminal-error)]" size={32} />
//         </div>
//         <h4 className="text-lg font-semibold text-[var(--color-fg)] mb-2">
//           Analysis Failed
//         </h4>
//         <p className="text-sm text-[var(--color-fg-secondary)] mb-4 max-w-sm">
//           {error}
//         </p>
//         <div className="text-xs text-[var(--color-fg-secondary)]">
//           Returning to default view in 5 seconds...
//         </div>
//       </div>

//       {/* Common Issues */}
//       <div className="border-t border-[var(--color-border)] pt-4">
//         <h5 className="font-medium text-[var(--color-fg)] mb-2">
//           Common Issues:
//         </h5>
//         <ul className="space-y-2 text-sm text-[var(--color-fg-secondary)]">
//           <li className="flex items-start gap-2">
//             <span className="text-[var(--terminal-error)] mt-0.5">•</span>
//             <span>Repository is empty or has no commits</span>
//           </li>
//           <li className="flex items-start gap-2">
//             <span className="text-[var(--terminal-error)] mt-0.5">•</span>
//             <span>Branch does not exist (check default branch)</span>
//           </li>
//           <li className="flex items-start gap-2">
//             <span className="text-[var(--terminal-error)] mt-0.5">•</span>
//             <span>Insufficient GitHub permissions</span>
//           </li>
//           <li className="flex items-start gap-2">
//             <span className="text-[var(--terminal-error)] mt-0.5">•</span>
//             <span>Server connectivity issues</span>
//           </li>
//         </ul>
//       </div>
//     </div>
//   );
// }

// /* Analysis Results Component */
// function AnalysisResults({
//   repo,
//   fileMetrics,
//   pushMetrics,
//   commits,
//   commitAnalysis,
// }: {
//   repo: any;
//   fileMetrics: any[];
//   pushMetrics: any[];
//   commits: any[];
//   commitAnalysis: any[];
// }) {
//   // Calculate metrics
//   const avgComplexity =
//     fileMetrics.length > 0
//       ? fileMetrics.reduce((sum, f) => sum + (f.cyclomaticComplexity || 0), 0) /
//         fileMetrics.length
//       : 0;

//   const avgMaintainability =
//     fileMetrics.length > 0
//       ? fileMetrics.reduce((sum, f) => sum + (f.maintainabilityIndex || 0), 0) /
//         fileMetrics.length
//       : 0;

//   const totalLOC = fileMetrics.reduce((sum, f) => sum + (f.locTotal || 0), 0);
//   const totalLogicalLOC = fileMetrics.reduce(
//     (sum, f) => sum + (f.locLogical || 0),
//     0
//   );

//   // Top contributors
//   const contributors = commits.reduce((acc, commit) => {
//     const name = String(commit.authorName ?? commit.author ?? "Unknown");
//     acc[name] = (acc[name] || 0) + 1;
//     return acc;
//   }, {} as Record<string, number>);

//   const topContributors = (Object.entries(contributors) as [string, number][])
//     .sort(([, a], [, b]) => b - a)
//     .slice(0, 5);

//   // High complexity files
//   const highComplexityFiles = fileMetrics
//     .filter((f) => (f.cyclomaticComplexity || 0) > 10)
//     .sort(
//       (a, b) => (b.cyclomaticComplexity || 0) - (a.cyclomaticComplexity || 0)
//     )
//     .slice(0, 5);

//   const repoName = repo.repoName ?? repo.name ?? "Repository";
//   const isPrivate = Boolean(
//     repo.isPrivate ?? repo.private ?? repo.visibility === "private"
//   );

//   return (
//     <div className="card space-y-6">
//       {/* Repository Header */}
//       <div className="border-b border-[var(--color-border)] pb-4">
//         <div className="flex items-center justify-between mb-3">
//           <div className="flex items-center gap-3">
//             <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center font-bold text-lg text-[var(--color-fg)]">
//               {repoName[0]?.toUpperCase()}
//             </div>
//             <div>
//               <h3 className="text-xl font-bold text-[var(--color-fg)]">
//                 {repoName}
//               </h3>
//               <div className="flex items-center gap-2 mt-1">
//                 {isPrivate ? (
//                   <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-fg-secondary)]">
//                     <FiLock size={10} />
//                     Private
//                   </span>
//                 ) : (
//                   <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-fg-secondary)]">
//                     <FiUnlock size={10} />
//                     Public
//                   </span>
//                 )}
//                 <span className="flex items-center gap-1 text-xs text-[var(--color-fg-secondary)]">
//                   <FiGitBranch size={10} />
//                   {repo.defaultBranch || "main"}
//                 </span>
//               </div>
//             </div>
//           </div>
//           <a
//             href={repo.repoUrl ?? repo.html_url ?? "#"}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="p-2 rounded bg-[var(--color-bg-secondary)] text-[var(--color-fg-secondary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-btn-fg)] transition"
//           >
//             <FiExternalLink size={18} />
//           </a>
//         </div>
//       </div>

//       {/* Key Metrics Grid */}
//       <div className="grid grid-cols-2 gap-4">
//         <MetricCard
//           icon={<FiCode />}
//           label="Total Files"
//           value={fileMetrics.length.toString()}
//           color="var(--color-primary)"
//         />
//         <MetricCard
//           icon={<FiActivity />}
//           label="Total Commits"
//           value={commits.length.toString()}
//           color="var(--terminal-success)"
//         />
//         <MetricCard
//           icon={<FiTrendingUp />}
//           label="Lines of Code"
//           value={totalLOC.toLocaleString()}
//           color="var(--terminal-warning)"
//         />
//         <MetricCard
//           icon={<FiUsers />}
//           label="Contributors"
//           value={topContributors.length.toString()}
//           color="var(--terminal-info)"
//         />
//       </div>

//       {/* Code Quality Section */}
//       <div className="space-y-3">
//         <h4 className="font-semibold text-[var(--color-fg)] flex items-center gap-2">
//           <FiAlertTriangle size={16} />
//           Code Quality Metrics
//         </h4>

//         <div className="space-y-3">
//           <div>
//             <div className="flex items-center justify-between mb-1">
//               <span className="text-sm text-[var(--color-fg-secondary)]">
//                 Avg. Cyclomatic Complexity
//               </span>
//               <span className="text-sm font-medium text-[var(--color-fg)]">
//                 {avgComplexity.toFixed(2)}
//               </span>
//             </div>
//             <div className="h-2 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
//               <div
//                 className="h-full rounded-full transition-all"
//                 style={{
//                   width: `${Math.min((avgComplexity / 20) * 100, 100)}%`,
//                   backgroundColor:
//                     avgComplexity > 15
//                       ? "var(--terminal-error)"
//                       : avgComplexity > 10
//                       ? "var(--terminal-warning)"
//                       : "var(--terminal-success)",
//                 }}
//               />
//             </div>
//           </div>

//           <div>
//             <div className="flex items-center justify-between mb-1">
//               <span className="text-sm text-[var(--color-fg-secondary)]">
//                 Maintainability Index
//               </span>
//               <span className="text-sm font-medium text-[var(--color-fg)]">
//                 {avgMaintainability.toFixed(1)}/100
//               </span>
//             </div>
//             <div className="h-2 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
//               <div
//                 className="h-full rounded-full transition-all"
//                 style={{
//                   width: `${avgMaintainability}%`,
//                   backgroundColor:
//                     avgMaintainability < 50
//                       ? "var(--terminal-error)"
//                       : avgMaintainability < 70
//                       ? "var(--terminal-warning)"
//                       : "var(--terminal-success)",
//                 }}
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* High Complexity Files */}
//       {highComplexityFiles.length > 0 && (
//         <div className="space-y-3">
//           <h4 className="font-semibold text-[var(--color-fg)]">
//             High Complexity Files
//           </h4>
//           <div className="space-y-2">
//             {highComplexityFiles.map((file, idx) => (
//               <div
//                 key={idx}
//                 className="flex items-center justify-between p-2 rounded bg-[var(--color-bg-secondary)] text-sm"
//               >
//                 <span className="text-[var(--color-fg)] truncate flex-1">
//                   {file.path.split("/").pop()}
//                 </span>
//                 <span
//                   className="font-medium px-2 py-0.5 rounded text-xs"
//                   style={{
//                     backgroundColor:
//                       (file.cyclomaticComplexity || 0) > 20
//                         ? "var(--terminal-error)"
//                         : "var(--terminal-warning)",
//                     color: "white",
//                   }}
//                 >
//                   {file.cyclomaticComplexity}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Top Contributors */}
//       {topContributors.length > 0 && (
//         <div className="space-y-3">
//           <h4 className="font-semibold text-[var(--color-fg)] flex items-center gap-2">
//             <FiUsers size={16} />
//             Top Contributors
//           </h4>
//           <div className="space-y-2">
//             {topContributors.map(([name, count], idx) => (
//               <div
//                 key={idx}
//                 className="flex items-center justify-between p-2 rounded bg-[var(--color-bg-secondary)]"
//               >
//                 <span className="text-sm text-[var(--color-fg)] truncate">
//                   {name}
//                 </span>
//                 <span className="text-sm font-medium text-[var(--color-primary)]">
//                   {String(count)} commits
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Summary Stats */}
//       <div className="border-t border-[var(--color-border)] pt-4">
//         <div className="grid grid-cols-2 gap-3 text-sm">
//           <div>
//             <div className="text-[var(--color-fg-secondary)]">Logical LOC</div>
//             <div className="font-medium text-[var(--color-fg)]">
//               {totalLogicalLOC.toLocaleString()}
//             </div>
//           </div>
//           <div>
//             <div className="text-[var(--color-fg-secondary)]">Push Events</div>
//             <div className="font-medium text-[var(--color-fg)]">
//               {pushMetrics.length}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* Metric Card Component */
// function MetricCard({
//   icon,
//   label,
//   value,
//   color,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value: string;
//   color: string;
// }) {
//   return (
//     <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
//       <div className="flex items-center gap-2 mb-2" style={{ color }}>
//         {icon}
//         <span className="text-xs text-[var(--color-fg-secondary)]">
//           {label}
//         </span>
//       </div>
//       <div className="text-2xl font-bold text-[var(--color-fg)]">{value}</div>
//     </div>
//   );
// }

// /* Loading Skeleton Component */
// function AnalysisLoadingSkeleton({ repo }: { repo: any }) {
//   const repoName = repo?.repoName ?? repo?.name ?? "Repository";

//   return (
//     <div className="card space-y-6">
//       {/* Repository Header Skeleton */}
//       <div className="border-b border-[var(--color-border)] pb-4">
//         <div className="flex items-center gap-3 mb-3">
//           <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-secondary)] animate-pulse" />
//           <div className="flex-1">
//             <div className="h-6 bg-[var(--color-bg-secondary)] rounded w-48 mb-2 animate-pulse" />
//             <div className="h-4 bg-[var(--color-bg-secondary)] rounded w-32 animate-pulse" />
//           </div>
//         </div>
//       </div>

//       {/* Metrics Grid Skeleton */}
//       <div className="grid grid-cols-2 gap-4">
//         {[...Array(4)].map((_, i) => (
//           <div
//             key={i}
//             className="p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
//           >
//             <div className="h-4 bg-[var(--color-bg-tertiary)] rounded w-20 mb-2 animate-pulse" />
//             <div className="h-8 bg-[var(--color-bg-tertiary)] rounded w-16 animate-pulse" />
//           </div>
//         ))}
//       </div>

//       {/* Section Skeletons */}
//       {[...Array(3)].map((_, i) => (
//         <div key={i} className="space-y-3">
//           <div className="h-5 bg-[var(--color-bg-secondary)] rounded w-40 animate-pulse" />
//           <div className="space-y-2">
//             {[...Array(3)].map((_, j) => (
//               <div
//                 key={j}
//                 className="h-10 bg-[var(--color-bg-secondary)] rounded animate-pulse"
//               />
//             ))}
//           </div>
//         </div>
//       ))}

//       <div className="text-center text-sm text-[var(--color-fg-secondary)] mt-8 flex items-center justify-center gap-2">
//         <FiLoader className="animate-spin" size={16} />
//         Analyzing {repoName}...
//       </div>
//     </div>
//   );
// }

// /* Default Analysis Info Component */
// function DefaultAnalysisInfo() {
//   return (
//     <div className="card">
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-xl font-semibold text-[var(--color-fg)]">
//           What We Analyze
//         </h2>
//       </div>

//       <div className="space-y-4">
//         <AnalysisFeatureTile
//           title="Code Quality"
//           description="Detect code smells, complexity issues, and maintainability problems across your entire codebase."
//         />
//         <AnalysisFeatureTile
//           title="Security Vulnerabilities"
//           description="Identify security risks, dependency vulnerabilities, and potential attack vectors."
//         />
//         <AnalysisFeatureTile
//           title="Performance Metrics"
//           description="Analyze performance bottlenecks, memory usage patterns, and optimization opportunities."
//         />
//         <AnalysisFeatureTile
//           title="AI-Powered Suggestions"
//           description="Get intelligent recommendations for code improvements and best practices."
//         />
//       </div>

//       <div className="mt-6 p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
//         <h3 className="font-medium text-[var(--color-fg)] mb-2">
//           Analysis Process
//         </h3>
//         <div className="space-y-2 text-sm text-[var(--color-fg-secondary)]">
//           <div className="flex items-center gap-2">
//             <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div>
//             Repository is queued for analysis
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-2 h-2 rounded-full bg-[var(--terminal-warning)]"></div>
//             AI processes code structure and patterns
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-2 h-2 rounded-full bg-[var(--terminal-success)]"></div>
//             Detailed report with recommendations
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* Analysis feature tile component */
// function AnalysisFeatureTile({
//   title,
//   description,
// }: {
//   title: string;
//   description: string;
// }) {
//   return (
//     <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-card)]">
//       <div className="flex items-start gap-3">
//         <div>
//           <h3 className="font-semibold text-[var(--color-fg)] mb-1">{title}</h3>
//           <p className="text-sm text-[var(--color-fg-secondary)]">
//             {description}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* Lightweight connect prompt */
// function ConnectGitHubPage() {
//   return (
//     <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
//       <div className="card w-full max-w-md text-center">
//         <FiGithub
//           size={48}
//           className="mx-auto mb-4 text-[var(--color-primary)]"
//         />
//         <h2 className="text-2xl font-bold mb-2 text-[var(--color-fg)]">
//           Connect your GitHub account
//         </h2>
//         <p className="text-[var(--color-fg-secondary)] mb-6">
//           To import repositories and enable CodeHealth analysis, connect your
//           GitHub account.
//         </p>
//         <button
//           className="btn w-full"
//           onClick={() =>
//             (window.location.href = process.env.NEXT_PUBLIC_GITHUB_AUTH_URL!)
//           }
//         >
//           Connect GitHub
//         </button>
//       </div>
//     </div>
//   );
// }





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
  FiFileText,
  FiActivity,
  FiTrendingUp,
  FiCode,
  FiAlertTriangle,
  FiSun,
  FiMoon,
  FiMonitor,
} from "react-icons/fi";
import { toast } from "sonner";

export default function GitHubImportPage() {
  const router = useRouter();

  // Theme hook
  const { theme, setLightTheme, setDarkTheme, setSystemTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // GitHub Store
  const {
    repositories,
    isLoading: githubLoading,
    error: githubError,
    fetchGitHubRepos,
    clearError: clearGithubError,
    selectRepository,
  } = useGitHubStore();

  // Analysis Store
  const {
    triggerAnalysis,
    fetchFullAnalysis,
    loading: analysisLoading,
    error: analysisError,
    clearError: clearAnalysisError,
    fullAnalysis,
  } = useAnalysisStore();

  // Local State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  const [showAnalysisResults, setShowAnalysisResults] = useState(false);

  // Fetch repositories on mount
  useEffect(() => {
    fetchGitHubRepos();
  }, [fetchGitHubRepos]);

  // Filter repositories based on search
  const filteredRepos = repositories.filter(
    (repo) =>
      repo.repoName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle repository selection
  const handleSelectRepo = (repo: any) => {
    setSelectedRepo(repo);
    selectRepository(repo);
    setShowAnalysisResults(false);
    clearAnalysisError();
  };

  // Handle start analysis
  const handleStartAnalysis = async () => {
    if (!selectedRepo) {
      toast.error("Please select a repository first");
      return;
    }

    try {
      await triggerAnalysis(String(selectedRepo.repoId));
      setShowAnalysisResults(true);
    } catch (error) {
      console.error("Failed to start analysis:", error);
    }
  };

  // Handle view existing results
  const handleViewResults = async () => {
    if (!selectedRepo) {
      toast.error("Please select a repository first");
      return;
    }

    try {
      await fetchFullAnalysis(String(selectedRepo.repoId));
      setShowAnalysisResults(true);
    } catch (error) {
      console.error("Failed to fetch results:", error);
      setShowAnalysisResults(false);
    }
  };

  // Handle navigate to detailed report
  const handleViewDetailedReport = () => {
    if (!selectedRepo) {
      toast.error("Please select a repository first");
      return;
    }

    router.push(`/report/${selectedRepo.repoId}`);
  };

  // Check if we have analysis data to display
  const hasAnalysisData = showAnalysisResults && fullAnalysis && selectedRepo;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-10 px-4 sm:px-6 lg:px-8">
      {/* Custom Theme Toggle - Fixed Position */}
      <div className="fixed top-6 right-6 z-50">
        {mounted && (
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] shadow-lg backdrop-blur-sm">
            {/* System Theme Button */}
            <button
              onClick={setSystemTheme}
              className={`relative p-2.5 rounded-lg transition-all duration-200 ${
                theme === "system"
                  ? "bg-[var(--color-primary)] text-[var(--color-btn-fg)] shadow-md"
                  : "text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-secondary)]"
              }`}
              title="System theme"
            >
              <FiMonitor size={18} />
              {theme === "system" && (
                <div className="absolute inset-0 rounded-lg border-2 border-[var(--color-primary)] pointer-events-none" />
              )}
            </button>

            {/* Light Theme Button */}
            <button
              onClick={setLightTheme}
              className={`relative p-2.5 rounded-lg transition-all duration-200 ${
                theme === "light"
                  ? "bg-[var(--color-primary)] text-[var(--color-btn-fg)] shadow-md"
                  : "text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-secondary)]"
              }`}
              title="Light theme"
            >
              <FiSun size={18} />
              {theme === "light" && (
                <div className="absolute inset-0 rounded-lg border-2 border-[var(--color-primary)] pointer-events-none" />
              )}
            </button>

            {/* Dark Theme Button */}
            <button
              onClick={setDarkTheme}
              className={`relative p-2.5 rounded-lg transition-all duration-200 ${
                theme === "dark"
                  ? "bg-[var(--color-primary)] text-[var(--color-btn-fg)] shadow-md"
                  : "text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-secondary)]"
              }`}
              title="Dark theme"
            >
              <FiMoon size={18} />
              {theme === "dark" && (
                <div className="absolute inset-0 rounded-lg border-2 border-[var(--color-primary)] pointer-events-none" />
              )}
            </button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-fg)] mb-2">
            GitHub Repository Analysis
          </h1>
          <p className="text-[var(--color-fg-secondary)]">
            Select a repository to analyze code health metrics with AI-powered
            insights
          </p>
        </header>

        {/* Error Display */}
        {(githubError || analysisError) && (
          <div className="card mb-6 border-l-4 border-l-red-500 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiAlertCircle
                  className="text-red-600 dark:text-red-400"
                  size={20}
                />
                <span className="text-[var(--color-fg)]">
                  {githubError || analysisError}
                </span>
              </div>
              <button
                onClick={() => {
                  clearGithubError();
                  clearAnalysisError();
                }}
                className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Repository List */}
          <div className="lg:col-span-1">
            <div className="card apple-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[var(--color-fg)] flex items-center gap-2">
                  <FiGithub size={20} />
                  Repositories
                </h2>
                <button
                  onClick={fetchGitHubRepos}
                  disabled={githubLoading}
                  className="glassmorphism-button p-2 rounded-lg transition-all disabled:opacity-50"
                  title="Refresh repositories"
                >
                  <FiRefreshCw
                    size={18}
                    className={githubLoading ? "animate-spin" : ""}
                  />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-secondary)]"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search repositories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2"
                />
              </div>

              {/* Repository List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                {githubLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <FiLoader
                      className="animate-spin text-[var(--color-primary)]"
                      size={32}
                    />
                  </div>
                ) : filteredRepos.length === 0 ? (
                  <div className="text-center py-12">
                    <FiGithub size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-[var(--color-fg-secondary)]">
                      No repositories found
                    </p>
                  </div>
                ) : (
                  filteredRepos.map((repo) => (
                    <button
                      key={repo.repoId}
                      onClick={() => handleSelectRepo(repo)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        selectedRepo?.repoId === repo.repoId
                          ? "btn-secondary apple-button glassmorphism-button flex-1 min-w-[200px] flex items-center justify-center gap-2 !border-gray-300"
                          : "btn-secondary apple-button glassmorphism-button flex-1 min-w-[200px] flex items-center justify-center gap-2"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate mb-1">
                            {repo.repoName}
                          </div>
                          <div className="flex items-center gap-2 text-xs opacity-75">
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
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Analysis Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Repository Info OR Select Repository Prompt */}
            {!selectedRepo ? (
              <div className="card apple-card py-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[var(--color-bg-secondary)] flex items-center justify-center">
                    <FiGithub
                      size={32}
                      className="text-[var(--color-fg-secondary)] opacity-50"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-fg)] mb-2">
                    Select a Repository
                  </h3>
                  <p className="text-sm text-[var(--color-fg-secondary)]">
                    Choose a repository from the list to check its code health
                    analysis
                  </p>
                </div>
              </div>
            ) : (
              <div className="card apple-card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[var(--color-bg-secondary)] flex items-center justify-center font-bold text-xl text-[var(--color-fg)] neon-glow-subtle">
                      {selectedRepo.repoName[0]?.toUpperCase() || "R"}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[var(--color-fg)]">
                        {selectedRepo.repoName}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-[var(--color-fg-secondary)] mt-1">
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
                    className="glassmorphism-button p-3 rounded-lg transition-all"
                  >
                    <FiExternalLink size={18} />
                  </a>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={handleStartAnalysis}
                    disabled={analysisLoading}
                    className="btn apple-button glassmorphism-button-primary flex-1 min-w-[200px] flex items-center justify-center gap-2"
                  >
                    {analysisLoading ? (
                      <>
                        <FiLoader className="animate-spin" size={18} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <FiActivity size={18} />
                        Start New Analysis
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleViewResults}
                    disabled={analysisLoading}
                    className="btn-secondary apple-button glassmorphism-button flex-1 min-w-[200px] flex items-center justify-center gap-2"
                  >
                    <FiFileText size={18} />
                    View Existing Results
                  </button>

                  {showAnalysisResults && fullAnalysis && (
                    <button
                      onClick={handleViewDetailedReport}
                      className="btn apple-button glassmorphism-button-primary flex items-center justify-center gap-2 px-6"
                      title="View Detailed Report"
                    >
                      <FiFileText size={18} />
                      Detailed Report
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* About Code Health Analysis - Only show when NO analysis results */}
            {!hasAnalysisData && <DefaultAnalysisInfo />}

            {/* Analysis Results - Only when available */}
            {hasAnalysisData && (
              <AnalysisResults repo={selectedRepo} analysis={fullAnalysis} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Analysis Results Component */
function AnalysisResults({ repo, analysis }: { repo: any; analysis: any }) {
  // Safely extract data with fallbacks
  const result = analysis?.result || {};
  const commitAnalysis = analysis?.commitAnalysis || {};
  const repoHealthScore = analysis?.repoHealthScore || {};

  // Safe metric extraction with defaults
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
    <div className="card apple-card space-y-6 animate-fadeIn">
      {/* Repository Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <h3 className="text-2xl font-bold text-[var(--color-fg)] mb-2">
          Analysis Results
        </h3>
        <div className="flex items-center gap-4 text-sm text-[var(--color-fg-secondary)]">
          <span className="flex items-center gap-1">
            <FiCode />
            {totalFiles} files
          </span>
          <span className="flex items-center gap-1">
            <FiActivity />
            {totalLOC.toLocaleString()} LOC
          </span>
          <span className="flex items-center gap-1 font-medium text-[var(--color-primary)]">
            Health: {overallHealth.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          icon={<FiCode />}
          label="Avg Complexity"
          value={avgComplexity.toFixed(1)}
          color="var(--color-primary)"
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
        <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
          <h4 className="font-semibold text-[var(--color-fg)] mb-4">
            Health Score Breakdown
          </h4>
          <div className="space-y-3">
            {Object.entries(componentScores).map(
              ([key, value]: [string, any]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--color-fg-secondary)] capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="text-sm font-medium text-[var(--color-fg)]">
                      {(value || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${value || 0}%`,
                        background: `linear-gradient(90deg, var(--color-primary), var(--color-accent))`,
                      }}
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
          <h4 className="font-semibold text-[var(--color-fg)] mb-3 flex items-center gap-2">
            <FiAlertTriangle className="text-[var(--terminal-warning)]" />
            High Priority Files ({refactorFiles.length})
          </h4>
          <div className="space-y-2">
            {refactorFiles.slice(0, 5).map((file: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
              >
                <span className="text-sm font-mono truncate flex-1 text-[var(--color-fg)]">
                  {file.path || "Unknown file"}
                </span>
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-[var(--terminal-warning)] text-white rounded">
                  Risk: {(file.riskScore || 0).toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Commit Analysis Info */}
      {totalCommits > 0 && (
        <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
          <h4 className="font-semibold text-[var(--color-fg)] mb-3">
            Commit Activity
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[var(--color-fg-secondary)]">
                Total Commits
              </div>
              <div className="font-medium text-[var(--color-fg)] text-lg">
                {totalCommits}
              </div>
            </div>
            {commitAnalysis.daysActive && (
              <div>
                <div className="text-[var(--color-fg-secondary)]">
                  Days Active
                </div>
                <div className="font-medium text-[var(--color-fg)] text-lg">
                  {commitAnalysis.daysActive}
                </div>
              </div>
            )}
            {commitAnalysis.contributorCount && (
              <div>
                <div className="text-[var(--color-fg-secondary)]">
                  Contributors
                </div>
                <div className="font-medium text-[var(--color-fg)] text-lg">
                  {commitAnalysis.contributorCount}
                </div>
              </div>
            )}
            {commitAnalysis.busFactor && (
              <div>
                <div className="text-[var(--color-fg-secondary)]">
                  Bus Factor
                </div>
                <div className="font-medium text-[var(--color-fg)] text-lg capitalize">
                  {commitAnalysis.busFactor}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Data Message */}
      {totalFiles === 0 && totalCommits === 0 && (
        <div className="text-center py-12">
          <FiAlertCircle
            className="mx-auto mb-4 text-[var(--color-fg-secondary)] opacity-50"
            size={48}
          />
          <p className="text-[var(--color-fg)] font-medium mb-1">
            No analysis data available
          </p>
          <p className="text-sm text-[var(--color-fg-secondary)]">
            The analysis may still be processing or encountered an error.
          </p>
        </div>
      )}
    </div>
  );
}

/* Metric Card Component */
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
    <div className="p-4 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-2 mb-2" style={{ color }}>
        {icon}
        <span className="text-xs text-[var(--color-fg-secondary)]">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold text-[var(--color-fg)]">{value}</div>
    </div>
  );
}

/* Default Analysis Info Component - Always Visible */
function DefaultAnalysisInfo() {
  return (
    <div className="card apple-card animate-fadeIn">
      <h3 className="text-xl font-bold text-[var(--color-fg)] mb-4 flex items-center gap-2">
        About Code Health Analysis
      </h3>
      <div className="space-y-4 text-[var(--color-fg-secondary)]">
        <p className="leading-relaxed">
          Our AI-powered analysis provides comprehensive insights into your
          repository's code quality, maintainability, and health metrics.
        </p>

        <div className="space-y-3">
          <h4 className="font-semibold text-[var(--color-fg)] text-sm">
            What We Analyze:
          </h4>
          <ul className="space-y-3">
            {[
              {
                title: "Code Quality & Complexity",
                desc: "Measure cyclomatic complexity and code structure",
              },
              {
                title: "Maintainability Index",
                desc: "Assess how easy it is to maintain your codebase",
              },
              {
                title: "Technical Debt",
                desc: "Identify areas that need refactoring",
              },
              {
                title: "Commit Patterns",
                desc: "Analyze development activity and velocity",
              },
              {
                title: "Health Score",
                desc: "Get an overall repository health rating",
              },
              {
                title: "Priority Recommendations",
                desc: "AI-powered suggestions for improvements",
              },
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="font-medium text-[var(--color-fg)] text-sm">
                    {item.title}
                  </div>
                  <div className="text-xs text-[var(--color-fg-secondary)] mt-0.5">
                    {item.desc}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-opacity-10 border border-[var(--color-border)]">
          <div className="flex items-start gap-3">
            <div>
              <p className="text-sm font-medium text-[var(--color-fg)] mb-1">
                <strong>Pro Tip:</strong> Best Practices
              </p>
              <p className="text-xs text-[var(--color-fg-secondary)]">
                Regular analysis helps maintain code quality. Run analysis after
                major changes or weekly to track improvements and identify
                technical debt early.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--color-border)]">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
              <div className="text-2xl font-bold text-[var(--color-primary)]">
                10+
              </div>
              <div className="text-xs text-[var(--color-fg-secondary)] mt-1">
                Metrics Tracked
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
              <div className="text-2xl font-bold text-[var(--color-primary)]">
                AI
              </div>
              <div className="text-xs text-[var(--color-fg-secondary)] mt-1">
                Powered Analysis
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
              <div className="text-2xl font-bold text-[var(--color-primary)]">
                Real-time
              </div>
              <div className="text-xs text-[var(--color-fg-secondary)] mt-1">
                Insights
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Custom Scrollbar Styles */
const styles = `
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}