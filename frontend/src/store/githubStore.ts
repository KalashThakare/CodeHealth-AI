import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";

interface GitHubRepo {
  id: number;
  repoName: string;
  fullName: string;
  private?: boolean;
  visibility: "public" | "private";
  repoId: number;
  repoUrl: string;
  installationId?: string | null;
  createdAt: string;
  updatedAt: string;
  initialised?: boolean;
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
  githubToken: string | null;
  githubUser: GitHubUser | null;
  repositories: GitHubRepo[];
  selectedRepo: GitHubRepo | null;
  analysisHistory: RepositoryAnalysis[];
  isLoading: boolean;
  error: string | null;
  initializingRepoId: number | null;

  setGitHubToken: (token: string) => void;
  fetchGitHubUser: () => Promise<void>;
  fetchGitHubRepos: () => Promise<void>;
  selectRepository: (repo: GitHubRepo) => void;
  analyzeRepository: (repoUrl: string) => Promise<RepositoryAnalysis | null>;
  initializeRepository: (repoId: number) => Promise<boolean>;
  uninitializeRepository: (repoId: number) => Promise<boolean>;
  getInitializedCount: () => number;
  clearError: () => void;
  resetStore: () => void;
  getRepositoryById: (id: number) => GitHubRepo | undefined;
  checkGitHubTokenStatus: () => Promise<boolean>;
}

interface GitHubState {
  githubUser: GitHubUser | null;

  repositories: GitHubRepo[];

  isLoading: boolean;
  error: string | null;

  fetchGitHubUser: () => Promise<void>;
  fetchGitHubRepos: () => Promise<void>;
  clearError: () => void;
}

export const useGitHubStore = create<GitHubStore>()(
  persist(
    (set, get) => ({
      githubToken: null,
      githubUser: null,
      repositories: [],
      selectedRepo: null,
      analysisHistory: [],
      isLoading: false,
      error: null,
      initializingRepoId: null,

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
          console.log("GitHub User:", res.data);
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
            withCredentials: true,
          });
          
          const repositories = res.data.map((repo) => ({
            ...repo,
            visibility: repo.private
              ? "private"
              : ("public" as "public" | "private"),
          }));

          set({
            repositories,
            isLoading: false,
          });
          // toast.success(`Fetched ${res.data.length} repositories`);
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
        // toast.info(`Selected repository: ${repo.repoName}`);
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

      getInitializedCount: (): number => {
        return get().repositories.filter((repo) => repo.initialised).length;
      },

      initializeRepository: async (repoId: number): Promise<boolean> => {
        const repositories = get().repositories;
        const initializedCount = repositories.filter(
          (r) => r.initialised
        ).length;
        const repo = repositories.find((r) => r.repoId === repoId);

        if (initializedCount >= 2 && !repo?.initialised) {
          toast.error(
            "Maximum 2 repositories can be initialized. Please remove initialization from another repository first."
          );
          return false;
        }

        set({ initializingRepoId: repoId });
        try {
          await axiosInstance.get(`/analyze/${repoId}/initialize`);

          set({
            repositories: get().repositories.map((r) =>
              r.repoId === repoId ? { ...r, initialised: true } : r
            ),
          });

          toast.success("Repository initialized successfully");
          return true;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error || "Failed to initialize repository";
          toast.error(errorMessage);
          return false;
        } finally {
          set({ initializingRepoId: null });
        }
      },

      uninitializeRepository: async (repoId: number): Promise<boolean> => {
        set({ initializingRepoId: repoId });
        try {
          await axiosInstance.post(`/analyze/${repoId}/uninitialize`);

          set({
            repositories: get().repositories.map((r) =>
              r.repoId === repoId ? { ...r, initialised: false } : r
            ),
          });

          toast.success("Repository uninitialized successfully");
          return true;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error || "Failed to uninitialize repository";
          toast.error(errorMessage);
          return false;
        } finally {
          set({ initializingRepoId: null });
        }
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
