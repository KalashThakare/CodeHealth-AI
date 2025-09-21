from app.schemas.push_analyze import PushAnalyzeRequest, PushAnalyzeResponse
from app.schemas.pull_analyze import PullAnalyzeRequest, PullAnalyzeResponse

def push_analyze_repo(payload: PushAnalyzeRequest) -> PushAnalyzeResponse:
    print(".")
    print(".")
    print(".")
    print("Process reached analyze_service.py")
    print(".")
    print(".")
    print(".")
    score = min(1.0, max(0.0, len(payload.repo) / 100.0))
    return PushAnalyzeResponse(
        ok=True,
        score=score,
        message=f"Analyzed {payload.repo} on {payload.branch}",
    )


def pull_analyze_repo(payload: PullAnalyzeRequest) -> PullAnalyzeResponse:
    return PullAnalyzeResponse(
        ok=True,
        message=f"Analyzed {payload.repo} on {payload.branch}",
    )