import { ALL_MOCK_DATA } from "./mockObservabilityData";

export enum DataSource {
  MOCK = "mock",
  BACKEND = "backend",
}

export const DATA_SOURCE =
  (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
    ? DataSource.MOCK
    : DataSource.BACKEND) || DataSource.BACKEND;

export function isMockDataEnabled(): boolean {
  return DATA_SOURCE === DataSource.MOCK;
}

export function getDataSource(): DataSource {
  return DATA_SOURCE;
}

export function getMockData(key: keyof typeof ALL_MOCK_DATA) {
  return ALL_MOCK_DATA[key];
}

export function logDataSource(): void {
  console.log(`Using data source: ${getDataSource()}`);
}

if (typeof window !== "undefined") {
  logDataSource();
}
