from fastapi import APIRouter
from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse
from app.services.analyze_service import analyze_repo

router = APIRouter(prefix="/v1", tags=["analyze"])

@router.post("/internal/analysis/run", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest) -> AnalyzeResponse:
    return analyze_repo(payload)
