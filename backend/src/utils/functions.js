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