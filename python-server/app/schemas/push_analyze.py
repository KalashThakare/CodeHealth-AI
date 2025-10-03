from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

class CommitItem(BaseModel):
    id: str = Field(..., min_length=1)
    message: Optional[str] = None
    author: Optional[str] = None
    added: Optional[List[str]] = None
    removed: Optional[List[str]] = None
    modified: Optional[List[str]] = None

    model_config = ConfigDict(extra="ignore")

class PushAnalyzeRequest(BaseModel):
    repo: str = Field(..., min_length=1, alias='repoFullName')
    branch: str = "main"
    threshold: float = Field(0.5, ge=0.0, le=1.0)

    repoId: int
    installationId: int
    headCommitSha: Optional[str] = None
    pushedBy: Optional[str] = None
    commitCount: Optional[int] = None
    commits: Optional[List[CommitItem]] = None

    model_config = ConfigDict(
        validate_by_name=True,      
        validate_by_alias=True,      
        extra="ignore",
    )

class PushAnalyzeResponse(BaseModel):
    ok: bool
    score: float
    message: str
