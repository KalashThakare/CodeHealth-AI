from typing import List, Dict, Any

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