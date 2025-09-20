import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NextRouter } from 'next/router';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';

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
  setHydrated: () => void;
  checkAuth: (router?: any) => Promise<void>;
  login: (data: LoginData) => Promise<AuthResponse | null>;
  logout: () => Promise<void>;
  signup: (data: SignupData) => Promise<number>;
}

// Auth Store
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      authUser: null,
      isloggingin: true,
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),

      // Check Auth
      checkAuth: async (router?: any): Promise<void> => {
        set({ isloggingin: true });
        try {
          const token = localStorage.getItem("authToken");

          if (!token) {
            set({ authUser: null, isloggingin: false });
            // Don't auto-redirect here - let components handle it
            return;
          }

          const res = await axiosInstance.get<User>("/auth/check", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.data) {
            set({ authUser: res.data, isloggingin: false });
          } else {
            // Token invalid but don't redirect automatically
            localStorage.removeItem("authToken");
            set({ authUser: null, isloggingin: false });
          }
        } catch (error: any) {
          console.error("Auth check error:", error);

          const status = error?.response?.status;

          // FIXED: Only handle actual auth errors, not network issues
          if (status === 401 || status === 403) {
            // Only show toast and remove token, don't auto-redirect
            console.log("Authentication failed - token invalid");
            localStorage.removeItem("authToken");
            set({ authUser: null, isloggingin: false });

            // Only redirect if router is provided and we're not already on auth page
            if (
              router &&
              typeof window !== "undefined" &&
              !window.location.pathname.includes("/login")
            ) {
              toast.warning("Session expired. Please login again.");
              router.push("/login");
            }
          } else {
            // Network error or other issue - don't log out
            console.log(
              "Network error during auth check, maintaining current state"
            );
            set({ isloggingin: false });
            // Keep existing authUser state if it exists
          }
        }
      },

      // Login
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

      // Logout
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
          set({ authUser: null, isloggingin: false });
        }
      },

      // Signup
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
        // Set hydrated flag when store is rehydrated
        state?.setHydrated();
      },
    }
  )
);
