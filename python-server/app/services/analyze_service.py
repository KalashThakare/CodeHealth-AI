from app.schemas.push_analyze import PushAnalyzeRequest, PushAnalyzeResponse
from app.schemas.pull_analyze import PullAnalyzeRequest, PullAnalyzeResponse
from app.services.impact_analyzer import seed_impact
from app.services.prioritization import seed_prioritization



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