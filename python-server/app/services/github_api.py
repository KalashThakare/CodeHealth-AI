from typing import Optional, List, Dict, Any
import httpx, aiohttp
from app.services.github_auth import _gh_headers
import base64

GITHUB_API = "https://api.github.com/"

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
    
async def get_all_commits(owner: str, repo: str, token: str):
    url = f"{GITHUB_API}/repos/{owner}/{repo}/commits"
    headers = _gh_headers(token)
    commits = []
    page = 1

    async with aiohttp.ClientSession() as session:
        while True:
            params = {"per_page": 100, "page": page}
            async with session.get(url, headers=headers, params=params) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    raise Exception(f"GitHub API error {resp.status}: {text}")
                
                data = await resp.json()
                if not data: 
                    break

                commits.extend(data)
                page += 1

    return commits

async def get_all_issues(owner: str, repo: str, token: str):
    url = f"{GITHUB_API}/repos/{owner}/{repo}/issues"
    headers = _gh_headers(token)
    all_issues = []
    page = 1

    async with aiohttp.ClientSession() as session:
        while True:
            params = {"per_page": 100, "page": page, "state": "all"}
            async with session.get(url, headers=headers, params=params) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    raise Exception(f"GitHub API error {resp.status}: {text}")

                data = await resp.json()
                if not data:
                    break

                # Filter out PRs
                filtered = [issue for issue in data if "pull_request" not in issue]
                all_issues.extend(filtered)
                page += 1

    open_issues = [i for i in all_issues if i["state"] == "open"]
    closed_issues = [i for i in all_issues if i["state"] == "closed"]

    return {
        "all": all_issues,
        "open": open_issues,
        "closed": closed_issues
    }

async def get_all_pr(owner:str, repo:str, token:str):
    url = f"{GITHUB_API}/repos/{owner}/{repo}/pulls"
    headers = _gh_headers(token)
    all_prs = []
    page = 1

    async with aiohttp.ClientSession() as session:
        while True:
            params = {"per_page": 100, "page": page, "state": "all"}
            async with session.get(url, headers=headers, params=params) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    raise Exception(f"GitHub API error {resp.status}: {text}")
                
                data = await resp.json()
                if not data:
                    break

                all_prs.extend(data)
                page += 1

        # Separate by state
        open_prs = [pr for pr in all_prs if pr["state"] == "open"]
        closed_prs = [pr for pr in all_prs if pr["state"] == "closed" and pr.get("merged_at") is None]
        merged_prs = [pr for pr in all_prs if pr.get("merged_at") is not None]

    return {
        "all": all_prs,
        "open": open_prs,
        "closed": closed_prs,
        "merged": merged_prs
    }

async def get_all_contributors(owner: str, repo: str, token: str):
    url = f"{GITHUB_API}/repos/{owner}/{repo}/contributors"
    headers = _gh_headers(token)
    contributors = []
    page = 1

    async with aiohttp.ClientSession() as session:
        while True:
            params = {"per_page": 100, "page": page}
            async with session.get(url, headers=headers, params=params) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    raise Exception(f"GitHub API error {resp.status}: {text}")

                data = await resp.json()
                if not data:
                    break

                contributors.extend(data)
                page += 1

    total_contributors = len(contributors)
    top_contributor = contributors[0] if contributors else None
    total_commits = sum(c["contributions"] for c in contributors)
    top_share_percent = (
        (top_contributor["contributions"] / total_commits) * 100 if top_contributor else 0
    )

    return {
        "contributors": contributors,
        "total_contributors": total_contributors,
        "top_contributor": top_contributor,
        "top_share_percent": top_share_percent
    }

async def get_all_releases(owner: str, repo: str, token: str):
    url = f"https://api.github.com/repos/{owner}/{repo}/releases"
    headers = _gh_headers(token)
    releases = []
    page = 1

    async with aiohttp.ClientSession() as session:
        while True:
            params = {"per_page": 100, "page": page}
            async with session.get(url, headers=headers, params=params) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    raise Exception(f"GitHub API error {resp.status}: {text}")
                data = await resp.json()
                if not data:
                    break
                releases.extend(data)
                page += 1

    return releases

async def get_repo_metadata(owner: str, repo: str, token: str):
    url = f"https://api.github.com/repos/{owner}/{repo}"
    headers = _gh_headers(token)

    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as resp:
            if resp.status != 200:
                text = await resp.text()
                raise Exception(f"GitHub API error {resp.status}: {text}")

            data = await resp.json()

    metadata = {
        "stars": data.get("stargazers_count"),
        "forks": data.get("forks_count"),
        "watchers": data.get("watchers_count"),
        "license": data.get("license")["name"] if data.get("license") else None,
        "default_branch": data.get("default_branch"),
        "visibility": "private" if data.get("private") else "public"
    }
    return metadata

