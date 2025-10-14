from pydantic import BaseModel
from typing import List, Dict, Optional

class RefactorPriorityFile(BaseModel):
    path: str
    riskScore: float
    cyclomaticComplexity: int
    maintainabilityIndex: float
    halsteadVolume: float
    locTotal: int
    reason: str

class RepoMetrics(BaseModel):
    avgCyclomaticComplexity: float
    avgMaintainabilityIndex: float
    avgHalsteadVolume: float
    weightedCyclomaticComplexity: float
    weightedMaintainabilityIndex: float
    weightedHalsteadVolume: float
    technicalDebtScore: float
    totalLOC: int
    totalFiles: int
    refactorPriorityFiles: List[RefactorPriorityFile]

class CommitVelocity(BaseModel):
    trend: str
    consistency: float

class CommitAnalysis(BaseModel):
    totalCommits: int
    daysActive: int
    activeDays: int
    activityRatio: float
    avgCommitsPerDay: float
    recentCommits30Days: int
    contributorCount: int
    topContributorRatio: float
    busFactor: str
    avgMessageLength: float
    firstCommit: str
    lastCommit: str
    velocity: CommitVelocity

class ComponentScores(BaseModel):
    codeQuality: float
    developmentActivity: float
    busFactor: int
    community: float

class RepoHealthScore(BaseModel):
    overallHealthScore: float
    healthRating: str
    componentScores: ComponentScores
    strengths: List[str]
    weaknesses: List[str]

class Distributions(BaseModel):
    maintainabilityDistribution: List[int]
    complexityDistribution: List[int]

class AnalysisRequest(BaseModel):
    message: Optional[str] = None
    result: RepoMetrics
    commitAnalysis: CommitAnalysis
    repoHealthScore: RepoHealthScore
    distributions: Distributions
    # Optional fields
    repoId: Optional[int] = None
    repoName: Optional[str] = None
    branch: Optional[str] = "main"
    insightType: Optional[str] = "all"