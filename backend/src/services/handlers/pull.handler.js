export async function handlePullRequest(payload) {
  const repo = payload.repository?.full_name;
  const action = payload.action;         // opened, synchronize, closed
  const pr = payload.pull_request;       // PR object
  // Implement your business logic
}
