import json
from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

from ..schemas.analysis_model import AnalysisRequest
from ..analyzer import detect_code_smells, analyze_refactoring_opportunities, generate_architectural_recommendations, generate_overall_assessment, generate_quick_wins
from ..services.llmService import call_llm_claude, call_llm_openai, parse_llm_response

router = APIRouter(prefix="/v2", tags=["llmInsights"])

# @router.get("/health")
# async def health_check():
#     """Health check endpoint"""
#     return {
#         "status": "ok",
#         "service": "ai-code-analysis",
#         "timestamp": datetime.utcnow().isoformat(),
#         "llm": "Claude Sonnet 4.5" if anthropic_client else "Not configured"
#     }

@router.post("/api/analyze")
async def analyze(request: AnalysisRequest):
    """
    Main analysis endpoint
    Receives data from Node.js server and returns AI-powered insights
    """
    try:
        insight_type = request.insightType or "all"
        
        # Extract data
        metrics = request.result
        commit_analysis = request.commitAnalysis
        health_score = request.repoHealthScore
        distributions = request.distributions
        files_data = metrics.refactorPriorityFiles
        
        response = {
            "repoId": request.repoId,
            "repoName": request.repoName or "Unknown",
            "branch": request.branch,
            "timestamp": datetime.utcnow().isoformat(),
            "inputSummary": {
                "healthScore": health_score.overallHealthScore,
                "technicalDebt": metrics.technicalDebtScore,
                "totalFiles": metrics.totalFiles,
                "highRiskFiles": len(files_data)
            },
            "insights": {}
        }
        
        # Generate insights based on requested type
        if insight_type in ["refactoring", "all"]:
            print(f"Generating refactoring suggestions for {len(files_data)} files...")
            response["insights"]["refactoringSuggestions"] = await analyze_refactoring_opportunities(
                files_data,
                metrics
            )
        
        if insight_type in ["code_smell", "all"]:
            print("Detecting code smells...")
            response["insights"]["codeSmells"] = await detect_code_smells(
                files_data,
                health_score
            )
        
        if insight_type in ["architectural", "all"]:
            print("Generating architectural recommendations...")
            response["insights"]["architectural"] = await generate_architectural_recommendations(
                metrics,
                health_score,
                commit_analysis
            )
        
        if insight_type in ["quick_wins", "all"]:
            print("Identifying quick wins...")
            response["insights"]["quickWins"] = await generate_quick_wins(
                files_data,
                metrics
            )
        
        # Overall assessment
        print("Generating overall assessment...")
        response["overallAssessment"] = await generate_overall_assessment(
            metrics,
            health_score,
            commit_analysis,
            distributions
        )
        
        print(f"✅ Analysis complete for repo {request.repoId}")
        print(response)
        return response
        
    except Exception as e:
        print(f"❌ Error in analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate AI insights: {str(e)}"
        )

@router.post("/api/analyze/refactoring-only")
async def analyze_refactoring_only(request: AnalysisRequest):
    """
    Fast endpoint - only refactoring suggestions
    """
    try:
        metrics = request.result
        files_data = metrics.refactorPriorityFiles
        
        suggestions = await analyze_refactoring_opportunities(files_data, metrics)
        
        return {
            "repoId": request.repoId,
            "timestamp": datetime.utcnow().isoformat(),
            "refactoringSuggestions": suggestions,
            "filesAnalyzed": len(files_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/analyze/code-smells-only")
async def analyze_code_smells_only(request: AnalysisRequest):
    """
    Fast endpoint - only code smell detection
    """
    try:
        metrics = request.result
        health_score = request.repoHealthScore
        files_data = metrics.refactorPriorityFiles
        
        smells = await detect_code_smells(files_data, health_score)
        
        return {
            "repoId": request.repoId,
            "timestamp": datetime.utcnow().isoformat(),
            "codeSmells": smells,
            "filesAnalyzed": len(files_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/analyze/quick-wins-only")
async def analyze_quick_wins_only(request: AnalysisRequest):
    """
    Fast endpoint - only quick wins
    """
    try:
        metrics = request.result
        files_data = metrics.refactorPriorityFiles
        
        quick_wins = await generate_quick_wins(files_data, metrics)
        
        return {
            "repoId": request.repoId,
            "timestamp": datetime.utcnow().isoformat(),
            "quickWins": quick_wins,
            "filesAnalyzed": len(files_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/analyze/summary-only")
async def analyze_summary_only(request: AnalysisRequest):
    """
    Fast endpoint - only executive summary
    """
    try:
        metrics = request.result
        health_score = request.repoHealthScore
        commit_analysis = request.commitAnalysis
        distributions = request.distributions
        
        assessment = await generate_overall_assessment(
            metrics,
            health_score,
            commit_analysis,
            distributions
        )
        
        return {
            "repoId": request.repoId,
            "timestamp": datetime.utcnow().isoformat(),
            "assessment": assessment
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/analyze/custom")
async def custom_analysis(
    prompt: str,
    context: Dict[str, Any],
    max_tokens: int = 4000
):
    """
    Custom analysis endpoint for ad-hoc queries
    """
    try:
        full_prompt = f"""Context:
    {json.dumps(context, indent=2)}

User Query:
{prompt}

Provide a detailed analysis based on the context and query above. Format your response as JSON if possible.
"""
        
        llm_response = await call_llm_claude(full_prompt, max_tokens)
        parsed = await parse_llm_response(llm_response)
        
        return {
            "query": prompt,
            "response": parsed,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Custom analysis failed: {str(e)}"
        )