from collections import Counter
from datetime import datetime
from app.schemas.fullrepo_analyze import StaticAnalysisResponse, Halstead, Cyclomatic, Maintainability
from radon.complexity import cc_visit, cc_rank
from radon.metrics import mi_visit, h_visit
from radon.raw import analyze

class analysisClass:

    async def analyze_py_code(path: str, content: str) -> StaticAnalysisResponse:
        raw = analyze(content)

        # --- Cyclomatic complexity
        cc_results = cc_visit(content)
        cyclo = [
            Cyclomatic(
                name=block.name,
                complexity=block.complexity,
                rank=cc_rank(block.complexity)
            )
            for block in cc_results
        ]

        # --- Halstead metrics
        hal = h_visit(content)
        
        # Check if hal is not empty and has the total attribute
        if hal and hasattr(hal, 'total'):
            hal_metrics = hal.total
            halstead = Halstead(
                h1=hal_metrics.h1,
                h2=hal_metrics.h2,
                N1=hal_metrics.N1,
                N2=hal_metrics.N2,
                vocabulary=hal_metrics.vocabulary,
                length=hal_metrics.length,
                volume=hal_metrics.volume,
                difficulty=hal_metrics.difficulty,
                effort=hal_metrics.effort,
                time=hal_metrics.time,
                bugs=hal_metrics.bugs
            )
        else:
            # Provide default values if Halstead analysis fails
            halstead = Halstead(
                h1=0, h2=0, N1=0, N2=0,
                vocabulary=0, length=0, volume=0,
                difficulty=0, effort=0, time=0, bugs=0
            )

        # --- Maintainability index
        mi_score = mi_visit(content, True)  # returns numeric score
        mi_rank = "A" if mi_score >= 20 else "B" if mi_score >= 10 else "C"

        maintainability = Maintainability(mi=mi_score, rank=mi_rank)

        return StaticAnalysisResponse(
            path=path,
            loc=raw.loc,
            lloc=raw.lloc,
            sloc=raw.sloc,
            comments=raw.comments,
            multi=raw.multi,
            blank=raw.blank,
            cyclomatic=cyclo,
            halstead=halstead,
            maintainability=maintainability,
        )


    async def analyze_commits(commits: list):
        try:
            if not commits:
                return {
                    "totalCommits": 0,
                    "topContributors": [],
                    "commitsPerDay": {}
                }
            
            total_commits = len(commits)
            
            # Extract author names (not login, since your structure uses 'name')
            authors = []
            for c in commits:
                author = c.get("author")
                if author and author.get("name"):
                    authors.append(author["name"])
            
            author_stats = Counter(authors)

            # Extract commit dates
            commit_dates = []
            for c in commits:
                try:
                    date_str = c.get("author", {}).get("date")
                    if date_str:
                        # Remove 'Z' and parse
                        date_obj = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                        commit_dates.append(date_obj)
                except (ValueError, AttributeError) as e:
                    print(f"Error parsing date: {e}")
                    continue
            
            commits_per_day = Counter([d.strftime("%Y-%m-%d") for d in commit_dates])
            
            analysis = {
                "totalCommits": total_commits,
                "topContributors": [
                    {"name": name, "count": count} 
                    for name, count in author_stats.most_common(5)
                ],
                "commitsPerDay": dict(commits_per_day),
                "commitsWithAuthors": len(authors)
            }
            
            return analysis
            
        except Exception as e:
            print(f"Error in commit analysis: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                "totalCommits": 0,
                "topContributors": [],
                "commitsPerDay": {}
            }