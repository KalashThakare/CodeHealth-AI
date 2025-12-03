import { PullRequestReviewActivity, PullRequestActivity } from "../../database/models/repoAnalytics.js";

export async function handlePullRequestReview(payload) {
  try {
    const repoId = payload.repository?.id;
    const pr = payload.pull_request;
    const review = payload.review;

    if (!repoId || !pr || !review) {
      console.warn("Invalid review payload");
      return { skipped: true };
    }

    const prNumber = pr.number;
    const reviewerId = review.user?.id;
    const reviewerName = review.user?.login;
    const reviewState = review.state; // approved | changes_requested | commented
    const reviewedAt = new Date(review.submitted_at);

    await PullRequestReviewActivity.create({
      repoId,
      prNumber,
      reviewerId,
      reviewerName,
      reviewState,
      reviewedAt,
    });

    const prRecord = await PullRequestActivity.findOne({
      where: { repoId, prNumber },
    });

    if (!prRecord) {
      console.log("PR not found for review event, creating minimal entry");
      await PullRequestActivity.create({
        repoId,
        prNumber,
        state: "open",
        reviewCount: 1,
        firstReviewedAt: reviewedAt,
        timeToFirstReview: 0,
      });

      return { success: true, createdMissingPR: true };
    }

    if (!prRecord.firstReviewedAt) {
      const created = new Date(prRecord.createdAtGitHub);
      const timeToFirstReview = Math.floor((reviewedAt - created) / 1000 / 60); 

      await prRecord.update({
        firstReviewedAt: reviewedAt,
        timeToFirstReview,
        reviewCount: (prRecord.reviewCount || 0) + 1,
      });

      console.log(`[analytics] PR #${prNumber} first review detected`);
    } else {
      await prRecord.update({
        reviewCount: (prRecord.reviewCount || 0) + 1,
      });
    }

    return { success: true, prNumber, reviewState };

  } catch (error) {
    console.error("Review processing error:", error);
    return { success: false, error: error.message };
  }
}
