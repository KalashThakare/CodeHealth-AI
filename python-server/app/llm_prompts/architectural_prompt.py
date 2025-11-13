from typing import List
from ..schemas.analysis_model import RepoMetrics, RepoHealthScore, CommitAnalysis

def build_architectural_prompt(metrics: RepoMetrics, health_score: RepoHealthScore, commit_analysis: CommitAnalysis) -> str:
    """Build improved prompt for architectural recommendations with business and long-term strategy focus."""
    
    avg_file_size = metrics.totalLOC / max(metrics.totalFiles, 1)

    prompt = f"""
You are acting as a **senior technical architect**, **engineering strategist**, and **business-impact consultant**.

Your goal is to help the developer understand:
- the current state of their system's architecture,
- long-term maintainability risks,
- workflow and scalability gaps,
- organizational and team bottlenecks,
- and provide an actionable, business-aligned roadmap.

Explain problems and solutions in **clear, user-friendly, non-academic language** — but with **deep technical accuracy**.

Respond ONLY in **valid JSON**.  
No markdown, no analysis outside JSON.

---

# 📊 Repository Architecture & Health Overview

- Overall Health Score: **{health_score.overallHealthScore}/100** ({health_score.healthRating})
- Technical Debt Score: **{metrics.technicalDebtScore}/100**
- Total Files: **{metrics.totalFiles}**
- Total LOC: **{metrics.totalLOC}**
- Avg File Size: **{int(avg_file_size)} LOC**

## Code Quality Indicators
- Average Cyclomatic Complexity: **{metrics.avgCyclomaticComplexity}**
- Weighted Complexity: **{metrics.weightedCyclomaticComplexity}**
- Average Maintainability Index: **{metrics.avgMaintainabilityIndex}**
- Weighted Maintainability: **{metrics.weightedMaintainabilityIndex}**

## Team & Development Behavior
- Contributor Count: **{commit_analysis.contributorCount}**
- Bus Factor: **{commit_analysis.busFactor}**
- Total Commits: **{commit_analysis.totalCommits}**
- Velocity Trend: **{commit_analysis.velocity.trend}**
- Consistency: **{commit_analysis.velocity.consistency}**
- Recent 30-Day Commits: **{commit_analysis.recentCommits30Days}**

## Strengths
{chr(10).join([f"- {s}" for s in health_score.strengths])}

## Weaknesses
{chr(10).join([f"- {w}" for w in health_score.weaknesses])}

---

# 🎯 Your Job
Provide highly actionable **architectural, workflow, scalability, performance, testing, and organizational recommendations**.

All suggestions must:
- be tied to business outcomes (velocity, cost, risk),
- consider team size and workflow,
- include measurable benefits,
- be clear enough that a real developer could act immediately.

---

# 📦 STRICT JSON OUTPUT FORMAT (MANDATORY)

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

---

# ❗ If there are no actionable architectural recommendations
Return EXACTLY the following:

{{
  "recommendations": [],
  "message": "No critical architectural changes needed"
}}
"""

    return prompt
