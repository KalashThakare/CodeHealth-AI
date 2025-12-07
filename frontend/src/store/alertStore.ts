import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";

type AlertRule = {
  id: string;
  repoId: string;
  userId: string;
  name: string;
  threshold: number;
  operator: string;
  isActive: boolean;
  lastTriggeredAt: string | null;
  triggerCount: number;
  cooldownMinutes: number;
  createdAt: string;
  updatedAt: string;
};

type CreateAlertParams = {
  name: string;
  threshold: number;
  repoId: string;
  operator: string;
};

type ModifyAlertParams = {
  threshold: number;
  operator: string;
  repoId: string;
  name: string;
};

type DeleteAlertParams = {
  repoId: string;
  name: string;
};

type ToggleAlertParams = {
  boolean: boolean;
  repoId: string;
  name: string;
};

type AlertStore = {
  alerts: AlertRule[];
  loading: boolean;
  error: string | null;

  createAlert: (params: CreateAlertParams) => Promise<void>;
  deleteAlert: (params: DeleteAlertParams) => Promise<void>;
  modifyAlert: (params: ModifyAlertParams) => Promise<void>;
  getAlerts: (repoId: string) => Promise<void>;
  toggleAlert: (params: ToggleAlertParams) => Promise<void>;
  clearError: () => void;
  resetStore: () => void;
};

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],
  loading: false,
  error: null,

  createAlert: async (params: CreateAlertParams) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post("/alertrule/create", params);

      if (response.data.success) {
        const currentAlerts = get().alerts;
        set({ alerts: [...currentAlerts, response.data.newalertRule] });
        // toast.success(`Alert rule "${params.name}" created successfully`);
      } else {
        set({ error: response.data.message || "Failed to create alert" });
        toast.error(response.data.message || "Failed to create alert");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create alert";
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  deleteAlert: async (params: DeleteAlertParams) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.delete("/alertrule/delete", {
        data: params,
      });

      if (response.data.success !== false) {
        const currentAlerts = get().alerts;
        set({
          alerts: currentAlerts.filter(
            (alert) =>
              !(alert.repoId === params.repoId && alert.name === params.name)
          ),
        });
        // toast.success(`Alert rule "${params.name}" deleted successfully`);
      } else {
        set({ error: response.data.message || "Failed to delete alert" });
        toast.error(response.data.message || "Failed to delete alert");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete alert";
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  modifyAlert: async (params: ModifyAlertParams) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.patch("/alertrule/update", params);

      if (response.data.success) {
        const currentAlerts = get().alerts;
        set({
          alerts: currentAlerts.map((alert) =>
            alert.repoId === params.repoId && alert.name === params.name
              ? {
                  ...alert,
                  threshold: params.threshold,
                  operator: params.operator,
                }
              : alert
          ),
        });
        // toast.success(`Alert rule "${params.name}" updated successfully`);
      } else {
        set({ error: response.data.message || "Failed to update alert" });
        toast.error(response.data.message || "Failed to update alert");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update alert";
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  getAlerts: async (repoId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`/alertrule/${repoId}/get`);

      if (response.data.success) {
        set({ alerts: response.data.alerts });
      } else {
        set({
          error: response.data.message || "Failed to fetch alerts",
          alerts: [],
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch alerts";
        
        toast.error(errorMessage);
      set({ error: errorMessage, alerts: [] });
    } finally {
      set({ loading: false });
    }
  },

  toggleAlert: async (params: ToggleAlertParams) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.patch("/alertrule/toggle", params);

      if (response.data.success) {
        const currentAlerts = get().alerts;
        set({
          alerts: currentAlerts.map((alert) =>
            alert.repoId === params.repoId && alert.name === params.name
              ? { ...alert, isActive: params.boolean }
              : alert
          ),
        });
        // toast.success(
        //   `Alert rule "${params.name}" ${
        //     params.boolean ? "enabled" : "disabled"
        //   } successfully`
        // );
      } else {
        set({ error: response.data.message || "Failed to toggle alert" });
        toast.error(response.data.message || "Failed to toggle alert");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to toggle alert";
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  resetStore: () => {
    set({
      alerts: [],
      loading: false,
      error: null,
    });
  },
}));
