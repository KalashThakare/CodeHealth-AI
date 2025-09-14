export async function handleIssues(payload) {
  const repo = payload.repository?.full_name;
  const action = payload.action;         // opened, labeled, closed
  const issue = payload.issue;
  // Implement your business logic
}
