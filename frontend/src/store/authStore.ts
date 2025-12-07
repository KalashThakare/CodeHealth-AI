import { create } from "zustand";
import { persist } from "zustand/middleware";
import { NextRouter } from "next/router";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token?: string;
  id: string;
  email: string;
  name: string;
}

interface AuthStore {
  authUser: User | null;
  isloggingin: boolean;
  isHydrated: boolean;
  justLoggedOut: boolean;
  setHydrated: () => void;
  checkAuth: (router?: any) => Promise<void>;
  login: (data: LoginData) => Promise<AuthResponse | null>;
  logout: () => Promise<void>;
  signup: (data: SignupData) => Promise<number>;
  clearLogoutFlag: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      authUser: null,
      isloggingin: true,
      isHydrated: false,
      justLoggedOut: false,

      setHydrated: () => set({ isHydrated: true }),

      clearLogoutFlag: () => set({ justLoggedOut: false }),

      checkAuth: async (router?: any): Promise<void> => {
        set({ isloggingin: true });
        try {
          const token = localStorage.getItem("authToken");

          if (!token) {
            set({ authUser: null, isloggingin: false });
            return;
          }

          const res = await axiosInstance.get<User>("/auth/check", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.data) {
            set({ authUser: res.data, isloggingin: false });
          } else {
            localStorage.removeItem("authToken");
            set({ authUser: null, isloggingin: false });
          }
        } catch (error: any) {
          console.error("Auth check error:", error);

          const status = error?.response?.status;

          if (status === 401 || status === 403) {
            console.log("Authentication failed - token invalid");
            localStorage.removeItem("authToken");
            set({ authUser: null, isloggingin: false });

            if (
              router &&
              typeof window !== "undefined" &&
              !window.location.pathname.includes("/login")
            ) {
              toast.warning("Session expired. Please login again.");
              router.push("/login");
            }
          } else {
            console.log(
              "Network error during auth check, maintaining current state"
            );
            set({ isloggingin: false });
          }
        }
      },

      login: async (data: LoginData): Promise<AuthResponse | null> => {
        set({ isloggingin: true });
        try {
          const res = await axiosInstance.post<AuthResponse>(
            "/manual-auth/login",
            data
          );
          console.log("Login response:", res.data);
          if (res.data?.token) {
            console.log("User logged in:", res.data);
            localStorage.setItem("authToken", res.data.token);
          }
          set({ authUser: res.data, isloggingin: false });
          toast.success("Logged in successfully");
          return res.data;
        } catch (error: any) {
          set({ authUser: null, isloggingin: false });
          const status = error?.response?.status;
          if (status === 400 || status === 401) {
            toast.warning("Invalid credentials");
          } else {
            toast.error("Login failed");
          }
          return null;
        }
      },

      logout: async (): Promise<void> => {
        set({ isloggingin: true });
        try {
          await axiosInstance.post("/auth/logout");
          toast.success("Logged out successfully");
        } catch (error: any) {
          const status = error?.response?.status;
          if (status === 401) {
            toast.warning("You are already logged out");
          } else {
            toast.error("Logout failed");
          }
        } finally {
          localStorage.removeItem("authToken");
          const currentUserId = get().authUser?.id;
          if (currentUserId) {
            localStorage.removeItem(`notification-storage-${currentUserId}`);
          }

          const { useGitHubStore } = await import("./githubStore");
          const { useNotificationStore } = await import("./notificationStore");
          const { useObservabilityStore } = await import(
            "./observabilityStore"
          );
          const { useAnalysisStore } = await import("./analysisStore");
          const { useActivityStore } = await import("./activityStore");
          const { useAccountSettingsStore } = await import(
            "./accountSettingsStore"
          );
          const { useAlertStore } = await import("./alertStore");
          const { useUsageStore } = await import("./usageStore");
          const { useTeamStore } = await import("./teamStore");
          const { useSupportStore } = await import("./supportStore");

          useGitHubStore.getState().resetStore();
          useNotificationStore.getState().resetStore();
          useObservabilityStore.getState().resetStore();
          useAnalysisStore.getState().resetStore();
          useActivityStore.getState().resetStore();
          useAccountSettingsStore.getState().resetStore();
          useAlertStore.getState().resetStore();
          useUsageStore.getState().reset();
          useTeamStore.getState().reset();
          useSupportStore.getState().resetStore();

          set({ authUser: null, isloggingin: false, justLoggedOut: true });
        }
      },

      signup: async (data: SignupData): Promise<number> => {
        set({ isloggingin: true });
        try {
          const res = await axiosInstance.post<AuthResponse>(
            "/manual-auth/signup",
            data
          );
          if (res.data?.token) {
            localStorage.setItem("authToken", res.data.token);
          }
          set({ authUser: res.data, isloggingin: false });
          toast.success("Signed up Successfully");
          return 1;
        } catch (error: any) {
          set({ isloggingin: false });
          const status = error?.response?.status;
          if (status === 400) {
            toast.warning("Signup failed");
          } else {
            toast.error("Error during signup");
          }
          return 0;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        authUser: state.authUser,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
