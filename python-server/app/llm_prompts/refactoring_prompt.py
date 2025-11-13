from typing import List
from ..schemas.analysis_model import RefactorPriorityFile, RepoMetrics

def build_refactoring_prompt(files_data: List[RefactorPriorityFile], metrics: RepoMetrics) -> str:
    """Build improved prompt for comprehensive refactoring analysis with business-oriented prioritization."""
    
    files_info = "\n\n".join([
        f"File: {f.path}\n"
        f"- Risk Score: {f.riskScore}/100 (probability of production issues)\n"
        f"- Cyclomatic Complexity: {f.cyclomaticComplexity} (developer cognitive load)\n"
        f"- Maintainability Index: {f.maintainabilityIndex} (ease of change)\n"
        f"- Halstead Volume: {f.halsteadVolume} (mental processing cost)\n"
        f"- Lines of Code: {f.locTotal}\n"
        f"- Issues: {f.reason}"
        for f in files_data[:10]
    ])

    prompt = f"""
You are acting as a **principal software engineer**, **refactoring architect**, and **technical debt strategist**.

Your job is to help a developer clearly understand:
- where their biggest risks are,
- which refactors matter most,
- how much effort is required,
- what business/team benefits each change brings.

Your explanations must be **user-friendly, structured, and focused on clarity**.  
Respond **ONLY in valid JSON.** No markdown, no extra commentary.

---

# 📊 Repository Overview
Use the following metrics to understand the repo’s current engineering health:

- Technical Debt Score: {metrics.technicalDebtScore}/100  
- Avg Complexity: {metrics.avgCyclomaticComplexity}  
- Avg Maintainability: {metrics.avgMaintainabilityIndex}  
- Avg Halstead Volume: {metrics.avgHalsteadVolume}  
- Total Files: {metrics.totalFiles}  
- Total LOC: {metrics.totalLOC}  

### Weighted Metrics  
These represent the true developer cost after accounting for file size:

- Weighted Complexity: {metrics.weightedCyclomaticComplexity}  
- Weighted Maintainability: {metrics.weightedMaintainabilityIndex}  
- Weighted Halstead Volume: {metrics.weightedHalsteadVolume}  

---

# 🚨 High-Risk Files (Most Valuable Refactoring Targets)
The following files contribute the most to maintenance cost, onboarding difficulty, and defect probability:

{files_info}

---

# 🧭 Your Tasks
Provide a complete, practical refactoring analysis that helps the user understand exactly **what to fix**, **why it matters**, and **what benefit they get**.

### You must:
1. Give **clear refactoring recommendations** with business impact explained in simple words.  
2. Prioritize files using a **business + technical risk matrix**.  
3. Evaluate **team impact** (knowledge concentration, burnout indicators, ownership risks).  
4. Predict **ROI**, including expected velocity gains after refactoring.  
5. Offer **preventive coaching insights** so the team avoids repeating the same issues.

All output must be direct, useful, and immediately understandable by a developer.

---

# 📦 STRICT JSON OUTPUT FORMAT (MANDATORY)

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

---

# 📌 If no meaningful recommendations exist, return EXACTLY:
{{
  "refactoringSuggestions": [],
  "message": "No suggestions available"
}}
"""
    return prompt
