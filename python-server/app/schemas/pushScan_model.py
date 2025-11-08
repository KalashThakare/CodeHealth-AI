from pydantic import BaseModel, Field
from typing import Set, List

class PushScanPayload(BaseModel):
    repoId: int
    repoName: str
    commitSha: str
    installationId: int
    
    filesAdded: List[str] = Field(default_factory=list)
    filesModified: List[str] = Field(default_factory=list)
    filesRemoved: List[str] = Field(default_factory=list)

class PushScanResponse(BaseModel):
    ok:bool