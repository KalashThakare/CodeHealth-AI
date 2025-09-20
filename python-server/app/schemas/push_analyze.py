from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

class CommitItem(BaseModel):
    id: str = Field(..., min_length=1)
    message: Optional[str] = None
    author: Optional[str] = None
    added: Optional[str] = None
    removed: Optional[str] = None
    modified: Optional[str] = None

    model_config = ConfigDict(extra="ignore")


class PushAnalyzeRequest(BaseModel):
    repo: str = Field(..., min_length=1)
    branch: str = "main"
    threshold: float = Field(0.5, ge=0.0, le=1.0)

    repoId: Optional[int] = None
    installationId: Optional[int] = None
    headCommitSha: Optional[str] = None
    pushedBy: Optional[str] = None
    commitCount: Optional[int] = None
    commits: Optional[List[CommitItem]] = None

    model_config = ConfigDict(
        populate_by_name=True, 
        extra="ignore",        
    )

class PushAnalyzeResponse(BaseModel):
    ok: bool
    score: float
    message: str
