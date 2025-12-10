import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";

type AccountSettingsStore = {
  loading: boolean;
  error: string | null;

  updateName: (name: string) => Promise<boolean>;
  addAlternateEmail: (alternateEmail: string) => Promise<boolean>;
  addPhoneNumber: (number: string) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  clearError: () => void;
  manageGithubPermissions: () => Promise<boolean>;
  resetStore: () => void;
};

export const useAccountSettingsStore = create<AccountSettingsStore>((set) => ({
  loading: false,
  error: null,

  updateName: async (name: string): Promise<boolean> => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.patch("/account/update-name", {
        name,
      });

      if (response.data.success) {
        toast.success("Name updated successfully");
        return true;
      } else {
        const errorMessage = response.data.message || "Failed to update name";
        set({ error: errorMessage });
        toast.error(errorMessage);
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update name";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  addAlternateEmail: async (alternateEmail: string): Promise<boolean> => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.patch("/account/add-email", {
        alternateEmail,
      });

      if (response.data.success) {
        toast.success("Alternate email added successfully");
        return true;
      } else {
        const errorMessage =
          response.data.message || "Failed to add alternate email";
        set({ error: errorMessage });
        toast.error(errorMessage);
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to add alternate email";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  addPhoneNumber: async (number: string): Promise<boolean> => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.patch("/account/add-number", {
        number,
      });

      if (response.data.success) {
        toast.success("Phone number added successfully");
        return true;
      } else {
        const errorMessage =
          response.data.message || "Failed to add phone number";
        set({ error: errorMessage });
        toast.error(errorMessage);
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to add phone number";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  manageGithubPermissions: async (): Promise<boolean> => {
    set({ loading: true, error: null });
    try {
      return true;
    } catch (err) {
      const errorMessage =
        (err as any)?.message || "Failed to manage GitHub permissions";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteAccount: async (): Promise<boolean> => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.delete("/account/delete");

      if (response.status === 200) {
        toast.success("Account deleted successfully");
        set({ loading: false, error: null });
        return true;
      } else {
        const errorMessage =
          response.data.message || "Failed to delete account";
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete account";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  clearError: () => set({ error: null }),

  resetStore: () => {
    set({
      loading: false,
      error: null,
    });
  },
}));
