from typing import List
from ..schemas.analysis_model import RefactorPriorityFile, RepoHealthScore

def build_code_smell_prompt(files_data: List[RefactorPriorityFile], health_score: RepoHealthScore) -> str:
    """Build prompt for detecting code smells with production-risk context (user-friendly version)"""
    
    high_complexity = [f for f in files_data if f.cyclomaticComplexity > 15]
    low_maintainability = [f for f in files_data if f.maintainabilityIndex < 30]
    large_files = [f for f in files_data if f.locTotal > 300]

    prompt = f"""
You are analyzing this repository as a **code quality expert** and **production risk specialist**.  
Your goal is to help the developer clearly understand **what is wrong**, **why it matters**, and **how to fix it** — in simple, practical, and highly useful language.

---

# 🎯 Purpose of This Analysis
Identify **code smells** and patterns that:
- increase production incident risk,
- slow down development and reviews,
- increase maintenance cost,
- create frustration or burnout for the team,
- reduce the overall health and longevity of the codebase.

Your insights should feel like a helpful expert explaining the key problem areas in the repo.

---

# 🧠 Repository Health Overview
- **Overall Health Score:** {health_score.overallHealthScore}/100  
- **Health Rating:** {health_score.healthRating}

### Component Scores
- Code Quality: **{health_score.componentScores.codeQuality}/100**
- Development Activity: **{health_score.componentScores.developmentActivity}/100**
- Bus Factor: **{health_score.componentScores.busFactor}/100**

### Strengths
{', '.join(health_score.strengths)}

### Weaknesses
{', '.join(health_score.weaknesses)}

---

# 🔥 Key Risk Indicators
- High-complexity files (>15): **{len(high_complexity)}**  
  → Higher bug probability  
- Low maintainability (<30): **{len(low_maintainability)}**  
  → Slow feature development and onboarding  
- Large files (>300 LOC): **{len(large_files)}**  
  → Knowledge bottlenecks and high review fatigue  

---

# 🗂️ Top High-Risk Files
These are the files where code smells are most likely to appear:

{chr(10).join([f"- {f.path} (Risk: {f.riskScore}, Complexity: {f.cyclomaticComplexity}, Maintainability: {f.maintainabilityIndex})" for f in files_data[:8]])}

---

# 🧩 Code Smells You Should Detect
Focus on smells that directly impact **business reliability** and **developer experience**:

1. **God Classes / God Objects** — extremely large files doing too much  
2. **Long Methods/Functions** — hard to test, harder to understand  
3. **Feature Envy** — code depending too heavily on other modules  
4. **Duplicate Code** — repeated logic that increases bug surface area  
5. **Tight Coupling** — changes in one place break others  
6. **Low Cohesion** — file functions don’t belong together  
7. **Magic Numbers / Strings** — configuration risks & hidden assumptions  
8. **Dead Code** — outdated code increasing noise  
9. **Primitive Obsession** — missing domain models, weak type safety  
10. **Other smells** affecting stability, performance, or velocity  

---

# 📝 For Each Code Smell, Provide:
Your explanation must be:
- beginner-friendly,
- technically correct,
- tailored to this repo,
- actionable with clear next steps.

For each smell, include:

### ✔ Smell name  
### ✔ Category (Bloaters, Couplers, Change Preventers, etc.)  
### ✔ Description with examples from the actual repo  
### ✔ Severity (critical/high/medium/low)  
### ✔ Affected file paths  
### ✔ Root cause (e.g., rapid scaling, lack of abstractions, rushed deadlines)  
### ✔ Recommended fix (clear, step-by-step)  
### ✔ Business impact  
- Production risk (%)  
- Developer hours wasted per month  
- Impact on stability and delivery time  

### ✔ Estimated fix time with ROI  
Example: “4 hours fix → saves 12 hours/month in review time.”

---

# 📦 JSON Response Format

{{
    "codeSmells": [
        {{
            "smell": "string",
            "category": "Bloaters|Object-Oriented Design Problems|Change Preventers|Dispensables|Couplers",
            "description": "clear explanation with real examples from this repo",
            "severity": "critical|high|medium|low",
            "affectedFiles": ["path/to/file"],
            "rootCause": "likely reason this developed",
            "recommendation": "specific step-by-step fix",
            "impact": "production risk %, developer hours lost, burnout indicators",
            "estimatedFixTime": "X hours or Y days + expected monthly ROI"
        }}
    ],
    "overallCodeHealth": "summary of repo quality, velocity expectations, and risk level"
}}
"""
    return prompt
