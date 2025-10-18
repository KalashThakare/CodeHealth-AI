from typing import List
from ..schemas.analysis_model import RefactorPriorityFile, RepoHealthScore

def build_code_smell_prompt(files_data: List[RefactorPriorityFile], health_score: RepoHealthScore) -> str:
    """Build prompt for detecting code smells with production risk assessment"""
    
    high_complexity = [f for f in files_data if f.cyclomaticComplexity > 15]
    low_maintainability = [f for f in files_data if f.maintainabilityIndex < 30]
    large_files = [f for f in files_data if f.locTotal > 300]
    
    prompt = f"""You are a code quality expert and risk assessment specialist analyzing a codebase for code smells, anti-patterns, and production risks.

ANALYSIS PURPOSE: Identify code smells that increase production incident risk, slow development velocity, and cause developer burnout.

Repository Health:
- Overall Health Score: {health_score.overallHealthScore}/100
- Health Rating: {health_score.healthRating}
- Code Quality Score: {health_score.componentScores.codeQuality}/100
- Development Activity: {health_score.componentScores.developmentActivity}/100
- Bus Factor Score: {health_score.componentScores.busFactor}/100

Strengths: {', '.join(health_score.strengths)}
Weaknesses: {', '.join(health_score.weaknesses)}

Risk Statistics:
- Files with very high complexity (>15): {len(high_complexity)} - High bug risk
- Files with very low maintainability (<30): {len(low_maintainability)} - Slow feature development
- Large files (>300 LOC): {len(large_files)} - Knowledge bottleneck risk

Top High-Risk Files:
{chr(10).join([f"- {f.path} (Risk: {f.riskScore}, Complexity: {f.cyclomaticComplexity}, Maintainability: {f.maintainabilityIndex})" for f in files_data[:8]])}

Identify code smells with BUSINESS AND TEAM IMPACT:
1. God Objects / God Classes (developer burnout hotspots)
2. Long Methods / Functions (testing bottlenecks)
3. Feature Envy (coupling increasing change risk)
4. Duplicate Code (maintenance cost multipliers)
5. Tight Coupling (breaking change propagation risk)
6. Low Cohesion (cognitive overload indicators)
7. Magic Numbers / Strings (production configuration risks)
8. Dead Code (false complexity signals)
9. Primitive Obsession (type safety gaps)
10. Other smells affecting velocity or stability

For each smell detected, provide:
- Smell name and category
- Detailed description with concrete examples
- Severity (critical/high/medium/low) based on production risk
- Affected files (specific paths)
- Root cause analysis (why it exists in this codebase)
- Recommendation with step-by-step fix approach
- Business impact: production incident probability %, monthly developer hours wasted
- Estimated fix time with ROI calculation
- Team health impact (burnout risk, knowledge gaps)

Format response as JSON:
{{
    "codeSmells": [
        {{
            "smell": "string",
            "category": "Bloaters|Object-Oriented Design Problems|Change Preventers|Dispensables|Couplers",
            "description": "detailed description with examples from this codebase",
            "severity": "critical|high|medium|low",
            "affectedFiles": ["specific file paths"],
            "rootCause": "why this exists - team practices, growth patterns, etc",
            "recommendation": "concrete steps to fix with prioritization",
            "impact": "production risk %, developer hours per month, team burnout indicators",
            "estimatedFixTime": "X days with Y hours saved monthly post-fix"
        }}
    ],
    "overallCodeHealth": "health assessment with velocity and risk predictions"
}}
"""
    return prompt