import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NextRouter } from 'next/router';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
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
  _id: string;
  email: string;
  name: string;
}

interface AuthStore {
  authUser: User | null;
  isloggingin: boolean;
  checkAuth: (router: NextRouter) => Promise<void>;
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


      // Check Auth
      checkAuth: async (router: NextRouter): Promise<void> => {
        set({ isloggingin: true });
        try {
          const token = localStorage.getItem("authToken");

          if (!token) {
            set({ authUser: null, isloggingin: false });
            router.push("/");
            return;
          }

          const res = await axiosInstance.get<User>("/auth/check", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.data) {
            set({ authUser: res.data, isloggingin: false });
          } else {
            set({ authUser: null, isloggingin: false });
          }
        } catch (error: any) {
          const status = error?.response?.status;
          if (status === 401 || status === 403) {
            toast.warning("Session expired. Please login again.");
          } else {
            toast.error("Failed to check authentication");
          }
          localStorage.removeItem("authToken");
          set({ authUser: null, isloggingin: false });
          localStorage.removeItem("useDefaultAfterLogin");
          router.push("/Auth");
        }
      },

      // Login
      login: async (data: LoginData): Promise<AuthResponse | null> => {
        set({ isloggingin: true });
        try {
          const res = await axiosInstance.post<AuthResponse>("/auth/login", data);
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
          const res = await axiosInstance.post<AuthResponse>("/auth/signup", data);
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
    }
  )
);
