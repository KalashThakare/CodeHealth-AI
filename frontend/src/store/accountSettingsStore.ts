import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";

type AccountSettings = {
  displayName: string;
  username: string;
  email: string;
  phoneNumber: string;
};

type AccountSettingsStore = {
  accountSettings: AccountSettings | null;
  loading: boolean;
  error: string | null;

  fetchAccountSettings: () => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePhoneNumber: (phoneNumber: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
  resetStore: () => void;
};

export const useAccountSettingsStore = create<AccountSettingsStore>((set) => ({
  accountSettings: null,
  loading: false,
  error: null,

  fetchAccountSettings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/account-settings");
      const data = await response.json();
      set({ accountSettings: data });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "An error occurred" });
    } finally {
      set({ loading: false });
    }
  },

  updateDisplayName: async (displayName: string): Promise<void> => {
    set({ loading: true, error: null });
    try {
      await fetch("/api/account-settings/display-name", {
        method: "PUT",
        body: JSON.stringify({ displayName }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      set((state: AccountSettingsStore) => ({
        accountSettings: state.accountSettings
          ? { ...state.accountSettings, displayName }
          : { displayName, username: "", email: "", phoneNumber: "" },
      }));
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      set({ loading: false });
    }
  },

  updateUsername: async (username: string): Promise<void> => {
    set({ loading: true, error: null });
    try {
      await fetch("/api/account-settings/username", {
        method: "PUT",
        body: JSON.stringify({ username }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      set((state: AccountSettingsStore) => ({
        accountSettings: state.accountSettings
          ? { ...state.accountSettings, username }
          : { displayName: "", username, email: "", phoneNumber: "" },
      }));
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      set({ loading: false });
    }
  },

  updateEmail: async (email: string): Promise<void> => {
    set({ loading: true, error: null });
    try {
      await fetch("/api/account-settings/email", {
        method: "PUT",
        body: JSON.stringify({ email }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      set((state: AccountSettingsStore) => ({
        accountSettings: state.accountSettings
          ? { ...state.accountSettings, email }
          : { displayName: "", username: "", email, phoneNumber: "" },
      }));
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      set({ loading: false });
    }
  },

  updatePhoneNumber: async (phoneNumber: string): Promise<void> => {
    set({ loading: true, error: null });
    try {
      await fetch("/api/account-settings/phone-number", {
        method: "PUT",
        body: JSON.stringify({ phoneNumber }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      set((state: AccountSettingsStore) => ({
        accountSettings: state.accountSettings
          ? { ...state.accountSettings, phoneNumber }
          : { displayName: "", username: "", email: "", phoneNumber },
      }));
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      set({ loading: false });
    }
  },

  deleteAccount: async () => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete("/account/delete");
      set({ accountSettings: null });
      toast.success("Account deleted successfully");
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
      });
      toast.error(
        error instanceof Error ? error.message : "Failed to delete account"
      );
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),

  resetStore: () => {
    set({
      accountSettings: null,
      loading: false,
      error: null,
    });
  },
}));
