from typing import Optional, List, Dict, Any
import httpx, aiohttp
from app.services.github_auth import _gh_headers
import base64
import logging

logger = logging.getLogger(__name__)

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

async def fetch_repo_code(owner:str, repo:str, branch:str, token:str, exts=(".py", ".js", ".ts", ".tsx", ".jsx")):
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
    
async def fetch_changed_files_code(repoFullName: str, repoId: str, token: str, addedFiles: List, modifiedFiles: List):
    headers = _gh_headers(token)
    files = []
    
    try:
        # Combine added and modified files (both need to be fetched)
        all_files_to_fetch = list(set(addedFiles) | set(modifiedFiles))
        
        for file_path in all_files_to_fetch:
            try:
                # Check if file should be analyzed (skip binaries, large files, etc.)
                if not _should_analyze_file(file_path):
                    print(f"Skipping {file_path} - not analyzable")
                    continue
                
                # Construct GitHub API URL to fetch raw file content
                url = f"https://api.github.com/repos/{repoFullName}/contents/{file_path}"
                
                async with aiohttp.ClientSession() as session:
                    async with session.get(url, headers=headers) as response:
                        if response.status == 200:
                            data = await response.json()
                            
                            # GitHub returns base64 encoded content
                            if data.get('encoding') == 'base64' and 'content' in data:
                                import base64
                                content = base64.b64decode(data['content']).decode('utf-8')
                                
                                files.append({
                                    'path': file_path,
                                    'content': content,
                                    'size': data.get('size', 0),
                                    'sha': data.get('sha'),
                                    'status': 'added' if file_path in addedFiles else 'modified'
                                })
                            else:
                                print(f"Unexpected encoding for {file_path}: {data.get('encoding')}")
                        
                        elif response.status == 404:
                            print(f"File not found: {file_path}")
                        
                        elif response.status == 403:
                            print(f"Rate limit or permission issue for {file_path}")
                            # Optional: break or wait
                        
                        else:
                            print(f"Failed to fetch {file_path}: status {response.status}")
            
            except Exception as file_error:
                print(f"Error fetching {file_path}: {str(file_error)}")
                continue
        
        return files
    
    except Exception as e:
        print(f"Error in fetch_changed_files_code: {str(e)}")
        return []


def _should_analyze_file(file_path: str) -> bool:
    """Check if file should be analyzed based on extension and path"""
    analyzable_extensions = {
        '.js', '.jsx', '.ts', '.tsx',
        '.py'
    }
    
    skip_patterns = [
        'node_modules/', '.git/', 'dist/', 'build/',
        'vendor/', '__pycache__/', '.min.js', '.bundle.js'
    ]
    
    # Skip if matches any skip pattern
    if any(pattern in file_path for pattern in skip_patterns):
        return False
    
    # Check if file has analyzable extension
    return any(file_path.endswith(ext) for ext in analyzable_extensions)


async def get_all_commits(owner: str, repo: str, token: str):
    url = f"{GITHUB_API}repos/{owner}/{repo}/commits"
    headers = _gh_headers(token)
    commits = []
    page = 1

    logger.info(f"Fetching commits for {owner}/{repo}")
    logger.debug(f"Request URL: {url}")

    async with aiohttp.ClientSession() as session:
        while True:
            params = {"per_page": 100, "page": page}
            async with session.get(url, headers=headers, params=params) as resp:
                logger.debug(f"Commits API response status: {resp.status}")
                
                if resp.status == 409:
                    # Repository is empty (Git repository not initialized)
                    logger.warning(f"Repository {owner}/{repo} is empty (409 Conflict)")
                    text = await resp.text()
                    logger.debug(f"Response body: {text}")
                    return []
                    
                if resp.status == 404:
                    # Repository not found or no commits
                    logger.warning(f"Repository {owner}/{repo} not found or no access (404)")
                    text = await resp.text()
                    logger.debug(f"Response body: {text}")
                    return []
                    
                if resp.status != 200:
                    text = await resp.text()
                    logger.error(f"GitHub API error {resp.status}: {text}")
                    raise Exception(f"GitHub API error {resp.status}: {text}")
                
                data = await resp.json()
                logger.info(f"Fetched {len(data)} commits on page {page}")
                
                if not data: 
                    break

                # Extract only necessary commit data
                for commit in data:
                    commits.append({
                        "sha": commit["sha"],
                        "message": commit["commit"]["message"],
                        "author": {
                            "name": commit["commit"]["author"]["name"],
                            "email": commit["commit"]["author"]["email"],
                            "date": commit["commit"]["author"]["date"]
                        },
                        "committer": {
                            "name": commit["commit"]["committer"]["name"],
                            "date": commit["commit"]["committer"]["date"]
                        }
                    })
                
                page += 1

    logger.info(f"Total commits fetched: {len(commits)}")
    return commits

