from typing import List
from ..schemas.analysis_model import RefactorPriorityFile, RepoMetrics

def build_refactoring_prompt(files_data: List[RefactorPriorityFile], metrics: RepoMetrics) -> str:
    """Build prompt for LLM to analyze refactoring opportunities"""
    
    files_info = "\n\n".join([
        f"File: {f.path}\n"
        f"- Risk Score: {f.riskScore}/100\n"
        f"- Cyclomatic Complexity: {f.cyclomaticComplexity}\n"
        f"- Maintainability Index: {f.maintainabilityIndex}\n"
        f"- Halstead Volume: {f.halsteadVolume}\n"
        f"- Lines of Code: {f.locTotal}\n"
        f"- Issues: {f.reason}"
        for f in files_data[:10]  # Limit to top 10 files
    ])
    
    prompt = f"""You are a senior software engineer reviewing a codebase for refactoring opportunities.

Repository Health Summary:
- Overall Technical Debt Score: {metrics.technicalDebtScore}/100
- Average Cyclomatic Complexity: {metrics.avgCyclomaticComplexity}
- Average Maintainability Index: {metrics.avgMaintainabilityIndex}
- Average Halstead Volume: {metrics.avgHalsteadVolume}
- Total Files: {metrics.totalFiles}
- Total Lines of Code: {metrics.totalLOC}

Weighted Metrics (by LOC):
- Weighted Complexity: {metrics.weightedCyclomaticComplexity}
- Weighted Maintainability: {metrics.weightedMaintainabilityIndex}
- Weighted Halstead Volume: {metrics.weightedHalsteadVolume}

High-Risk Files Requiring Attention:
{files_info}

Please analyze these files and provide:
1. Specific refactoring recommendations for each file
2. Priority level (critical/high/medium/low) for each recommendation
3. Estimated effort (hours) for each refactoring task
4. Potential risks if not refactored
5. Quick wins (easy but impactful changes)
6. Suggested refactoring patterns or techniques

Format your response as a structured JSON with the following schema:
{{
    "refactoringSuggestions": [
        {{
            "file": "path/to/file",
            "priority": "critical",
            "currentIssues": ["issue1", "issue2"],
            "recommendations": [
                {{
                    "action": "specific action",
                    "benefit": "what improves",
                    "effort": "4-6 hours"
                }}
            ],
            "estimatedEffort": "8-12 hours",
            "risks": "what happens if not fixed",
            "quickWins": ["quick win 1", "quick win 2"],
            "refactoringPattern": "Strategy Pattern / Extract Method / etc"
        }}
    ]
}}
"""
    return prompt