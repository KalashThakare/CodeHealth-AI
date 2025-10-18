from typing import List
from ..schemas.analysis_model import RefactorPriorityFile, RepoMetrics

def build_refactoring_prompt(files_data: List[RefactorPriorityFile], metrics: RepoMetrics) -> str:
    """Build prompt for comprehensive refactoring analysis with business prioritization"""
    
    files_info = "\n\n".join([
        f"File: {f.path}\n"
        f"- Risk Score: {f.riskScore}/100 (production incident probability)\n"
        f"- Cyclomatic Complexity: {f.cyclomaticComplexity} (developer cognitive load)\n"
        f"- Maintainability Index: {f.maintainabilityIndex} (change effort multiplier)\n"
        f"- Halstead Volume: {f.halsteadVolume} (comprehension difficulty)\n"
        f"- Lines of Code: {f.locTotal}\n"
        f"- Issues: {f.reason}"
        for f in files_data[:10]
    ])
    
    prompt = f"""
You are an expert senior software engineer and technical debt strategist.

Analyze the following repository metrics and high-risk files, then respond ONLY in valid JSON. 
Do NOT include explanations, markdown, or commentary outside of the JSON.

Repository Metrics:
- Technical Debt Score: {metrics.technicalDebtScore}/100
- Avg Cyclomatic Complexity: {metrics.avgCyclomaticComplexity}
- Avg Maintainability Index: {metrics.avgMaintainabilityIndex}
- Avg Halstead Volume: {metrics.avgHalsteadVolume}
- Total Files: {metrics.totalFiles}, Total LOC: {metrics.totalLOC}

Weighted Metrics (impact-adjusted by LOC):
- Weighted Complexity: {metrics.weightedCyclomaticComplexity}
- Weighted Maintainability: {metrics.weightedMaintainabilityIndex}
- Weighted Halstead Volume: {metrics.weightedHalsteadVolume}

High-Risk Files:
{files_info}

Your tasks:
1. Provide refactoring recommendations with business justification.
2. Prioritize files based on business + technical risk.
3. Evaluate team impact (burnout, knowledge risks).
4. Predict post-refactor velocity gain & ROI.
5. Give coaching insights to prevent future debt.

STRICT JSON OUTPUT FORMAT (MANDATORY):
{{
    "refactoringSuggestions": [
        {{
            "file": "path/to/file",
            "priority": "critical|high|medium|low",
            "currentIssues": ["clear business-impacting issues"],
            "recommendations": [
                {{
                    "action": "specific refactoring step",
                    "benefit": "measurable improvement with exact numbers",
                    "effort": "X-Y hours"
                }}
            ],
            "estimatedEffort": "total hours",
            "risks": "incident risk X%, breaking change probability Y%",
            "quickWins": ["<2 hour actions"],
            "refactoringPattern": "e.g., strategy pattern / modularization / repo split",
            "businessImpact": {{
                "currentCost": "Z hours wasted monthly",
                "incidentRisk": "W% probability",
                "velocitySlowdown": "V% reduction",
                "postRefactoringGain": "U% increase"
            }},
            "teamHealthImpact": {{
                "ownershipRisk": "bus factor concern or safe",
                "burnoutIndicator": "high|medium|low",
                "knowledgeGap": "onboarding bottleneck or none"
            }}
        }}
    ],
    "prioritizationMatrix": {{
        "highImpactLowEffort": ["file paths"],
        "highImpactHighEffort": ["file paths"],
        "lowImpactLowEffort": ["file paths"],
        "lowImpactHighEffort": ["file paths"]
    }},
    "coachingInsights": {{
        "commonPatterns": ["repeated tech debt patterns"],
        "learningResources": ["hyper-relevant resources only"],
        "teamGuidelines": ["forward-preventive coding rules"]
    }}
}}

IF NO MEANINGFUL RECOMMENDATIONS EXIST:
Return EXACTLY:
{{
  "refactoringSuggestions": [],
  "message": "No suggestions available"
}}
"""

    return prompt