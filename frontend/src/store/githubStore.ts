import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface GitHubUser {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  email: string;
}

interface RepositoryAnalysis {
  repository: GitHubRepo;
  languages: Record<string, number>;
  contributors: any[];
  health_score: number;
  analyzed_at: string;
}

interface GitHubStore {
  // State
  githubToken: string | null;
  githubUser: GitHubUser | null;
  repositories: GitHubRepo[];
  selectedRepo: GitHubRepo | null;
  analysisHistory: RepositoryAnalysis[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setGitHubToken: (token: string) => void;
  fetchGitHubUser: () => Promise<void>;
  fetchGitHubRepos: () => Promise<void>;
  selectRepository: (repo: GitHubRepo) => void;
  analyzeRepository: (repoUrl: string) => Promise<RepositoryAnalysis | null>;
  clearError: () => void;
  resetStore: () => void;
  getRepositoryById: (id: number) => GitHubRepo | undefined;
  checkGitHubTokenStatus: () => Promise<boolean>;
}

export const useGitHubStore = create<GitHubStore>()(
  persist(
    (set, get) => ({
      // Initial state
      githubToken: null,
      githubUser: null,
      repositories: [],
      selectedRepo: null,
      analysisHistory: [],
      isLoading: false,
      error: null,

      // Actions
      setGitHubToken: (token: string) => {
        set({ githubToken: token });
        toast.success("GitHub token set successfully");
      },

      fetchGitHubUser: async () => {
        const token = get().githubToken;
        if (!token) {
          toast.error("No GitHub token found");
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const res = await axiosInstance.get<GitHubUser>("/github/user", {
            headers: { Authorization: `Bearer ${token}` },
          });

          set({
            githubUser: res.data,
            isLoading: false,
          });
          toast.success("GitHub user profile fetched successfully");
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error || "Failed to fetch GitHub user";
          set({
            error: errorMessage,
            isLoading: false,
          });
          toast.error(errorMessage);
        }
      },

      fetchGitHubRepos: async () => {
        const token = get().githubToken;
        if (!token) {
          toast.error("No GitHub token found");
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const res = await axiosInstance.get<GitHubRepo[]>("/github/repos", {
            headers: { Authorization: `Bearer ${token}` },
          });

          set({
            repositories: res.data,
            isLoading: false,
          });
          toast.success(`Fetched ${res.data.length} repositories`);
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error || "Failed to fetch GitHub repos";
          set({
            error: errorMessage,
            isLoading: false,
          });
          toast.error(errorMessage);
        }
      },

      selectRepository: (repo: GitHubRepo) => {
        set({ selectedRepo: repo });
        toast.info(`Selected repository: ${repo.name}`);
      },

      analyzeRepository: async (
        repoUrl: string
      ): Promise<RepositoryAnalysis | null> => {
        const token = get().githubToken;
        if (!token) {
          toast.error("No GitHub token found");
          return null;
        }

        set({ isLoading: true, error: null });
        try {
          const res = await axiosInstance.post<RepositoryAnalysis>(
            "/github/analyze",
            { repoUrl },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // Add to analysis history
          const currentHistory = get().analysisHistory;
          set({
            analysisHistory: [res.data, ...currentHistory],
            isLoading: false,
          });

          toast.success(
            `Repository analysis completed. Health score: ${res.data.health_score}/100`
          );
          return res.data;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error || "Failed to analyze repository";
          set({
            error: errorMessage,
            isLoading: false,
          });
          toast.error(errorMessage);
          return null;
        }
      },

      getRepositoryById: (id: number): GitHubRepo | undefined => {
        const repositories = get().repositories;
        return repositories.find((repo) => repo.id === id);
      },

      checkGitHubTokenStatus: async () => {
        const authStorage = localStorage.getItem("auth-storage");
        let provider = null;
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          provider = parsed?.state?.authUser?.oauthProvider;
        }
        set({ isLoading: true });
        try {
          const res = await axiosInstance.get("/github/token-status");
          if (res.data.hasToken && provider === "github") {
            set({ githubToken: "valid-token-exists" });
            return true;
          }
          set({ githubToken: null });
          return false;
        } catch (error) {
          set({ githubToken: null });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      resetStore: () => {
        set({
          githubUser: null,
          repositories: [],
          selectedRepo: null,
          analysisHistory: [],
          isLoading: false,
          error: null,
        });
        toast.info("GitHub store reset");
      },
    }),
    {
      name: "github-storage",
      partialize: (state) => ({
        githubToken: state.githubToken,
        githubUser: state.githubUser,
        repositories: state.repositories,
        selectedRepo: state.selectedRepo,
        analysisHistory: state.analysisHistory,
      }),
    }
  )
);
