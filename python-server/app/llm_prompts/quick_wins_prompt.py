from ..schemas.analysis_model import RefactorPriorityFile, RepoMetrics
from typing import List

def build_quick_wins_prompt(files_data: List[RefactorPriorityFile], metrics: RepoMetrics) -> str:
    """Build prompt for identifying quick wins with immediate ROI"""
    
    small_high_risk = [f for f in files_data if f.locTotal < 300 and f.riskScore > 70]
    reducible_complexity = [f for f in files_data if 10 < f.cyclomaticComplexity < 25]
    
    prompt = f"""You are identifying quick wins - high-ROI refactoring tasks that immediately improve team productivity and reduce risk.

OBJECTIVE: Find low-effort, high-impact improvements that demonstrate immediate business value and build momentum for larger refactoring efforts.

Repository Context:
- Total Files: {metrics.totalFiles}
- Total LOC: {metrics.totalLOC}
- Technical Debt: {metrics.technicalDebtScore}/100 (monthly cost in developer time)

Small High-Risk Files (quick improvement opportunities):
{chr(10).join([f"- {f.path}: Complexity {f.cyclomaticComplexity}, Maintainability {f.maintainabilityIndex}, {f.locTotal} LOC" for f in small_high_risk[:5]])}

Files with Reducible Complexity (velocity boosters):
{chr(10).join([f"- {f.path}: Complexity {f.cyclomaticComplexity}, {f.locTotal} LOC" for f in reducible_complexity[:5]])}

All High-Priority Files:
{chr(10).join([f"- {f.path}: Risk {f.riskScore}" for f in files_data[:10]])}

Identify 8-12 quick wins meeting ALL criteria:
1. Completable in less than 4 hours
2. Immediate measurable impact (complexity reduction, error rate drop, faster reviews)
3. Low risk of regression (minimal breaking changes)
4. Minimal testing overhead
5. Independent implementation (no blocking dependencies)
6. Visible improvements for team morale

Quick win categories prioritized by business impact:
- Extract complex functions (reduce review time, improve testability)
- Add missing error handling (reduce production incidents)
- Remove dead code (improve codebase clarity, faster onboarding)
- Simplify conditional logic (reduce cognitive load, fewer bugs)
- Extract magic numbers to constants (reduce configuration errors)
- Add type safety (catch bugs in development, not production)
- Improve variable naming (faster code comprehension)
- Split large files (enable parallel development)
- Add targeted documentation (reduce knowledge bottleneck)
- Reduce nesting levels (lower cyclomatic complexity)

For each quick win provide:
- File/area with current pain points
- Specific action with expected outcome
- Realistic time estimate based on complexity
- Quantified impact (complexity -X, review time -Y%, incident risk -Z%)
- Risk assessment (regression probability)
- Detailed implementation steps
- Verification method with success criteria
- Team productivity benefit

Format as JSON:
{{
    "quickWins": [
        {{
            "file": "path/to/file",
            "action": "specific refactoring with measurable goal",
            "estimatedTime": "X hours",
            "impact": "complexity X→Y, Z% faster reviews, incident risk reduced",
            "effort": "low|medium",
            "risk": "very low|low - specific risk mitigation",
            "steps": ["concrete step 1", "concrete step 2"],
            "verificationMethod": "how to confirm success with metrics",
            "priority": 1
        }}
    ],
    "totalEstimatedTime": "X-Y hours total investment",
    "expectedImpact": "cumulative ROI: Z hours saved monthly, W% velocity increase, incident reduction"
}}
"""
    return prompt