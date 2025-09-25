from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

class FullRepoAnalysisRequest(BaseModel):
    repoId:str
    owner:str
    repoName:str
    fullName:str
    branch:str
    installationId:str
    requestedBy:str
    requestedAt:str

    model_config = ConfigDict(extra="ignore")

class FullRepoAnalysisResponse(BaseModel):
    ok: bool
    fileCount: int
    score: float
    message: str
    files: Optional[List[dict]] = None