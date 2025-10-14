from typing import List
from ..schemas.analysis_model import RefactorPriorityFile, RepoHealthScore

def build_code_smell_prompt(files_data: List[RefactorPriorityFile], health_score: RepoHealthScore) -> str:
    """Build prompt for detecting code smells"""
    
    high_complexity = [f for f in files_data if f.cyclomaticComplexity > 15]
    low_maintainability = [f for f in files_data if f.maintainabilityIndex < 30]
    large_files = [f for f in files_data if f.locTotal > 300]
    
    prompt = f"""You are a code quality expert analyzing a codebase for code smells and anti-patterns.

Repository Health:
- Overall Health Score: {health_score.overallHealthScore}/100
- Health Rating: {health_score.healthRating}
- Code Quality Score: {health_score.componentScores.codeQuality}/100
- Development Activity: {health_score.componentScores.developmentActivity}/100
- Bus Factor Score: {health_score.componentScores.busFactor}/100

Strengths: {', '.join(health_score.strengths)}
Weaknesses: {', '.join(health_score.weaknesses)}

Statistics:
- Files with very high complexity (>15): {len(high_complexity)}
- Files with very low maintainability (<30): {len(low_maintainability)}
- Large files (>300 LOC): {len(large_files)}

Top High-Risk Files:
{chr(10).join([f"- {f.path} (Risk: {f.riskScore}, Complexity: {f.cyclomaticComplexity}, Maintainability: {f.maintainabilityIndex})" for f in files_data[:8]])}

Identify common code smells and anti-patterns in this codebase:
1. God Objects / God Classes (files doing too many things)
2. Long Methods / Functions (high complexity)
3. Feature Envy (accessing other objects' data too much)
4. Duplicate Code patterns
5. Tight Coupling indicators
6. Low Cohesion signs
7. Magic Numbers / Strings
8. Dead Code possibilities
9. Primitive Obsession
10. Any other notable code smells

For each smell detected, provide:
- Smell name and category
- Detailed description
- Severity (critical/high/medium/low)
- Affected files (specific files if applicable)
- Root cause analysis
- Recommendation to fix
- Impact if not fixed
- Estimated fix time

Format response as JSON:
{{
    "codeSmells": [
        {{
            "smell": "God Object",
            "category": "Bloaters",
            "description": "detailed description of the smell",
            "severity": "critical",
            "affectedFiles": ["file1", "file2"],
            "rootCause": "why this smell exists",
            "recommendation": "step-by-step fix",
            "impact": "what happens if not fixed",
            "estimatedFixTime": "2-3 days"
        }}
    ],
    "overallCodeHealth": "assessment of code health"
}}
"""
    return prompt
