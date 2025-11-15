from app.schemas.push_analyze import PushAnalyzeRequest, PushAnalyzeResponse
from app.schemas.pull_analyze import AnalysisMetrics, Annotation, PullAnalyzeRequest, PullAnalyzeResponse, Suggestion
from app.services.impact_analyzer import seed_impact
from app.services.prioritization import seed_prioritization
from app.schemas.fullrepo_analyze import FullRepoAnalysisRequest, FullRepoAnalysisResponse, StaticAnalysisResponse, Halstead, Cyclomatic, Maintainability
from app.services.github_api import fetch_repo_code, get_all_commits, get_all_contributors, get_all_issues, get_all_pr, get_all_releases, get_repo_metadata, fetch_pr_files
from app.services.github_auth import get_installation_token
from app.services.pull_analysis_service import analyze_pr_opened
import asyncio
import aiohttp
from app.services.scanning import analysisClass
import logging
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)


async def push_analyze_repo(req: PushAnalyzeRequest) -> PushAnalyzeResponse:
    impact = await seed_impact(req)
    prio = await seed_prioritization(req, impact)

    score = float(impact["score"])
    ok = score < req.threshold  
    message = f"Analyzed {req.repo} on {req.branch}. Impact={score:.2f}, threshold={req.threshold:.2f}."

    async with aiohttp.ClientSession() as session:
        async with session.post(
            "http://localhost:8080/scanning/pushMetric",
            json={
                "message":message, 
                "impact":impact,
                "prio":prio,
                "repoId":req.repoId
            }
        )as resp:
            result = await resp.json()
            print(result)
    

    print(message, impact, prio)
    return PushAnalyzeResponse(ok=ok, score=score, message=message)


async def pull_analyze_repo(payload: PullAnalyzeRequest) -> PullAnalyzeResponse:
    """
    Main function to analyze a pull request
    """
    token = await get_installation_token(payload.installationId)
    repoFullName = payload.repoFullName
    owner, repo = repoFullName.split("/")
    
    logger.info(f"Analyzing PR #{payload.prNumber} in {owner}/{repo}")
    logger.info(f"Action: {payload.action}")
    
    run_id = str(uuid.uuid4())
  
    pr_files = await fetch_pr_files(
        token=token,
        owner=owner,
        repo=repo,
        pull_number=payload.prNumber
    )
    
    if not pr_files:
        logger.warning(f"No files found for PR #{payload.prNumber}")
        return PullAnalyzeResponse(
            ok=True,
            repo=repoFullName,
            prNumber=payload.prNumber,
            headSha=payload.head.sha,
            baseRef=payload.base.ref,
            summary="No files changed in this PR",
            runId=run_id,
            analyzedAt=datetime.utcnow().isoformat(),
        )
    
    # Analyze the PR
    analysis = await analyze_pr_opened(pr_files)
    
    # Convert analysis to annotations
    annotations = []
    
    # Add security warnings as annotations
    for warning in analysis.get("securityWarnings", []):
        annotations.append(Annotation(
            message=warning,
            severity="warning"
        ))
    
    # Add missing tests annotation
    if analysis.get("missingTests"):
        annotations.append(Annotation(
            message="⚠️ No test files detected. Please add tests for the code changes.",
            severity="warning"
        ))
    
    # Add missing docs annotation
    if analysis.get("missingDocs"):
        annotations.append(Annotation(
            message="📝 Documentation updates recommended for this PR size.",
            severity="info"
        ))
    
    # Add high risk annotation
    if analysis["riskScore"] > 70:
        annotations.append(Annotation(
            message=f"🔴 High risk PR (score: {analysis['riskScore']}/100). Extra scrutiny recommended.",
            severity="error"
        ))
    elif analysis["riskScore"] > 50:
        annotations.append(Annotation(
            message=f"🟡 Medium-high risk PR (score: {analysis['riskScore']}/100). Additional review recommended.",
            severity="warning"
        ))
    
    # Convert suggestions
    suggestions_list = []
    for suggestion_text in analysis.get("suggestions", []):
        suggestions_list.append(Suggestion(
            title="Recommendation",
            message=suggestion_text
        ))
    
    # Create metrics object
    metrics = AnalysisMetrics(
        riskScore=analysis["riskScore"],
        complexityScore=analysis["complexityScore"],
        criticality=analysis["criticality"],
        filesChanged=analysis["filesChanged"],
        filesAdded=analysis["filesAdded"],
        filesModified=analysis["filesModified"],
        filesRemoved=analysis["filesRemoved"],
        filesRenamed=analysis["filesRenamed"],
        linesAdded=analysis["linesAdded"],
        linesDeleted=analysis["linesDeleted"],
        impactAreas=analysis["impactAreas"],
        fileExtensions=analysis["fileExtensions"],
        missingTests=analysis["missingTests"],
        missingDocs=analysis["missingDocs"],
    )
    
    # Create summary
    summary = (
        f"📊 PR Analysis for #{payload.prNumber}\n"
        f"Risk: {analysis['criticality'].upper()} ({analysis['riskScore']:.1f}/100) | "
        f"Complexity: {analysis['complexityScore']:.1f}/100\n"
        f"📁 {analysis['filesChanged']} files changed "
        f"(+{analysis['filesAdded']} new, ~{analysis['filesModified']} modified, "
        f"-{analysis['filesRemoved']} removed)\n"
        f"📝 +{analysis['linesAdded']} / -{analysis['linesDeleted']} lines\n"
        f"🎯 Impact areas: {', '.join(analysis['impactAreas'][:5]) if analysis['impactAreas'] else 'N/A'}"
    )
    
    # Calculate overall quality score (inverse of risk, 0-1)
    quality_score = max(0.0, min(1.0, 1.0 - (analysis["riskScore"] / 100)))

    print(summary)
    
    return PullAnalyzeResponse(
        ok=True,
        repo=repoFullName,
        prNumber=payload.prNumber,
        headSha=payload.head.sha,
        baseRef=payload.base.ref,
        score=round(quality_score, 2),
        summary=summary,
        metrics=metrics,
        annotations=annotations if annotations else None,
        suggestions=suggestions_list if suggestions_list else None,
        securityWarnings=analysis.get("securityWarnings") if analysis.get("securityWarnings") else None,
        recommendedReviewers=analysis.get("recommendedReviewers") if analysis.get("recommendedReviewers") else None,
        runId=run_id,
        analyzedAt=datetime.utcnow().isoformat(),
    )


