from app.schemas.push_analyze import PushAnalyzeRequest, PushAnalyzeResponse
from app.schemas.pull_analyze import PullAnalyzeRequest, PullAnalyzeResponse
from app.services.impact_analyzer import seed_impact
from app.services.prioritization import seed_prioritization
from app.schemas.fullrepo_analyze import FullRepoAnalysisRequest, FullRepoAnalysisResponse, StaticAnalysisResponse, Halstead, Cyclomatic, Maintainability
from app.services.github_api import fetch_repo_code, get_all_commits, get_all_contributors, get_all_issues, get_all_pr, get_all_releases, get_repo_metadata
from app.services.github_auth import get_installation_token
import asyncio
import aiohttp
from app.services.analysis import analysisClass


async def push_analyze_repo(req: PushAnalyzeRequest) -> PushAnalyzeResponse:
    impact = await seed_impact(req)
    prio = await seed_prioritization(req, impact)

    score = float(impact["score"])
    ok = score < req.threshold  
    message = f"Analyzed {req.repo} on {req.branch}. Impact={score:.2f}, threshold={req.threshold:.2f}."

    async with aiohttp.ClientSession() as session:
        async with session.post(
            "http://localhost:8080/analyze/pushMetric",
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


def pull_analyze_repo(payload: PullAnalyzeRequest) -> PullAnalyzeResponse:
    return PullAnalyzeResponse(
        ok=True,
        message=f"Analyzed {payload.repo} on {payload.branch}",
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
                "http://localhost:8080/analyze/Commits",
                {"commits": commits, "repoId": payload.repoId, "branch": payload.branch},
                "Commits"
            ),
            send_metadata(
                "http://localhost:8080/analyze/commits-analysis",
                {"commits_analysis": commits_analysis, "repoId": payload.repoId, "branch": payload.branch},
                "Commits Analysis"
            ),
            send_metadata(
                "http://localhost:8080/analyze/repo-metadata",
                {"metadata": metadata, "repoId": payload.repoId, "branch": payload.branch},
                "Metadata"
            ),
            send_metadata(
                "http://localhost:8080/analyze/contributors",
                {"contributors": contributors, "repoId": payload.repoId, "branch": payload.branch},
                "Contributors"
            ),
            # send_metadata(
            #     "http://localhost:8080/analyze/issues",
            #     {"issues": issues, "repoId": payload.repoId, "branch": payload.branch},
            #     "Issues"
            # ),
            # send_metadata(
            #     "http://localhost:8080/analyze/pull-requests",
            #     {"pullRequests": pr, "repoId": payload.repoId, "branch": payload.branch},
            #     "Pull Requests"
            # ),
            # send_metadata(
            #     "http://localhost:8080/analyze/releases",
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
                        "http://localhost:8080/analyze/python-batch",
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
                        "http://localhost:8080/analyze/enqueue-batch",
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