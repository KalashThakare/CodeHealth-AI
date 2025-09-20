from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional

class PullRef(BaseModel):
    ref: Optional[str] = None
    sha: Optional[str] = None
    repoId: Optional[int] = None
    repoFullName: Optional[str] = None

    model_config = ConfigDict(extra="ignore")

class PullAnalyzeRequest(BaseModel):
    type: str = Field("pull_request")
    repo: str = Field(..., min_length=1, alias="repoFullName")
    repoId: Optional[int] = None
    installationId: int = Field(..., ge=1)
    prNumber: int = Field(..., ge=1)
    action: Optional[str] = None
    sender: Optional[dict] = None 
    isFromFork: Optional[bool] = None

    head: PullRef
    base: PullRef

    threshold: float = Field(0.5, ge=0.0, le=1.0)

    model_config = ConfigDict(
        populate_by_name=True, 
        extra="ignore",         
    )



class Annotation(BaseModel):
    path: Optional[str] = None
    start_line: Optional[int] = Field(None, ge=1)
    end_line: Optional[int] = Field(None, ge=1)
    message: str = Field(..., min_length=1)
    severity: Optional[str] = Field(None, description="e.g., info|warning|error")

    model_config = ConfigDict(extra="ignore")

class Suggestion(BaseModel):
    # Optional: auto-fix suggestion text or patch hunks
    title: Optional[str] = None
    message: str = Field(..., min_length=1)
    patch: Optional[str] = Field(None, description="Unified diff or code block")

    model_config = ConfigDict(extra="ignore")

class PullAnalyzeResponse(BaseModel):
    ok: bool = True
    repo: Optional[str] = None
    prNumber: Optional[int] = None

    headSha: Optional[str] = None
    baseRef: Optional[str] = None

    score: Optional[float] = Field(None, ge=0.0, le=1.0)
    summary: Optional[str] = None

    annotations: Optional[List[Annotation]] = None
    suggestions: Optional[List[Suggestion]] = None

    runId: Optional[str] = None

    model_config = ConfigDict(extra="ignore")