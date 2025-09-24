from app.schemas.push_analyze import PushAnalyzeRequest, PushAnalyzeResponse
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from app.services.github_auth import get_installation_token, _gh_headers
from app.services.github_api import fetch_commit_diff, fetch_recent_commits_touching_file

def normalize(v: float, lo: float, hi: float) -> float:
    if hi <= lo:
        return 0.0
    return max(0.0, min(1.0, (v - lo) / (hi - lo)))

def calc_file_score(additions: int, deletions: int, churn: int, ownership_risk: float) -> float:
    size = additions + deletions
    s_size = normalize(size, 0, 400)        # cap at ~400 lines changed
    s_churn = normalize(churn, 0, 20)       # cap recent churn at 20 commits
    s_owner = max(0.0, min(1.0, ownership_risk))
    # Weighted risk score
    return 0.5 * s_size + 0.3 * s_churn + 0.2 * s_owner

def summarize_repo_score(file_scores: List[float]) -> float:
    if not file_scores:
        return 0.0
    # Use top-k mean to emphasize hotspots
    k = max(1, min(5, len(file_scores)//2))
    topk = sorted(file_scores, reverse=True)[:k]
    return sum(topk) / len(topk)

async def estimate_ownership_risk(owner: str, repo: str, path: str, token: str, window_days: int = 120) -> float:
    since = (datetime.utcnow() - timedelta(days=window_days)).isoformat() + "Z"
    commits = await fetch_recent_commits_touching_file(owner, repo, path, since, token)
    # If many recent commits, ownership likely diffuse; else low risk.
    # Map commit count 0..20+ -> 0..1
    return normalize(commits, 0, 20)

async def seed_impact(req: PushAnalyzeRequest) -> Dict[str, Any]:
    owner, repo = req.repo.split("/", 1)
    token = await get_installation_token(req.installationId or 0)

    base = f"{req.branch}~1"    # simple heuristic; or use payload.before
    head = req.headCommitSha or req.branch
    cmp = await fetch_commit_diff(owner, repo, base, head, token)

    files = cmp.get("files", [])
    print("******** \n",files)
    impacted: List[Dict[str, Any]] = []
    # Compute per-file metrics
    for f in files:
        filename = f.get("filename")
        additions = f.get("additions", 0)
        deletions = f.get("deletions", 0)
        churn = await fetch_recent_commits_touching_file(owner, repo, filename,
                                                         (datetime.utcnow()-timedelta(days=60)).isoformat()+"Z",
                                                         token)
        owner_risk = await estimate_ownership_risk(owner, repo, filename, token)
        risk = calc_file_score(additions, deletions, churn, owner_risk)
        impacted.append({
            "filename": filename,
            "additions": additions,
            "deletions": deletions,
            "churn": churn,
            "ownershipRisk": owner_risk,
            "risk": risk,
        })

    # Aggregate project-level impact metrics
    score = summarize_repo_score([x["risk"] for x in impacted])
    # explanation = await llm_explain(req.commits[0].message if req.commits else "", impacted, req.repo)

    # Persist BusinessImpact somewhere and emit event (omitted)
    return {
        "score": score,
        "impactedFiles": impacted,
        # "explanation": explanation,
    }