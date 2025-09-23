from app.schemas.push_analyze import PushAnalyzeRequest, PushAnalyzeResponse
from app.schemas.pull_analyze import PullAnalyzeRequest, PullAnalyzeResponse
import jwt
from typing import Optional, List, Dict, Any
from app.schemas.githubSchema import GitHubSettings
import time
import httpx
from datetime import datetime, timedelta
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.serialization import load_pem_private_key

gs = GitHubSettings()

GITHUB_API_VERSION = "2022-11-28"
GITHUB_APP_ID = gs.github_app_id
GITHUB_PRIVATE_KEY = gs.github_private_key

def _prepare_private_key(pem_content: str) -> str:
    """
    Prepare and validate the private key for JWT signing.
    Handles various PEM formats and ensures proper formatting.
    """
    try:

        pem_content = pem_content.strip()
        
        if not pem_content.startswith('-----BEGIN'):
            raise ValueError("Private key must be in PEM format starting with -----BEGIN")
        
        key_bytes = pem_content.encode('utf-8')
        private_key = load_pem_private_key(key_bytes, password=None)
        
        pem_bytes = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        return pem_bytes.decode('utf-8')
        
    except Exception as e:
        raise ValueError(f"Invalid private key format: {str(e)}")

def _make_app_jwt(app_id: str, pem: str) -> str:
    """
    Create a JWT for GitHub App authentication.
    """
    try:
        # Prepare the private key
        prepared_key = _prepare_private_key(pem)
        
        now = int(time.time())
        payload = {
            "iat": now - 60,         
            "exp": now + 9 * 60,     
            "iss": app_id,           
        }
        
        return jwt.encode(payload, prepared_key, algorithm="RS256")
        
    except Exception as e:
        raise RuntimeError(f"Failed to create JWT token: {str(e)}")

async def get_installation_token(installation_id: int, *, app_id: Optional[str] = None, pem: Optional[str] = None) -> str:
    """
    Get an installation access token for the GitHub App.
    """
    app_id = app_id or GITHUB_APP_ID
    pem = pem or GITHUB_PRIVATE_KEY
    
    if not app_id:
        raise RuntimeError("Missing GitHub App ID")
    if not pem:
        raise RuntimeError("Missing GitHub Private Key")
    
    try:

        jwt_token = _make_app_jwt(app_id, pem)

        url = f"https://api.github.com/app/installations/{installation_id}/access_tokens"
        headers = {
            "Authorization": f"Bearer {jwt_token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": GITHUB_API_VERSION,
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data["token"]
            
    except httpx.HTTPStatusError as e:
        error_detail = ""
        try:
            error_data = e.response.json()
            error_detail = f": {error_data.get('message', 'Unknown error')}"
        except:
            pass
        raise RuntimeError(f"GitHub API error ({e.response.status_code}){error_detail}")
    
    except Exception as e:
        raise RuntimeError(f"Failed to get installation token: {str(e)}")

def _gh_headers(token: str) -> Dict[str, str]:
    """
    Create standard headers for GitHub API requests.
    """
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
    }

async def fetch_commit_diff(owner: str, repo: str, base: str, head: str, token: str) -> Dict[str, Any]:

    url = f"https://api.github.com/repos/{owner}/{repo}/compare/{base}...{head}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.get(url, headers=_gh_headers(token))
        r.raise_for_status()
        return r.json() 
    
async def fetch_recent_commits_touching_file(owner: str, repo: str, path: str, since_iso: str, token: str) -> int:
    url = f"https://api.github.com/repos/{owner}/{repo}/commits"
    params = {"path": path, "since": since_iso, "per_page": 100}
    count = 0
    async with httpx.AsyncClient(timeout=30.0) as client:
        page = 1
        while True:
            rp = dict(params)
            rp["page"] = page
            r = await client.get(url, headers=_gh_headers(token), params=rp)
            r.raise_for_status()
            items = r.json()
            count += len(items)
            if len(items) < 100:
                break
            page += 1
    return count

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

async def llm_explain(commit_msg: str, impacted_files: List[Dict[str, Any]], repo: str) -> str:
    """
    Provide a short rationale for the score and suggestions.
    Input uses only small patches/snippets to keep tokens low.
    """
    # Integrate provider here (OpenAI/Anthropic/local). Keep under rate/token budgets.
    # Return markdown text.
    file_lines = [f"- {f['filename']}: +{f['additions']} -{f['deletions']} risk={f['risk']:.2f}" for f in impacted_files[:10]]
    bullets = "\n".join(file_lines)
    return (
        f"Repo: {repo}\n\n"
        f"Summary of changed files:\n{bullets}\n\n"
        f"Heuristics combine change size, churn, and ownership diffusion to highlight hotspots.\n"
        f"Consider tests for complex modules and refactor high-risk files first."
    )


# ----- main entrypoints -----

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
# Comparisons and derived summaries are consistent with REST interactions for checks and analysis. [web:13]

async def seed_prioritization(req: PushAnalyzeRequest, impact: Dict[str, Any]) -> Dict[str, Any]:
    """
    Rank refactor candidates by business impact (risk), effort (size), risk of breakage, and dependency.
    """
    # Simple prioritization: risk high, size moderate => high priority; huge size lowers priority due to effort.
    ranked = []
    for f in impact["impactedFiles"]:
        size = f["additions"] + f["deletions"]
        effort = normalize(size, 0, 800)          # effort proxy
        breakage_risk = f["risk"]                 # reuse risk
        priority = 0.6 * breakage_risk + 0.3 * (1.0 - effort) + 0.1 * f["ownershipRisk"]
        ranked.append({**f, "effort": effort, "priority": priority})
    ranked.sort(key=lambda x: x["priority"], reverse=True)
    # Map to top suggestions
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

async def push_analyze_repo(req: PushAnalyzeRequest) -> PushAnalyzeResponse:
    impact = await seed_impact(req)
    prio = await seed_prioritization(req, impact)

    score = float(impact["score"])
    ok = score < req.threshold  
    message = f"Analyzed {req.repo} on {req.branch}. Impact={score:.2f}, threshold={req.threshold:.2f}."

    print(message, impact, prio)
    return PushAnalyzeResponse(ok=ok, score=score, message=message)






def pull_analyze_repo(payload: PullAnalyzeRequest) -> PullAnalyzeResponse:
    return PullAnalyzeResponse(
        ok=True,
        message=f"Analyzed {payload.repo} on {payload.branch}",
    )