async def get_all_issues(owner: str, repo: str, token: str):
    url = f"{GITHUB_API}repos/{owner}/{repo}/issues"
    headers = _gh_headers(token)
    all_issues = []
    page = 1

    logger.info(f"Fetching issues for {owner}/{repo}")

    async with aiohttp.ClientSession() as session:
        while True:
            params = {"per_page": 100, "page": page, "state": "all"}
            async with session.get(url, headers=headers, params=params) as resp:
                logger.debug(f"Issues API response status: {resp.status}")
                
                if resp.status == 404:
                    logger.warning(f"Issues endpoint returned 404 for {owner}/{repo}")
                    return {"all": [], "open": [], "closed": []}
                    
                if resp.status == 410:
                    # Issues are disabled for this repository
                    logger.warning(f"Issues are disabled for {owner}/{repo}")
                    return {"all": [], "open": [], "closed": []}
                    
                if resp.status != 200:
                    text = await resp.text()
                    logger.error(f"GitHub API error {resp.status}: {text}")
                    raise Exception(f"GitHub API error {resp.status}: {text}")

                data = await resp.json()
                if not data:
                    break

                # Filter out PRs
                filtered = [issue for issue in data if "pull_request" not in issue]
                all_issues.extend(filtered)
                logger.info(f"Fetched {len(filtered)} issues on page {page}")
                page += 1

    open_issues = [i for i in all_issues if i["state"] == "open"]
    closed_issues = [i for i in all_issues if i["state"] == "closed"]

    logger.info(f"Total issues: {len(all_issues)} (open: {len(open_issues)}, closed: {len(closed_issues)})")

    return {
        "all": all_issues,
        "open": open_issues,
        "closed": closed_issues
    }

async def get_all_pr(owner:str, repo:str, token:str):
    url = f"{GITHUB_API}repos/{owner}/{repo}/pulls"
    headers = _gh_headers(token)
    all_prs = []
    page = 1

    logger.info(f"Fetching PRs for {owner}/{repo}")

    async with aiohttp.ClientSession() as session:
        while True:
            params = {"per_page": 100, "page": page, "state": "all"}
            async with session.get(url, headers=headers, params=params) as resp:
                logger.debug(f"PRs API response status: {resp.status}")
                
                if resp.status == 404:
                    logger.warning(f"PRs endpoint returned 404 for {owner}/{repo}")
                    return {"all": [], "open": [], "closed": [], "merged": []}
                    
                if resp.status != 200:
                    text = await resp.text()
                    logger.error(f"GitHub API error {resp.status}: {text}")
                    raise Exception(f"GitHub API error {resp.status}: {text}")
                
                data = await resp.json()
                if not data:
                    break

                all_prs.extend(data)
                logger.info(f"Fetched {len(data)} PRs on page {page}")
                page += 1

    # Separate by state
    open_prs = [pr for pr in all_prs if pr["state"] == "open"]
    closed_prs = [pr for pr in all_prs if pr["state"] == "closed" and pr.get("merged_at") is None]
    merged_prs = [pr for pr in all_prs if pr.get("merged_at") is not None]

    logger.info(f"Total PRs: {len(all_prs)} (open: {len(open_prs)}, closed: {len(closed_prs)}, merged: {len(merged_prs)})")

    return {
        "all": all_prs,
        "open": open_prs,
        "closed": closed_prs,
        "merged": merged_prs
    }

