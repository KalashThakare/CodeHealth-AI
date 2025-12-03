import { Project } from "../database/models/project.js";
import RepoFileMetrics from "../database/models/repoFileMetrics.js";

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