async def full_repo_analysis(payload: FullRepoAnalysisRequest) -> FullRepoAnalysisResponse:
    token = await get_installation_token(payload.installationId)
    repofiles = await fetch_repo_code(payload.owner, payload.repoName, payload.branch, token)
    analysis = []
    batchSize = 50

    # Fetch all repository data
    contributors = await get_all_contributors(payload.owner, payload.repoName, token)
    issues = await get_all_issues(payload.owner, payload.repoName, token)
    pr = await get_all_pr(payload.owner, payload.repoName, token)
    commits = await get_all_commits(payload.owner, payload.repoName, token)
    releases = await get_all_releases(payload.owner, payload.repoName, token)
    metadata = await get_repo_metadata(payload.owner, payload.repoName, token)

    # Analyze commits
    commits_analysis = await analysisClass.analyze_commits(commits)
    print("Commits Analysis:", commits_analysis)

    # Use a single session for all HTTP requests
    async with aiohttp.ClientSession() as session:
        # Send metadata to Express server concurrently
        async def send_metadata(url: str, data: dict, name: str):
            try:
                async with session.post(url, json=data) as resp:
                    result = await resp.json()
                    print(f"{name} sent: {result}")
                    return result
            except Exception as e:
                print(f"Error sending {name}: {str(e)}")
                return {"error": str(e)}

        # Create tasks for parallel execution
        metadata_tasks = [
            send_metadata(
                "http://localhost:8080/scanning/Commits",
                {"commits": commits, "repoId": payload.repoId, "branch": payload.branch},
                "Commits"
            ),
            send_metadata(
                "http://localhost:8080/scanning/commits-analysis",
                {"commits_analysis": commits_analysis, "repoId": payload.repoId, "branch": payload.branch},
                "Commits Analysis"
            ),
            send_metadata(
                "http://localhost:8080/scanning/repo-metadata",
                {"metadata": metadata, "repoId": payload.repoId, "branch": payload.branch},
                "Metadata"
            ),
            send_metadata(
                "http://localhost:8080/scanning/contributors",
                {"contributors": contributors, "repoId": payload.repoId, "branch": payload.branch},
                "Contributors"
            ),
            # send_metadata(
            #     "http://localhost:8080/scanning/issues",
            #     {"issues": issues, "repoId": payload.repoId, "branch": payload.branch},
            #     "Issues"
            # ),
            # send_metadata(
            #     "http://localhost:8080/scanning/pull-requests",
            #     {"pullRequests": pr, "repoId": payload.repoId, "branch": payload.branch},
            #     "Pull Requests"
            # ),
            # send_metadata(
            #     "http://localhost:8080/scanning/releases",
            #     {"releases": releases, "repoId": payload.repoId, "branch": payload.branch},
            #     "Releases"
            # ),
        ]

        # Wait for all metadata to be sent
        await asyncio.gather(*metadata_tasks, return_exceptions=True)

        # Process repository files in batches
        for i in range(0, len(repofiles), batchSize):
            chunk = repofiles[i:i+batchSize]
            batch_num = i // batchSize + 1

            # Process Python files
            py_files = [f for f in chunk if f["path"].endswith(".py")]
            for repofile in py_files:
                path = repofile["path"]
                content = repofile["content"]
                
                try:
                    analysis_result = await analysisClass.analyze_py_code(path, content)
                    analysis.append(analysis_result)
                    
                    # Convert Pydantic models to dicts for JSON serialization
                    serialized_analysis = [
                        a.model_dump() if hasattr(a, 'model_dump') else a.dict()
                        for a in analysis
                    ]
                    
                    async with session.post(
                        "http://localhost:8080/scanning/python-batch",
                        json={"Metrics": serialized_analysis, "repoId": payload.repoId, "branch": payload.branch}
                    ) as resp:
                        result = await resp.json()
                        print(f"Python batch result: {result}")

                    print(f"Analyzed {len(analysis)} Python files")
                except Exception as e:
                    print(f"Error analyzing {path}: {str(e)}")
                    continue
            
            # Process non-Python files
            non_py_files = [f for f in chunk if not f["path"].endswith(".py")]
            if non_py_files:
                try:
                    async with session.post(
                        "http://localhost:8080/scanning/enqueue-batch",
                        json={"files": non_py_files, "repoId": payload.repoId, "branch": payload.branch}
                    ) as resp:
                        result = await resp.json()
                        print(f"Batch {batch_num} (non-Python): {result}")
                except Exception as e:
                    print(f"Error processing batch {batch_num} non-Python files: {str(e)}")

    print(f"Successfully processed {len(repofiles)} files")
    
    return FullRepoAnalysisResponse(
        ok=True,
        fileCount=len(repofiles),
        score=0,  
        message="Repository analysis completed",
        files=repofiles
    )