async def get_all_contributors(owner: str, repo: str, token: str):
    url = f"{GITHUB_API}repos/{owner}/{repo}/contributors"
    headers = _gh_headers(token)
    contributors_raw = []
    page = 1

    logger.info(f"Fetching contributors for {owner}/{repo}")
    logger.debug(f"Request URL: {url}")

    async with aiohttp.ClientSession() as session:
        while True:
            params = {"per_page": 100, "page": page}
            async with session.get(url, headers=headers, params=params) as resp:
                logger.debug(f"Contributors API response status: {resp.status}")

                if resp.status == 404:
                    logger.warning(f"Contributors endpoint returned 404 for {owner}/{repo}")
                    text = await resp.text()
                    logger.debug(f"Response body: {text}")
                    return {
                        "contributors": [],
                        "total_contributors": 0,
                    }

                if resp.status == 409:
                    logger.warning(f"Repository {owner}/{repo} is empty (409 Conflict)")
                    return {
                        "contributors": [],
                        "total_contributors": 0,
                    }

                if resp.status != 200:
                    text = await resp.text()
                    logger.error(f"GitHub API error {resp.status}: {text}")
                    raise Exception(f"GitHub API error {resp.status}: {text}")

                data = await resp.json()
                if not data:
                    break

                contributors_raw.extend(data)
                logger.info(f"Fetched {len(data)} contributors on page {page}")
                page += 1

    # Normalize each contributor’s essential details and contributions count
    contributors = []
    for c in contributors_raw:
        contributors.append({
            "login": c.get("login") or c.get("name"),  # anon entries may not have login
            "id": c.get("id"),
            "type": c.get("type"),
            "avatar_url": c.get("avatar_url"),
            "html_url": c.get("html_url"),
            "contributions": c.get("contributions", 0),
        })

    total_contributors = len(contributors)

    logger.info(f"Total contributors: {total_contributors}")

    return {
        "contributors": contributors,
        "total_contributors": total_contributors,
    }

async def get_all_releases(owner: str, repo: str, token: str):
    url = f"https://api.github.com/repos/{owner}/{repo}/releases"
    headers = _gh_headers(token)
    releases = []
    page = 1

    logger.info(f"Fetching releases for {owner}/{repo}")

    async with aiohttp.ClientSession() as session:
        while True:
            params = {"per_page": 100, "page": page}
            async with session.get(url, headers=headers, params=params) as resp:
                logger.debug(f"Releases API response status: {resp.status}")
                
                if resp.status == 404:
                    logger.warning(f"Releases endpoint returned 404 for {owner}/{repo}")
                    return []
                    
                if resp.status != 200:
                    text = await resp.text()
                    logger.error(f"GitHub API error {resp.status}: {text}")
                    raise Exception(f"GitHub API error {resp.status}: {text}")
                    
                data = await resp.json()
                if not data:
                    break
                    
                releases.extend(data)
                logger.info(f"Fetched {len(data)} releases on page {page}")
                page += 1

    logger.info(f"Total releases: {len(releases)}")
    return releases

async def get_repo_metadata(owner: str, repo: str, token: str):
    url = f"https://api.github.com/repos/{owner}/{repo}"
    headers = _gh_headers(token)

    logger.info(f"Fetching metadata for {owner}/{repo}")
    logger.debug(f"Request URL: {url}")

    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as resp:
            logger.debug(f"Metadata API response status: {resp.status}")
            
            if resp.status != 200:
                text = await resp.text()
                logger.error(f"GitHub API error {resp.status}: {text}")
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
    
    logger.info(f"Metadata: {metadata}")
    return metadata