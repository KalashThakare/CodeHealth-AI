from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse

def analyze_repo(payload: AnalyzeRequest) -> AnalyzeResponse:
    score = min(1.0, max(0.0, len(payload.repo) / 100.0))
    return AnalyzeResponse(
        ok=True,
        score=score,
        message=f"Analyzed {payload.repo} on {payload.branch}",
    )
