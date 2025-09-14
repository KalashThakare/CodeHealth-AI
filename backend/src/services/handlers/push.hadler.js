export async function handlePush(payload) {
  const repo = payload.repository?.full_name;
  const ref = payload.ref;               // refs/heads/branch
  const commits = payload.commits || []; // commit list
  // Implement your business logic (CI trigger, analytics, etc.)
}
