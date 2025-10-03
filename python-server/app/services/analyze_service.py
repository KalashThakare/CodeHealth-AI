from app.schemas.push_analyze import PushAnalyzeRequest, PushAnalyzeResponse
from app.schemas.pull_analyze import PullAnalyzeRequest, PullAnalyzeResponse
from app.services.impact_analyzer import seed_impact
from app.services.prioritization import seed_prioritization
from app.schemas.fullrepo_analyze import FullRepoAnalysisRequest, FullRepoAnalysisResponse, StaticAnalysisResponse, Halstead, Cyclomatic, Maintainability
from app.services.github_api import fetch_repo_code
from app.services.github_auth import get_installation_token
import asyncio
import aiohttp

from radon.complexity import cc_visit, cc_rank
from radon.metrics import mi_visit, h_visit
from radon.raw import analyze


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

def analyze_code(path: str, content: str) -> StaticAnalysisResponse:
    raw = analyze(content)

    # --- Cyclomatic complexity
    cc_results = cc_visit(content)
    cyclo = [
        Cyclomatic(
            name=block.name,
            complexity=block.complexity,
            rank=cc_rank(block.complexity)
        )
        for block in cc_results
    ]

    # --- Halstead metrics
    hal = h_visit(content)
    
    # Check if hal is not empty and has the total attribute
    if hal and hasattr(hal, 'total'):
        hal_metrics = hal.total
        halstead = Halstead(
            h1=hal_metrics.h1,
            h2=hal_metrics.h2,
            N1=hal_metrics.N1,
            N2=hal_metrics.N2,
            vocabulary=hal_metrics.vocabulary,
            length=hal_metrics.length,
            volume=hal_metrics.volume,
            difficulty=hal_metrics.difficulty,
            effort=hal_metrics.effort,
            time=hal_metrics.time,
            bugs=hal_metrics.bugs
        )
    else:
        # Provide default values if Halstead analysis fails
        halstead = Halstead(
            h1=0, h2=0, N1=0, N2=0,
            vocabulary=0, length=0, volume=0,
            difficulty=0, effort=0, time=0, bugs=0
        )

    # --- Maintainability index
    mi_score = mi_visit(content, True)  # returns numeric score
    mi_rank = "A" if mi_score >= 20 else "B" if mi_score >= 10 else "C"

    maintainability = Maintainability(mi=mi_score, rank=mi_rank)

    return StaticAnalysisResponse(
        path=path,
        loc=raw.loc,
        lloc=raw.lloc,
        sloc=raw.sloc,
        comments=raw.comments,
        multi=raw.multi,
        blank=raw.blank,
        cyclomatic=cyclo,
        halstead=halstead,
        maintainability=maintainability,
    )


async def full_repo_analysis(payload: FullRepoAnalysisRequest) -> FullRepoAnalysisResponse:
    token = await get_installation_token(payload.installationId)
    repofiles = await fetch_repo_code(payload.owner, payload.repoName, payload.branch, token)
    analysis = []
    batchSize = 100

    async with aiohttp.ClientSession() as session:
        for i in range(0, len(repofiles), batchSize):
            chunk = repofiles[i:i+batchSize]

            for repofile in chunk:
                path = repofile["path"]
                content = repofile["content"]
                
                if path.endswith(".py"):
                    try:
                        analysis_result = analyze_code(path, content)
                        analysis.append(analysis_result)
                        
                        # Convert Pydantic models to dicts for JSON serialization
                        serialized_analysis = [
                            a.model_dump() if hasattr(a, 'model_dump') else a.dict()
                            for a in analysis
                        ]
                        
                        async with session.post(
                            "http://localhost:8080/analyze/python-batch",
                            json={"Metrics": serialized_analysis, "repoId": payload.repoId, "branch":payload.branch}
                        ) as resp:
                            result = await resp.json()
                            print(result)

                        print("analysis is", len(analysis), "files")
                    except Exception as e:
                        print(f"Error analyzing {path}: {str(e)}")
                        continue
            
            non_py_files = [f for f in chunk if not f["path"].endswith(".py")]
            if non_py_files:
                async with session.post(
                    "http://localhost:8080/analyze/enqueue-batch",
                    json={"files": non_py_files, "repoId": payload.repoId, "branch":payload.branch}
                ) as resp:
                    result = await resp.json()
                    print(f"Batch {i//batchSize + 1}: {result}")

    print("Successfully printed files", repofiles)