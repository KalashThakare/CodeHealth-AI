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

    print(message, impact, prio)
    return PushAnalyzeResponse(ok=ok, score=score, message=message)


def pull_analyze_repo(payload: PullAnalyzeRequest) -> PullAnalyzeResponse:
    return PullAnalyzeResponse(
        ok=True,
        message=f"Analyzed {payload.repo} on {payload.branch}",
    )

def analyze_code(path: str, content: str)-> StaticAnalysisResponse:
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

    halstead = Halstead(
        h1=hal.h1,
        h2=hal.h2,
        N1=hal.N1,
        N2=hal.N2,
        vocabulary=hal.vocabulary,
        length=hal.length,
        volume=hal.volume,
        difficulty=hal.difficulty,
        effort=hal.effort,
        time=hal.time,
        bugs=hal.bugs
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

async def full_repo_analysis(paylod:FullRepoAnalysisRequest)-> FullRepoAnalysisResponse:
    token = await get_installation_token(paylod.installationId)
    repofiles = await fetch_repo_code(paylod.owner, paylod.repoName, paylod.branch, token )
    analysis = []
    batchSize = 100

    async with aiohttp.ClientSession() as session:
        for i in range(0, len(repofiles), batchSize):
            chunk = repofiles[i:i+batchSize]

            for repofile in chunk:
                path = repofile["path"]
                content = repofile["content"]
                
                if path.endswith(".py"):
                    analysis.append(analyze_code(path, content))
                    print("analysis is ", analysis)
            
            non_py_files = [f for f in chunk if not f["path"].endswith(".py")]
            if non_py_files:
                async with session.post(
                    "http://localhost:8080/analyze/enqueue-batch",
                    json={"files": non_py_files,"repoId":paylod.repoId}
                ) as resp:
                    result = await resp.json()
                    print(f"Batch {i//batchSize + 1}: {result}")

    print("Successfully printed files", repofiles)