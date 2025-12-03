export function formatRelativeTime(dateString: string | undefined): string {
  if (!dateString) return "Just now";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getHealthStatus(
  score: number
): "excellent" | "good" | "fair" | "poor" | "critical" {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 55) return "fair";
  if (score >= 40) return "poor";
  return "critical";
}

export function getHealthExplanation(score: number): string {
  if (score >= 85)
    return "Your codebase is exceptionally well-maintained. New developers can onboard quickly, and adding features is straightforward.";
  if (score >= 70)
    return "Your code is in good shape. Most areas are clean, with some opportunities for improvement.";
  if (score >= 55)
    return "Your code has some technical debt that could slow down development. Consider addressing high-priority items.";
  if (score >= 40)
    return "There are significant issues that need attention. New features may take longer to implement.";
  return "Your codebase needs significant work. Consider prioritizing cleanup before adding new features.";
}

export function getScoreColor(score: number): string {
  if (score >= 85) return "#4ade80";
  if (score >= 70) return "#a3e635";
  if (score >= 55) return "#fbbf24";
  if (score >= 40) return "#fb923c";
  return "#f87171";
}
