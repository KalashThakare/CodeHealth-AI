import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";

interface SupportCase {
  id: string;
  caseId: string;
  status: "open" | "closed";
  problem: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export type { SupportCase };

interface SupportStore {
  cases: SupportCase[];
  isLoading: boolean;
  error: string | null;

  fetchCases: () => Promise<void>;
  createCase: (problem: string) => Promise<string | null>;
  deleteCase: (caseId: string) => Promise<boolean>;
  clearError: () => void;
  resetStore: () => void;
}

export const useSupportStore = create<SupportStore>()((set, get) => ({
  cases: [],
  isLoading: false,
  error: null,

  fetchCases: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/support/cases");

      if (res.data?.cases) {
        set({
          cases: res.data.cases,
          isLoading: false,
        });
      } else {
        set({ cases: [], isLoading: false });
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to fetch support cases";
      set({
        error: errorMessage,
        isLoading: false,
      });
      console.error("Error fetching cases:", errorMessage);
    }
  },

  createCase: async (problem: string): Promise<string | null> => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post("/support/cases", { problem });

      if (res.data?.success && res.data?.caseId) {
        toast.success(`Support case #${res.data.caseId} created successfully`);

        // Refetch cases from backend to get the complete data
        await get().fetchCases();

        return res.data.caseId;
      }

      set({ isLoading: false });
      return null;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to create support case";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
      return null;
    }
  },

  deleteCase: async (caseId: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.delete(`/support/cases/${caseId}`);

      if (res.data?.success) {
        // Refetch cases from backend to ensure sync
        await get().fetchCases();

        toast.success("Support case deleted successfully");
        return true;
      }

      set({ isLoading: false });
      return false;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to delete support case";
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  resetStore: () => {
    set({
      cases: [],
      isLoading: false,
      error: null,
    });
  },
}));
