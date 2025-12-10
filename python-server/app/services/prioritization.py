from app.schemas.push_analyze import PushAnalyzeRequest, PushAnalyzeResponse
from typing import Optional, List, Dict, Any
from app.services.impact_analyzer import normalize

async def seed_prioritization(req: PushAnalyzeRequest, impact: Dict[str, Any]) -> Dict[str, Any]:
    ranked = []
    for f in impact["impactedFiles"]:
        size = f["additions"] + f["deletions"]
        effort = normalize(size, 0, 800)          
        breakage_risk = f["risk"]             
        priority = 0.6 * breakage_risk + 0.3 * (1.0 - effort) + 0.1 * f["ownershipRisk"]
        ranked.append({**f, "effort": effort, "priority": priority})
    ranked.sort(key=lambda x: x["priority"], reverse=True)
    suggestions = [
        {
            "file": r["filename"],
            "priority": round(r["priority"], 2),
            "why": f"High risk {r['risk']:.2f}, moderate effort {r['effort']:.2f}, churn {r['churn']}",
            "action": "Add tests and refactor complex sections"
        }
        for r in ranked[:10]
    ]
    return {"candidates": suggestions}