from fastapi import APIRouter
from app.schemas.push_analyze import PushAnalyzeRequest, PushAnalyzeResponse
from app.services.analyze_service import push_analyze_repo
from app.schemas.pull_analyze import PullAnalyzeRequest, PullAnalyzeResponse
from app.services.analyze_service import pull_analyze_repo

router = APIRouter(prefix="/v1", tags=["analyze"])

@router.post("/internal/analysis/run", response_model=PushAnalyzeResponse)
def analyze(payload: PushAnalyzeRequest) -> PushAnalyzeResponse:
    return push_analyze_repo(payload)

@router.post("/internal/analysis/pr",response_model=PullAnalyzeResponse)
def analyze(payload: PullAnalyzeRequest) -> PullAnalyzeResponse:
    return pull_analyze_repo(payload)