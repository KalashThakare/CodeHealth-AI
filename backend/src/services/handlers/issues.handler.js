import { issuesAnalysisQueue } from "../../lib/redis.js";

export async function handleIssues(payload) {
  const repo = payload.repository && payload.repository.full_name;        
  const repoId = payload.repository && payload.repository.id;            
  const installationId = (payload.installation && payload.installation.id) || null; 
  const action = payload.action;                                           // opened|edited|labeled|closed|
  const issue = payload.issue;                                             // issue object 
  const sender = (payload.sender && payload.sender.login) || "unknown";    

  if (!repo || !installationId || !issue) {
    return { skipped: true, reason: "invalid-payload", repo, installationId, hasIssue: Boolean(issue) }; 
  }

  // Choose actionable actions (adjust to needs)
  const actionable =
    action === "opened" ||
    action === "reopened" ||
    action === "edited" ||
    action === "labeled" ||
    action === "unlabeled" ||
    action === "closed" ||
    action === "assigned" ||
    action === "unassigned";
  if (!actionable) {
    return { skipped: true, reason: "non-actionable", action, issueNumber: issue.number }; 
  }

  const issueNumber = issue.number;                                      
  const title = issue.title || null;                                       
  const state = issue.state || null;                                       
  const labels =
    Array.isArray(issue.labels) ? issue.labels.map(l => (typeof l === "string" ? l : l.name)).filter(Boolean) : [];
  const assignees =
    Array.isArray(issue.assignees) ? issue.assignees.map(a => a && a.login).filter(Boolean) : [];
  const isFromFork = false; 

  const jobData = {
    repo,
    repoId,
    installationId,
    action,
    sender,
    issue: {
      number: issueNumber,
      title,
      state,
      labels,
      assignees,
      author: issue.user && issue.user.login,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      closedAt: issue.closed_at || null,
    },
    isFromFork,
  }; 

  const updatedKey = issue.updated_at ? `-${new Date(issue.updated_at).getTime()}` : "";
  const jobId = `issue-${repo}-${issueNumber}-${action}${updatedKey}`; 

  await issuesAnalysisQueue.add("analysis.issue", jobData, {
    jobId,
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 1000,
    removeOnFail: 1000,
    priority: 5, 
  }); 

  return { enqueued: true, repo, issueNumber, action, labels, assignees };
}
