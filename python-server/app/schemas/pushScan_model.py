from pydantic import BaseModel, Field
from typing import Set, List, Optional

class PushScanPayload(BaseModel):
    repoId: int
    repoName: str
    commitSha: str
    installationId: int
    branch: Optional[str] = Field(default="main", description="Branch name")
    
    filesAdded: List[str] = Field(default_factory=list)
    filesModified: List[str] = Field(default_factory=list)

class PushScanResponse(BaseModel):
    ok:bool
    filesScanned: int = 0
    message: Optional[str] = None