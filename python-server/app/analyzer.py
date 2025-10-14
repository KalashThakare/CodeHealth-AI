from typing import List, Dict, Any, Optional
from datetime import datetime
from app.llm_prompts import (
    build_architectural_prompt,
    build_code_smell_prompt,
    build_quick_wins_prompt,
    build_refactoring_prompt
)
from pydantic import BaseModel, Field
from .services.llmService import call_llm_claude, call_llm_openai, parse_llm_response
from .schemas.analysis_model import RefactorPriorityFile, RepoMetrics, RepoHealthScore, CommitAnalysis, Distributions

async def analyze_refactoring_opportunities(files_data: List[RefactorPriorityFile], metrics: RepoMetrics) -> List[Dict[str, Any]]:
    """Generate AI-powered refactoring suggestions"""
    if not files_data:
        return []
    
    prompt = build_refactoring_prompt(files_data, metrics)
    llm_response = await call_llm_claude(prompt, max_tokens=6000)
    parsed = await parse_llm_response(llm_response)
    
    return parsed.get("refactoringSuggestions", [])

async def detect_code_smells(files_data: List[RefactorPriorityFile], health_score: RepoHealthScore) -> Dict[str, Any]:
    """Detect code smells using AI"""
    if not files_data:
        return {"codeSmells": [], "overallCodeHealth": "No files to analyze"}
    
    prompt = build_code_smell_prompt(files_data, health_score)
    llm_response = await call_llm_claude(prompt, max_tokens=5000)
    parsed = await parse_llm_response(llm_response)
    
    return {
        "codeSmells": parsed.get("codeSmells", []),
        "overallCodeHealth": parsed.get("overallCodeHealth", "")
    }

async def generate_architectural_recommendations(
    metrics: RepoMetrics, 
    health_score: RepoHealthScore, 
    commit_analysis: CommitAnalysis
) -> Dict[str, Any]:
    """Generate architectural recommendations using AI"""
    prompt = build_architectural_prompt(metrics, health_score, commit_analysis)
    llm_response = await call_llm_claude(prompt, max_tokens=7000)
    parsed = await parse_llm_response(llm_response)
    
    return {
        "recommendations": parsed.get("architecturalRecommendations", []),
        "roadmap": parsed.get("strategicRoadmap", {}),
        "strategy": parsed.get("overallStrategy", "")
    }

async def generate_quick_wins(files_data: List[RefactorPriorityFile], metrics: RepoMetrics) -> Dict[str, Any]:
    """Identify quick wins using AI"""
    if not files_data:
        return {"quickWins": [], "totalEstimatedTime": "0 hours", "expectedImpact": "No files to analyze"}
    
    prompt = build_quick_wins_prompt(files_data, metrics)
    llm_response = await call_llm_claude(prompt, max_tokens=5000)
    parsed = await parse_llm_response(llm_response)
    
    return {
        "quickWins": parsed.get("quickWins", []),
        "totalEstimatedTime": parsed.get("totalEstimatedTime", ""),
        "expectedImpact": parsed.get("expectedImpact", "")
    }

async def generate_overall_assessment(
    metrics: RepoMetrics,
    health_score: RepoHealthScore, 
    commit_analysis: CommitAnalysis,
    distributions: Distributions
) -> Dict[str, Any]:
    """Generate comprehensive assessment using AI"""
    
    prompt = f"""Provide a comprehensive executive summary of this codebase:

## Overall Metrics
- Health Score: {health_score.overallHealthScore}/100 ({health_score.healthRating})
- Technical Debt: {metrics.technicalDebtScore}/100
- Total Files: {metrics.totalFiles}
- Total LOC: {metrics.totalLOC}
- High-Risk Files: {len([f for f in metrics.refactorPriorityFiles if f.riskScore > 80])}

## Component Scores
- Code Quality: {health_score.componentScores.codeQuality}/100
- Development Activity: {health_score.componentScores.developmentActivity}/100
- Bus Factor: {health_score.componentScores.busFactor}/100
- Community: {health_score.componentScores.community}/100

## Code Quality Details
- Avg Complexity: {metrics.avgCyclomaticComplexity} (Weighted: {metrics.weightedCyclomaticComplexity})
- Avg Maintainability: {metrics.avgMaintainabilityIndex} (Weighted: {metrics.weightedMaintainabilityIndex})
- Avg Halstead Volume: {metrics.avgHalsteadVolume}

## Development Activity
- Total Commits: {commit_analysis.totalCommits}
- Contributors: {commit_analysis.contributorCount}
- Bus Factor: {commit_analysis.busFactor}
- Velocity: {commit_analysis.velocity.trend}
- Consistency: {commit_analysis.velocity.consistency}
- Recent Activity: {commit_analysis.recentCommits30Days} commits (last 30 days)

## Distributions
- Maintainability: {distributions.maintainabilityDistribution} (bins: 0-20, 20-40, 40-60, 60-80, 80-100)
- Complexity: {distributions.complexityDistribution} (bins: 0-4, 4-8, 8-12, 12-16, 16+)

## Current State
Strengths: {', '.join(health_score.strengths)}
Weaknesses: {', '.join(health_score.weaknesses)}

Provide an executive summary with:
1. Overall status assessment (excellent/good/fair/poor/critical)
2. Key message (3-4 sentences for executives)
3. Top 3-5 critical priorities
4. Recommended immediate actions
5. 30/60/90 day roadmap
6. Success metrics to track
7. Resource requirements
8. Risk assessment

Format as JSON:
{{
    "status": "fair",
    "executiveSummary": "concise 3-4 sentence summary",
    "keyFindings": ["finding1", "finding2", "finding3"],
    "criticalPriorities": [
        {{
            "priority": "Fix God Object in unifiedController",
            "urgency": "high",
            "impact": "high",
            "effort": "medium"
        }}
    ],
    "immediateActions": ["action1", "action2"],
    "roadmap": {{
        "30days": ["goal1", "goal2"],
        "60days": ["goal3"],
        "90days": ["goal4"]
    }},
    "successMetrics": ["metric1", "metric2"],
    "resourceRequirements": "estimated team time",
    "riskAssessment": "current risks and mitigation"
}}
"""
    
    llm_response = await call_llm_claude(prompt, max_tokens=6000)
    parsed = await parse_llm_response(llm_response)
    
    return {
        "recommendations": parsed.get("architecturalRecommendations", []),
        "strategy": parsed.get("overallStrategy", "")
    }
