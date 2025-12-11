from typing import List, Dict, Any

async def llm_explain(commit_msg: str, impacted_files: List[Dict[str, Any]], repo: str) -> str:
    
    file_lines = [f"- {f['filename']}: +{f['additions']} -{f['deletions']} risk={f['risk']:.2f}" for f in impacted_files[:10]]
    bullets = "\n".join(file_lines)
    return (
        f"Repo: {repo}\n\n"
        f"Summary of changed files:\n{bullets}\n\n"
        f"Heuristics combine change size, churn, and ownership diffusion to highlight hotspots.\n"
        f"Consider tests for complex modules and refactor high-risk files first."
    )