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

class Cyclomatic(BaseModel):
    name: str
    complexity: int
    rank: str


class Halstead(BaseModel):
    h1: int
    h2: int
    N1: int
    N2: int
    volume: float
    difficulty: float
    effort: float


class Maintainability(BaseModel):
    mi: float
    rank: str


class StaticAnalysisResponse(BaseModel):
    path: str
    loc: int
    lloc: int
    sloc: int
    comments: int
    multi: int
    blank: int
    cyclomatic: List[Cyclomatic]
    halstead: Halstead
    maintainability: Maintainability

class FullRepoAnalysisResponse(BaseModel):
    ok: bool
    fileCount: int
    score: float
    message: str
    files: Optional[List[dict]] = None