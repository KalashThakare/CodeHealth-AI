import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";

interface UsageData {
  repoCount: number;
  teamCount: number;
}

interface UsageState {
  usageData: UsageData;
  isLoading: boolean;
  error: string | null;
  fetchUsage: () => Promise<void>;
  reset: () => void;
}

const initialUsageData: UsageData = {
  repoCount: 0,
  teamCount: 0,
};

export const useUsageStore = create<UsageState>((set) => ({
  usageData: initialUsageData,
  isLoading: false,
  error: null,

  fetchUsage: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/dashboard/usage");
      set({
        usageData: {
          repoCount: response.data.repoCount || 0,
          teamCount: response.data.teamCount || 0,
        },
        isLoading: false,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch usage data";
      set({ error: errorMessage, isLoading: false });
    }
  },

  reset: () => {
    set({ usageData: initialUsageData, isLoading: false, error: null });
  },
}));
