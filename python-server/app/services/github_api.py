from typing import Optional, List, Dict, Any
import httpx
from app.services.github_auth import _gh_headers
import base64

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

async def fetch_repo_code(owner:str, repo:str, branch:str, token:str, exts=(".py", ".js", ".ts")):
    headers = _gh_headers(token)

    async with httpx.AsyncClient(timeout=30.0) as client:
        url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
        r = await client.get(url, headers = headers)
        r.raise_for_status()
        tree = r.json()["tree"]

        files = []
        for item in tree:
            if item["type"] == "blob" and item["path"].endswith(exts):
                blob_url = f"https://api.github.com/repos/{owner}/{repo}/git/blobs/{item['sha']}"
                rb = await client.get(blob_url, headers=headers)
                rb.raise_for_status()
                blob = rb.json()

                content = base64.b64decode(blob["content"]).decode("utf-8", errors="ignore")
                files.append({
                    "path": item["path"],
                    "content": content
                })

        return files