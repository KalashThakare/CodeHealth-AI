from typing import Optional, List, Dict, Any
import httpx
from app.services.github_auth import _gh_headers

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