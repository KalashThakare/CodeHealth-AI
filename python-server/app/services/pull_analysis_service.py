async def analyze_pr_opened(files: list[dict]) -> dict:
    
    # Basic metrics
    total_add = sum(f.get("additions", 0) for f in files)
    total_del = sum(f.get("deletions", 0) for f in files)
    file_count = len(files)
    
    # Separate files by status
    added_files = [f for f in files if f.get("status") == "added"]
    modified_files = [f for f in files if f.get("status") == "modified"]
    removed_files = [f for f in files if f.get("status") == "removed"]
    renamed_files = [f for f in files if f.get("status") == "renamed"]

    # Calculate complexity score (0-100)
    complexity = min(100, (file_count * 5) + (total_add / 2) + (total_del / 3))

    # Calculate risk score (0-100)
    risk = 0
    
    # File count risk
    if file_count > 20:
        risk += 30
    elif file_count > 10:
        risk += 20
    
    # Lines changed risk
    if total_add > 1000:
        risk += 40
    elif total_add > 500:
        risk += 30
    
    # Critical file patterns
    critical_patterns = {
        "auth": 20,
        "security": 20,
        "config": 15,
        "database": 15,
        "migration": 15,
        ".env": 25,
        "dockerfile": 10,
        "package.json": 10,
        "requirements.txt": 10,
    }
    
    for f in files:
        filename = f.get("filename", "").lower()
        for pattern, score in critical_patterns.items():
            if pattern in filename:
                risk += score
                break
    
    risk = min(100, risk + complexity * 0.3)

    if risk < 30:
        criticality = "low"
    elif risk < 70:
        criticality = "medium"
    else:
        criticality = "high"

    impact_dirs = [f.get("filename", "") for f in files]
    
    file_extensions = list({
        f.get("filename", "").split(".")[-1]
        for f in files
        if "." in f.get("filename", "")
    })

    has_tests = any("test" in f.get("filename", "").lower() for f in files)
    has_code_changes = any(
        f.get("filename", "").endswith((".js", ".py", ".ts", ".jsx", ".tsx", ".java", ".go"))
        for f in files
        if f.get("status") in ["added", "modified"]
    )
    missingTests = has_code_changes and not has_tests

    # Check for missing documentation
    has_docs = any(
        any(keyword in f.get("filename", "").lower() for keyword in ["readme", "doc", ".md"])
        for f in files
    )
    missingDocs = file_count > 5 and not has_docs

    # Security warnings
    securityWarnings = []
    
    # Check for sensitive files
    sensitive_patterns = ["secret", "password", "private_key", "api_key", ".env", "credentials", "token"]
    for f in files:
        filename = f.get("filename", "").lower()
        for pattern in sensitive_patterns:
            if pattern in filename:
                securityWarnings.append(f"⚠️ Sensitive file: {f.get('filename')}")
                break
    
    # Check for hardcoded secrets in patches (if available)
    secret_keywords = ["password", "api_key", "secret", "token", "private_key"]
    for f in files:
        patch = f.get("patch", "")
        if patch:
            patch_lower = patch.lower()
            for keyword in secret_keywords:
                if keyword in patch_lower and "=" in patch:
                    securityWarnings.append(f"🔒 Potential hardcoded secret in: {f.get('filename')}")
                    break
    
    # Check for database changes without migrations
    has_db_changes = any("model" in f.get("filename", "").lower() or "schema" in f.get("filename", "").lower() for f in files)
    has_migrations = any("migration" in f.get("filename", "").lower() for f in files)
    if has_db_changes and not has_migrations:
        securityWarnings.append("⚠️ Database schema changes detected without migrations")

    # Generate suggestions
    suggestions = []
    
    if missingTests:
        suggestions.append("Add unit tests for the modified code")
    
    if missingDocs:
        suggestions.append("Update documentation to reflect changes")
    
    if risk > 70:
        suggestions.append("High risk PR - consider splitting into smaller changes")
    elif risk > 50:
        suggestions.append("Medium-high risk - request additional reviewers")
    
    if total_add > 500:
        suggestions.append("Large code additions - ensure code review coverage")
    
    if file_count > 15:
        suggestions.append(f"PR touches {file_count} files - consider breaking into focused PRs")
    
    if len(added_files) > 10:
        suggestions.append(f"{len(added_files)} new files added - verify they follow project structure")
    
    if len(removed_files) > 0:
        suggestions.append(f"{len(removed_files)} files removed - ensure no breaking changes")
    
    if securityWarnings:
        suggestions.append("Security review recommended due to sensitive file changes")

    # Recommend reviewers based on impact areas
    recommendedReviewers = []
    reviewer_map = {
        "backend": ["backend-team"],
        "frontend": ["frontend-team"],
        "api": ["api-team"],
        "database": ["database-team"],
        "security": ["security-team"],
        "infrastructure": ["devops-team"],
    }
    
    for area in impact_dirs:
        for key, reviewers in reviewer_map.items():
            if key in area.lower():
                recommendedReviewers.extend(reviewers)
    
    recommendedReviewers = list(set(recommendedReviewers)) 

    return {
        "riskScore": round(risk, 2),
        "complexityScore": round(complexity, 2),
        "impactAreas": impact_dirs,
        "fileExtensions": file_extensions,
        "criticality": criticality,
        "filesChanged": file_count,
        "filesAdded": len(added_files),
        "filesModified": len(modified_files),
        "filesRemoved": len(removed_files),
        "filesRenamed": len(renamed_files),
        "linesAdded": total_add,
        "linesDeleted": total_del,
        "missingTests": missingTests,
        "missingDocs": missingDocs,
        "securityWarnings": securityWarnings,
        "recommendedReviewers": recommendedReviewers,
        "suggestions": suggestions,
    }