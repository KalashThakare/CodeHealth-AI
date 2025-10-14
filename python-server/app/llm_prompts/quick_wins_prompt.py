from ..schemas.analysis_model import RefactorPriorityFile, RepoMetrics
from typing import List

def build_quick_wins_prompt(files_data: List[RefactorPriorityFile], metrics: RepoMetrics) -> str:
    """Build prompt for identifying quick wins"""
    
    # Small files with issues
    small_high_risk = [f for f in files_data if f.locTotal < 300 and f.riskScore > 70]
    
    # Medium complexity that can be reduced
    reducible_complexity = [f for f in files_data if 10 < f.cyclomaticComplexity < 25]
    
    prompt = f"""You are identifying quick wins - easy refactoring tasks with high impact and low risk.

Repository Context:
- Total Files: {metrics.totalFiles}
- Total LOC: {metrics.totalLOC}
- Technical Debt: {metrics.technicalDebtScore}/100

Small High-Risk Files (easier to refactor):
{chr(10).join([f"- {f.path}: Complexity {f.cyclomaticComplexity}, Maintainability {f.maintainabilityIndex}, {f.locTotal} LOC" for f in small_high_risk[:5]])}

Files with Reducible Complexity:
{chr(10).join([f"- {f.path}: Complexity {f.cyclomaticComplexity}, {f.locTotal} LOC" for f in reducible_complexity[:5]])}

All High-Priority Files:
{chr(10).join([f"- {f.path}: Risk {f.riskScore}" for f in files_data[:10]])}

Identify 8-12 quick wins that meet ALL these criteria:
1. Takes less than 4 hours to complete
2. Has immediate positive impact on metrics
3. Low risk (won't break functionality)
4. Doesn't require extensive testing
5. Can be done independently
6. Provides visible improvements

Categories of quick wins to look for:
- Extract complex functions into smaller ones
- Add missing error handling
- Remove dead code
- Simplify conditional logic
- Extract magic numbers to constants
- Add type safety
- Improve variable naming
- Split large files
- Add basic documentation
- Reduce nesting levels

For each quick win provide:
- File/area affected
- Specific action to take
- Estimated time (be realistic)
- Impact description (what improves)
- Current risk vs after fix
- Step-by-step approach
- How to verify success

Format as JSON:
{{
    "quickWins": [
        {{
            "file": "path/to/file",
            "action": "Extract authentication logic into separate function",
            "estimatedTime": "2 hours",
            "impact": "Reduces complexity from 15 to 8, improves testability",
            "effort": "low",
            "risk": "very low - pure extraction refactoring",
            "steps": ["step1", "step2", "step3"],
            "verificationMethod": "Run existing tests, check complexity metrics",
            "priority": 1
        }}
    ],
    "totalEstimatedTime": "18-24 hours",
    "expectedImpact": "overall impact description"
}}
"""
    return prompt