from typing import List
from ..schemas.analysis_model import RepoMetrics, RepoHealthScore, CommitAnalysis

def build_architectural_prompt(metrics: RepoMetrics, health_score: RepoHealthScore, commit_analysis: CommitAnalysis) -> str:
    """Build prompt for architectural recommendations with business impact focus"""
    
    avg_file_size = metrics.totalLOC / max(metrics.totalFiles, 1)
    
    prompt = f"""
You are a senior technical architect and business strategy consultant.

Analyze the repo architecture, code quality signals, development workflow, scalability, long-term maintainability — and respond ONLY in valid JSON (no markdown, no commentary outside JSON).

Repository Overview:
- Overall Health Score: {health_score.overallHealthScore}/100 ({health_score.healthRating})
- Technical Debt: {metrics.technicalDebtScore}/100
- Total Files: {metrics.totalFiles}, Total LOC: {metrics.totalLOC}, Avg File Size: {int(avg_file_size)} LOC

Code Quality Signals:
- Avg Cyclomatic Complexity: {metrics.avgCyclomaticComplexity}
- Weighted Complexity: {metrics.weightedCyclomaticComplexity}
- Avg Maintainability Index: {metrics.avgMaintainabilityIndex}
- Weighted Maintainability: {metrics.weightedMaintainabilityIndex}

Team & Development Dynamics:
- Contributors: {commit_analysis.contributorCount} | Bus Factor: {commit_analysis.busFactor}
- Total Commits: {commit_analysis.totalCommits}
- Velocity Trend: {commit_analysis.velocity.trend} | Consistency: {commit_analysis.velocity.consistency}
- Last 30 days: {commit_analysis.recentCommits30Days} commits

Current Strengths:
{chr(10).join([f"- {s}" for s in health_score.strengths])}

Current Weaknesses:
{chr(10).join([f"- {w}" for w in health_score.weaknesses])}

Return JSON ONLY in this exact format — NO extra text outside this structure:

{{
  "recommendations": [
    {{
      "area": "architecture|workflow|testing|scalability|team|performance|etc",
      "currentState": "specific pain with quantifiable business impact (developer hours wasted, risk %, cost)",
      "recommendation": "clear, executive-actionable solution",
      "benefits": ["velocity +X%", "risk reduction -Y%", "time saved Z hours/month"],
      "priority": "critical|high|medium|low",
      "timeline": "X weeks",
      "dependencies": ["if any"],
      "successMetrics": ["exact measurable KPI improvements"]
    }}
  ],
  "roadmap": {{
    "immediate": ["actions with <4 week ROI"],
    "shortTerm": ["actions with high business payoff"],
    "longTerm": ["strategic architecture/organizational corrections"]
  }},
  "strategy": "1 executive-level strategic direction with long-term engineering + business outcome alignment"
}}

IF THERE ARE NO ACTIONABLE ARCHITECTURAL RECOMMENDATIONS:
Return EXACTLY:
{{
  "recommendations": [],
  "message": "No critical architectural changes needed"
}}
"""

    return prompt