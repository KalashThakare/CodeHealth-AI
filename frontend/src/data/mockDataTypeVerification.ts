import {
  TrendData,
  PushActivityData,
  HeatmapData,
  PRVelocityData,
  StalePRsData,
  ReviewerPerformanceData,
  PRDistributionData,
} from "@/store/observabilityStore";

import {
  mockTrendData,
  mockPushActivityData,
  mockHeatmapData,
  mockPRVelocityData,
  mockStalePRsData,
  mockReviewerPerformanceData,
  mockPRDistributionData,
} from "./mockObservabilityData";

const _trendDataCheck: TrendData = mockTrendData;
const _pushActivityDataCheck: PushActivityData = mockPushActivityData;
const _heatmapDataCheck: HeatmapData = mockHeatmapData;
const _prVelocityDataCheck: PRVelocityData = mockPRVelocityData;
const _stalePRsDataCheck: StalePRsData = mockStalePRsData;
const _reviewerPerformanceDataCheck: ReviewerPerformanceData =
  mockReviewerPerformanceData;
const _prDistributionDataCheck: PRDistributionData = mockPRDistributionData;

export {
  _trendDataCheck,
  _pushActivityDataCheck,
  _heatmapDataCheck,
  _prVelocityDataCheck,
  _stalePRsDataCheck,
  _reviewerPerformanceDataCheck,
  _prDistributionDataCheck,
};
