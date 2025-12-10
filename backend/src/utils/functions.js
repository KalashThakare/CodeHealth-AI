import { Project } from "../database/models/project.js";
import RepoFileMetrics from "../database/models/repoFileMetrics.js";
import crypto from "crypto"

export const mean = (arr) => {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

export const stdDev = (arr) => {
  if (!arr || arr.length < 2) return 0;
  const avg = mean(arr);
  const squareDiffs = arr.map(val => Math.pow(val - avg, 2));
  return Math.sqrt(mean(squareDiffs));
};

export const createHistogram = (values, minVal, maxVal, bins) => {
  if (!values || values.length === 0) {
    return new Array(bins).fill(0);
  }

  const binSize = (maxVal - minVal) / bins;
  const histogram = new Array(bins).fill(0);

  values.forEach(val => {
    let binIdx = Math.floor((val - minVal) / binSize);
    binIdx = Math.min(Math.max(binIdx, 0), bins - 1);
    histogram[binIdx]++;
  });

  return histogram;
};

export const removeFiles = async (repoId, removedArray) =>{
  if(!repoId || !removedArray){
    console.log("Fields are empty");
    return;
  }

  const repo = await Project.findOne({
    where:{
      repoId:repoId
    }
  });

  if(!repo){
    throw new Error("Repo not found");
  }

  const deletedCount = await RepoFileMetrics.destroy({
    where: {
      repoId: repoId,
      path: removedArray
    }
  });

  console.log(`Deleted ${deletedCount} file(s) from repository ${repoId}`);
  return deletedCount;

}

//PR metrics helper functions

// Calculate time difference in minutes

export function getTimeDiffInMinutes(startDate, endDate) {
  if (!startDate || !endDate) return null;
  return Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60));
}

// Calculate median of array
export function getMedian(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Categorize time into buckets
export function categorizeTime(minutes) {
  if (minutes < 60) return 'under1Hour';
  if (minutes < 240) return 'under4Hours';
  if (minutes < 1440) return 'under1Day';
  if (minutes < 10080) return 'under1Week';
  return 'over1Week';
}


export function calculateAverage(arr) {
  const filtered = arr.filter(n => n != null && !isNaN(n));
  if (filtered.length === 0) return 0;
  return filtered.reduce((a, b) => a + b, 0) / filtered.length;
}

export function calculateTrend(firstHalf, secondHalf) {
  const avg1 = calculateAverage(firstHalf);
  const avg2 = calculateAverage(secondHalf);
  
  if (avg1 === 0) return 'stable';
  
  const change = ((avg2 - avg1) / avg1) * 100;
  
  if (Math.abs(change) < 5) return 'stable';
  return change < 0 ? 'improving' : 'declining';
}

export function formatTime(minutes) {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  if (minutes < 1440) return `${(minutes / 60).toFixed(1)} hours`;
  return `${(minutes / 1440).toFixed(1)} days`;
}

export function calculatePerformanceRating(avgResponseTime) {
  if (avgResponseTime < 60) return 'excellent';
  if (avgResponseTime < 240) return 'good';
  if (avgResponseTime < 1440) return 'fair';
  return 'slow';
}

export function generateRecommendations(reviewers, bottlenecks) {
  const recommendations = [];

  if (bottlenecks.length > 0) {
    recommendations.push({
      type: 'bottleneck',
      severity: 'high',
      message: `${bottlenecks.length} reviewer(s) are bottlenecks. Consider redistributing load.`,
      reviewers: bottlenecks.map(r => r.reviewerName)
    });
  }

  const overloadedReviewers = reviewers.filter(r => r.pendingReviews > 5);
  if (overloadedReviewers.length > 0) {
    recommendations.push({
      type: 'overload',
      severity: 'medium',
      message: `${overloadedReviewers.length} reviewer(s) have >5 pending reviews.`,
      reviewers: overloadedReviewers.map(r => r.reviewerName)
    });
  }

  const slowReviewers = reviewers.filter(r => r.avgResponseTime > 1440); // > 1 day
  if (slowReviewers.length > 0) {
    recommendations.push({
      type: 'slow_response',
      severity: 'medium',
      message: `${slowReviewers.length} reviewer(s) averaging >1 day response time.`,
      reviewers: slowReviewers.map(r => r.reviewerName)
    });
  }

  return recommendations;
}

export const generateSecureState = (userId) => {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const stateData = {
    userId,
    timestamp: Date.now(),
    nonce: randomBytes
  };
  return Buffer.from(JSON.stringify(stateData)).toString('base64');
};

export const validateState = (encodedState, maxAge = 600000) => {
  try {
    const decoded = JSON.parse(Buffer.from(encodedState, 'base64').toString());
    
    if (Date.now() - decoded.timestamp > maxAge) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
};
