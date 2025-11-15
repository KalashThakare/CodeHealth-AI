from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Dict, Any

class PullRef(BaseModel):
    ref: Optional[str] = None
    sha: Optional[str] = None
    repoId: Optional[int] = None
    repoFullName: Optional[str] = None

    model_config = ConfigDict(extra="ignore")


class PullAnalyzeRequest(BaseModel):
    type: str = Field("pull_request")
    repoFullName: str = Field(..., min_length=1) 
    repoId: Optional[int] = None
    installationId: int = Field(..., ge=1)
    prNumber: int = Field(..., ge=1)
    action: Optional[str] = None
    sender: Optional[Dict[str, Any]] = None 
    isFromFork: Optional[bool] = None

    head: PullRef
    base: PullRef

    threshold: float = Field(0.5, ge=0.0, le=1.0)

    model_config = ConfigDict(
        extra="ignore",         
    )


class Annotation(BaseModel):
    path: Optional[str] = None
    start_line: Optional[int] = Field(None, ge=1)
    end_line: Optional[int] = Field(None, ge=1)
    message: str = Field(..., min_length=1)
    severity: Optional[str] = Field("info", description="info|warning|error")

    model_config = ConfigDict(extra="ignore")


class Suggestion(BaseModel):
    title: Optional[str] = None
    message: str = Field(..., min_length=1)
    patch: Optional[str] = Field(None, description="Unified diff or code block")

    model_config = ConfigDict(extra="ignore")


class AnalysisMetrics(BaseModel):
    """Detailed metrics for PR analysis"""
    riskScore: float = Field(..., ge=0.0, le=100.0)
    complexityScore: float = Field(..., ge=0.0, le=100.0)
    criticality: str = Field(..., description="low|medium|high")
    filesChanged: int = Field(..., ge=0)
    filesAdded: int = Field(0, ge=0)
    filesModified: int = Field(0, ge=0)
    filesRemoved: int = Field(0, ge=0)
    filesRenamed: int = Field(0, ge=0)
    linesAdded: int = Field(..., ge=0)
    linesDeleted: int = Field(..., ge=0)
    impactAreas: List[str] = Field(default_factory=list)
    fileExtensions: List[str] = Field(default_factory=list)
    missingTests: bool = False
    missingDocs: bool = False
    
    model_config = ConfigDict(extra="ignore")


class PullAnalyzeResponse(BaseModel):
    ok: bool = True
    repoId: int
    repo: Optional[str] = None
    prNumber: Optional[int] = None
    headSha: Optional[str] = None
    baseRef: Optional[str] = None
    
    # Quality score (0.0 - 1.0, inverse of risk)
    score: Optional[float] = Field(None, ge=0.0, le=1.0)
    
    # Summary text
    summary: Optional[str] = None
    
    # Detailed metrics
    metrics: Optional[AnalysisMetrics] = None
    
    # Annotations (warnings, errors, info)
    annotations: Optional[List[Annotation]] = None
    
    # Suggestions for improvement
    suggestions: Optional[List[Suggestion]] = None
    
    # Security warnings
    securityWarnings: Optional[List[str]] = None
    
    # Recommended reviewers
    recommendedReviewers: Optional[List[str]] = None
    
    # Analysis run ID (for tracking)
    runId: Optional[str] = None
    
    # Timestamp
    analyzedAt: Optional[str] = None

    model_config = ConfigDict(extra="ignore")