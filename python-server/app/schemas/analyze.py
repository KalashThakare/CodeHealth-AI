from pydantic import BaseModel, Field

class AnalyzeRequest(BaseModel):
    repo: str = Field(..., min_length=1)
    branch: str = "main"
    threshold: float = Field(0.5, ge=0.0, le=1.0)

class AnalyzeResponse(BaseModel):
    ok: bool
    score: float
    message: str
