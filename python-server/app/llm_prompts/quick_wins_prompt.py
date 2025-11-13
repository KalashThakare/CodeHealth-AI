from ..schemas.analysis_model import RefactorPriorityFile, RepoMetrics 
from typing import List

def build_quick_wins_prompt(files_data: List[RefactorPriorityFile], metrics: RepoMetrics) -> str:
    """Build prompt for identifying quick wins with immediate ROI (user-friendly version)"""
    
    small_high_risk = [f for f in files_data if f.locTotal < 300 and f.riskScore > 70]
    reducible_complexity = [f for f in files_data if 10 < f.cyclomaticComplexity < 25]

    prompt = f"""
You are helping a developer understand their repository and identify **Quick Wins** — small, safe, high-impact improvements that immediately boost productivity, readability, and stability.

### 🎯 Goal
Provide clear, easy-to-understand suggestions that:
- Can be completed quickly (under 4 hours)
- Reduce complexity and maintenance cost
- Make the codebase easier for the team to work with
- Improve reliability without major rewrites
- Give the user confidence about where to start refactoring

---

## 📌 Repository Overview
- Total Files: **{metrics.totalFiles}**
- Total Lines of Code: **{metrics.totalLOC}**
- Technical Debt Score: **{metrics.technicalDebtScore}/100**
  (Higher score = higher ongoing development cost)

---

## 🔍 Quick Win Candidates

### 1. Small but High-Risk Files  
These files are short but have risky patterns — meaning small changes can yield big improvements:

{chr(10).join([f"- {f.path}: Complexity {f.cyclomaticComplexity}, Maintainability {f.maintainabilityIndex}, {f.locTotal} LOC" for f in small_high_risk[:5]])}

### 2. Files with Moderate Complexity  
These files aren't huge but have enough complexity that small refactors can meaningfully improve developer experience:

{chr(10).join([f"- {f.path}: Complexity {f.cyclomaticComplexity}, {f.locTotal} LOC" for f in reducible_complexity[:5]])}

### 3. Overall High-Priority Files  
(Useful for understanding general hotspots)

{chr(10).join([f"- {f.path}: Risk {f.riskScore}" for f in files_data[:10]])}

---

## 🧩 What to Identify  
Find **8–12 Quick Wins** that meet ALL of the following:

1. Can be finished in **under 4 hours**
2. Provide visible improvement (faster reviews, fewer bugs, less confusion)
3. Have **low risk of breaking existing behavior**
4. Require minimal testing effort
5. Can be done independently (no waiting on other modules)
6. Improve the team’s perception of code quality and maintainability

---

## 🏆 High-Impact Quick Win Categories  
Focus on suggestions that developers can understand immediately:

- Extract overly complex functions  
- Add missing or weak error handling  
- Remove unused/dead code  
- Simplify nested or repeated conditional logic  
- Replace magic numbers/strings with constants  
- Improve naming for clarity  
- Reduce unnecessarily deep nesting  
- Add targeted comments or small documentation blocks  
- Improve type safety  
- Split oversized files or components  

---

## 📝 For Each Quick Win, Provide:
- **File or specific area** causing issues  
- **Simple explanation of the pain point** (user should understand it immediately)  
- **Clear action** with the expected improvement  
- **Time estimate** (in hours)  
- **Measurable impact** (complexity drop, review time improvement, risk reduction)  
- **Effort level** (low/medium)  
- **Risk level** + risk mitigation  
- **Step-by-step implementation plan**  
- **Verification method** (how the user confirms success)  
- **Priority score** (1 = highest ROI)

---

## 📦 JSON Response Format

{{
    "quickWins": [
        {{
            "file": "path/to/file",
            "action": "specific refactoring with clear benefit",
            "estimatedTime": "X hours",
            "impact": "complexity X→Y, Z% faster reviews, reduced bug risk",
            "effort": "low|medium",
            "risk": "very low|low - reason",
            "steps": ["step 1", "step 2"],
            "verificationMethod": "how user confirms improvement",
            "priority": 1
        }}
    ],
    "totalEstimatedTime": "X–Y hours total",
    "expectedImpact": "saves Z hours/month, improves developer velocity by W%"
}}
"""
    return prompt
