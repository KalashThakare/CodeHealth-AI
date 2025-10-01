from app.schemas.push_analyze import PushAnalyzeRequest, PushAnalyzeResponse
from app.schemas.pull_analyze import PullAnalyzeRequest, PullAnalyzeResponse
from app.services.impact_analyzer import seed_impact
from app.services.prioritization import seed_prioritization
from app.schemas.fullrepo_analyze import FullRepoAnalysisRequest, FullRepoAnalysisResponse
from app.services.github_api import fetch_repo_code
from app.services.github_auth import get_installation_token


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

async def full_repo_analysis(paylod:FullRepoAnalysisRequest)-> FullRepoAnalysisResponse:
    token = await get_installation_token(paylod.installationId)
    repofiles = await fetch_repo_code(paylod.owner, paylod.repoName, paylod.branch, token )

    print("Successfully printed files", repofiles)