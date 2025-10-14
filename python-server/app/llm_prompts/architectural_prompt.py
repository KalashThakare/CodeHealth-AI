from typing import List
from ..schemas.analysis_model import RepoMetrics, RepoHealthScore, CommitAnalysis

def build_architectural_prompt(metrics: RepoMetrics, health_score: RepoHealthScore, commit_analysis: CommitAnalysis) -> str:
    """Build prompt for architectural recommendations"""
    
    avg_file_size = metrics.totalLOC / max(metrics.totalFiles, 1)
    
    prompt = f"""You are a software architect analyzing a codebase for architectural improvements.

Repository Metrics:
- Overall Health Score: {health_score.overallHealthScore}/100
- Technical Debt: {metrics.technicalDebtScore}/100
- Total Files: {metrics.totalFiles}
- Total LOC: {metrics.totalLOC}
- Average File Size: {int(avg_file_size)} LOC
- Health Rating: {health_score.healthRating}

Code Quality Metrics:
- Avg Cyclomatic Complexity: {metrics.avgCyclomaticComplexity}
- Weighted Complexity: {metrics.weightedCyclomaticComplexity}
- Avg Maintainability: {metrics.avgMaintainabilityIndex}
- Weighted Maintainability: {metrics.weightedMaintainabilityIndex}

Development Patterns:
- Total Commits: {commit_analysis.totalCommits}
- Contributors: {commit_analysis.contributorCount}
- Bus Factor: {commit_analysis.busFactor}
- Velocity Trend: {commit_analysis.velocity.trend}
- Consistency Score: {commit_analysis.velocity.consistency}
- Recent Activity (30 days): {commit_analysis.recentCommits30Days} commits

Current Strengths:
{chr(10).join([f"- {s}" for s in health_score.strengths])}

Current Weaknesses:
{chr(10).join([f"- {w}" for w in health_score.weaknesses])}

Provide comprehensive architectural recommendations covering:

1. **Architecture Assessment**
   - Current architecture evaluation
   - Scalability concerns
   - Maintainability issues

2. **Module/Component Organization**
   - File structure improvements
   - Component boundaries
   - Separation of concerns

3. **Design Patterns & Principles**
   - SOLID principles adherence
   - Design patterns to implement
   - Anti-patterns to avoid

4. **Code Organization Strategy**
   - Frontend organization (React best practices)
   - Backend organization (Node.js patterns)
   - Shared code management

5. **Testing Strategy**
   - Unit testing approach
   - Integration testing needs
   - Test coverage targets

6. **Development Workflow**
   - Code review process
   - Git workflow improvements
   - CI/CD enhancements

7. **Technical Debt Management**
   - Debt reduction roadmap
   - Refactoring priorities
   - Time allocation strategy

8. **Team & Knowledge Sharing**
   - Documentation strategy
   - Onboarding improvements
   - Knowledge distribution (address bus factor)

9. **Performance & Scalability**
   - Performance optimization areas
   - Scalability considerations
   - Resource management

10. **Long-term Strategy**
    - 3-month roadmap
    - 6-month goals
    - Technical vision

For each recommendation, include:
- Area of concern
- Current state analysis
- Recommended approach with specifics
- Expected benefits (measurable)
- Implementation priority
- Estimated timeline
- Dependencies
- Success metrics

Format as JSON:
{{
    "architecturalRecommendations": [
        {{
            "area": "Module Organization",
            "currentState": "detailed analysis",
            "recommendation": "specific actionable recommendation",
            "benefits": ["benefit1", "benefit2"],
            "priority": "critical",
            "timeline": "2-4 weeks",
            "dependencies": ["dep1"],
            "successMetrics": ["metric1", "metric2"]
        }}
    ],
    "strategicRoadmap": {{
        "immediate": ["action1", "action2"],
        "shortTerm": ["action3"],
        "longTerm": ["action4"]
    }},
    "overallStrategy": "high-level strategic direction"
}}
"""
    return prompt