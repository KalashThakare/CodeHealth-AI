import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";

type Team = {
  id: string;
  _id?: string;
  name: string;
  description: string;
  slug: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  members?: Member[];
  projects?: any[];
};

type Member = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: "Owner" | "Manager" | "Member";
  joinedAt?: string;
};

type Invite = {
  id: string;
  teamId: string;
  email: string;
  role: string;
  invitedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  expiresAt: string;
  acceptedAt?: string | null;
  revokedAt?: string | null;
  status: string;
  team?: { id: string; name: string };
  tokenHash?: string;
};

type TeamStore = {
  teams: Team[];
  currentTeam: Team | null;
  members: Member[];
  invites: Invite[];
  myInvites: Invite[]; // Separate for received invites
  teamInvites?: Record<string, Invite[]>;
  loading: boolean;
  error: string | null;

  teamsLoaded: boolean;
  teamMembersLoaded: Record<string, boolean>;
  teamInvitesLoaded: Record<string, boolean>;
  myInvitesLoaded: boolean;

  // Core functions
  fetchTeams: () => Promise<void>;
  fetchTeamMembers: (teamId: string) => Promise<void>;
  fetchTeamInvites: (teamId: string) => Promise<void>;
  fetchMyInvites: () => Promise<void>;
  createTeam: (data: {
    name: string;
    description: string;
  }) => Promise<Team | null>;

  // Invite management
  sendInvite: (
    teamId: string,
    email: string,
    role: string
  ) => Promise<Invite | null>;
  acceptInvite: (token: string) => Promise<any>;
  declineInvite: (token: string) => Promise<boolean>;
  cancelInvite: (teamId: string, inviteId: string) => Promise<boolean>;

  // Member management
  updateMemberRole: (
    teamId: string,
    memberId: string,
    role: string
  ) => Promise<boolean>;
  removeMember: (teamId: string, memberId: string) => Promise<boolean>;

  // Team management
  deleteTeam: (teamId: string) => Promise<boolean>;
  leaveTeam: (teamId: string) => Promise<boolean>;

  // Utilities
  getTeamInvites: (teamId: string) => Invite[];
  setCurrentTeam: (team: Team | null) => void;
  clearError: () => void;
  reset: () => void;
};

function getAuthHeaders() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const useTeamStore = create<TeamStore>((set, get) => ({
  teams: [], // to store teams the user belongs to
  currentTeam: null, // to store the currently selected team
  members: [],  // members of the current team
  invites: [],  // invites sent for the current team
  myInvites: [],  // 
  teamInvites: {},
  loading: false,
  error: null,

  teamsLoaded: false,
  teamMembersLoaded: {},
  teamInvitesLoaded: {},
  myInvitesLoaded: false,

  fetchTeams: async () => {
    const { teamsLoaded, loading } = get();
    if (teamsLoaded || loading) return;

    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get("/teams/my/teams", {
        headers: getAuthHeaders(),
      });
      console.log("fetchTeams response:", res);
      const teams = res.data?.teams || res.data || [];
      console.log("Fetched teams:", teams.length);
      console.log("Teams data:", teams);

      set({
        teams,
        loading: false,
        teamsLoaded: true,
      });
    } catch (err: any) {
      console.error("fetchTeams error:", err);
      set({
        error: err?.response?.data?.message || "Failed to fetch teams",
        loading: false,
        teamsLoaded: true,
        teams: [],
      });
    }
  },

  fetchTeamMembers: async (teamId) => {
    const { teamMembersLoaded, loading } = get();
    if (teamMembersLoaded[teamId] || loading) return;

    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(`/teams/${teamId}/members`, {
        headers: getAuthHeaders(),
      });

      const members = res.data.members || [];
      console.log(`Fetched ${members.length} members for team ${teamId}`);

      set((state) => ({
        members,
        loading: false,
        teamMembersLoaded: { ...state.teamMembersLoaded, [teamId]: true },
      }));
    } catch (err: any) {
      console.error("fetchTeamMembers error:", err);
      set((state) => ({
        error: err?.response?.data?.message || "Failed to fetch members",
        loading: false,
        teamMembersLoaded: { ...state.teamMembersLoaded, [teamId]: true },
      }));
    }
  },

  fetchMyInvites: async () => {
    const { myInvitesLoaded, loading } = get();
    if (myInvitesLoaded || loading) return;

    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get("/teams/invites", {
        headers: getAuthHeaders(),
      });

      const myInvites = res.data?.invites || res.data?.items || res.data || [];
      console.log(`Fetched ${myInvites.length} received invites`);

      set({
        myInvites,
        loading: false,
        myInvitesLoaded: true,
      });
    } catch (err: any) {
      console.error("fetchMyInvites error:", err);
      set({
        error: err?.response?.data?.message || "Failed to fetch invites",
        loading: false,
        myInvitesLoaded: true,
      });
    }
  },

  // fetchInvites: async () => {
  //   return get().fetchMyInvites();
  // },

  fetchTeamInvites: async (teamId) => {
    const { teamInvitesLoaded, loading } = get();
    if (teamInvitesLoaded[teamId] || loading) return;

    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(`/teams/${teamId}/invites`, {
        headers: getAuthHeaders(),
      });

      const teamInvites =
        res.data?.invites || res.data?.items || res.data || [];
      console.log(`Fetched ${teamInvites.length} invites for team ${teamId}`);

      // FIX: Don't overwrite global invites, store team-specific invites separately
      set((state) => ({
        // Store team invites separately to avoid pollution
        teamInvites: {
          ...state.teamInvites,
          [teamId]: teamInvites,
        },
        loading: false,
        teamInvitesLoaded: { ...state.teamInvitesLoaded, [teamId]: true },
      }));
    } catch (err: any) {
      console.error("fetchTeamInvites error:", err);
      set((state) => ({
        error: err?.response?.data?.message || "Failed to fetch team invites",
        loading: false,
        teamInvitesLoaded: { ...state.teamInvitesLoaded, [teamId]: true },
      }));
    }
  },

  createTeam: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.post("/teams/create-team", data, {
        headers: getAuthHeaders(),
      });

      const newTeam = res.data?.team || res.data;
      console.log("Created team:", newTeam?.name);

      set((state) => ({
        teams: [...state.teams, newTeam],
        loading: false,
      }));
      return newTeam;
    } catch (err: any) {
      console.error("createTeam error:", err);
      set({
        error: err?.response?.data?.message || "Failed to create team",
        loading: false,
      });
      return null;
    }
  },

  sendInvite: async (teamId, email, role) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.post(
        `/teams/${teamId}/invites`,
        { email, role, teamId },
        { headers: getAuthHeaders() }
      );

      const newInvite = res.data?.invite || res.data;
      console.log("Sent invite to:", email);

      set((state) => ({
        invites: [...state.invites, newInvite],
        teamInvites: {
          ...(state.teamInvites || {}),
          [teamId]: [...((state.teamInvites || {})[teamId] || []), newInvite],
        },
        loading: false,
      }));
      return newInvite;
    } catch (err: any) {
      console.error("sendInvite error:", err);
      set({
        error: err?.response?.data?.message || "Failed to send invite",
        loading: false,
      });
      return null;
    }
  },

  acceptInvite: async (token) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.post(
        "/teams/invites/accept",
        { token },
        { headers: getAuthHeaders() }
      );

      console.log("Accepted invite for team:", res.data?.teamId);
      set({ loading: false });

      // Refresh data after accepting
      await get().fetchTeams();
      set((state) => ({
        myInvitesLoaded: false, // Force refresh
      }));

      return res.data;
    } catch (err: any) {
      console.error("acceptInvite error:", err);
      set({
        error: err?.response?.data?.message || "Failed to accept invite",
        loading: false,
      });
      return null;
    }
  },

  declineInvite: async (token) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.post(
        "/teams/invites/decline",
        { token },
        { headers: getAuthHeaders() }
      );

      console.log("Declined invite");
      set((state) => ({
        loading: false,
        myInvitesLoaded: false, // Force refresh
      }));

      return true;
    } catch (err: any) {
      console.error("declineInvite error:", err);
      set({
        error: err?.response?.data?.message || "Failed to decline invite",
        loading: false,
      });
      return false;
    }
  },

  updateMemberRole: async (teamId, memberId, role) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.patch(
        `/teams/${teamId}/members/${memberId}/role`,
        { role },
        { headers: getAuthHeaders() }
      );

      console.log(`Updated member ${memberId} role to ${role}`);

      set((state) => ({
        members: state.members.map((m) =>
          m.id === memberId ? { ...m, role: role as any } : m
        ),
        loading: false,
      }));
      return true;
    } catch (err: any) {
      console.error("updateMemberRole error:", err);
      set({
        error: err?.response?.data?.message || "Failed to update role",
        loading: false,
      });
      return false;
    }
  },

  deleteTeam: async (teamId) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/teams/${teamId}`, {
        headers: getAuthHeaders(),
      });

      console.log("Deleted team:", teamId);

      set((state) => ({
        teams: state.teams.filter((t) => t.id !== teamId),
        currentTeam:
          state.currentTeam?.id === teamId ? null : state.currentTeam,
        loading: false,
      }));
      return true;
    } catch (err: any) {
      console.error("deleteTeam error:", err);
      set({
        error: err?.response?.data?.message || "Failed to delete team",
        loading: false,
      });
      return false;
    }
  },

  leaveTeam: async (teamId) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/teams/${teamId}/leave`, {
        headers: getAuthHeaders(),
      });

      console.log("Left team:", teamId);

      set((state) => ({
        teams: state.teams.filter((t) => t.id !== teamId),
        currentTeam:
          state.currentTeam?.id === teamId ? null : state.currentTeam,
        loading: false,
      }));
      return true;
    } catch (err: any) {
      console.error("leaveTeam error:", err);
      set({
        error: err?.response?.data?.message || "Failed to leave team",
        loading: false,
      });
      return false;
    }
  },

  removeMember: async (teamId, memberId) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/teams/${teamId}/members/${memberId}`, {
        headers: getAuthHeaders(),
      });

      console.log("Removed member:", memberId);

      set((state) => ({
        members: state.members.filter((m) => m.id !== memberId),
        loading: false,
      }));
      return true;
    } catch (err: any) {
      console.error("removeMember error:", err);
      set({
        error: err?.response?.data?.message || "Failed to remove member",
        loading: false,
      });
      return false;
    }
  },

  cancelInvite: async (teamId, inviteId) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/teams/${teamId}/invites/${inviteId}`, {
        headers: getAuthHeaders(),
      });

      console.log("Cancelled invite:", inviteId);

      // Remove from both invites arrays
      set((state) => ({
        invites: state.invites.filter((i) => i.id !== inviteId),
        myInvites: state.myInvites.filter((i) => i.id !== inviteId),
        loading: false,
      }));

      return true;
    } catch (err: any) {
      console.error("cancelInvite error:", err);
      set({
        error: err?.response?.data?.message || "Failed to cancel invite",
        loading: false,
      });
      return false;
    }
  },

  getTeamInvites: (teamId: string) => {
    const state = get();
    return state.teamInvites?.[teamId] || [];
  },

  setCurrentTeam: (team) => set({ currentTeam: team }),

  clearError: () => set({ error: null }),

  reset: () => {
    console.log("Resetting team store");
    set({
      teams: [],
      currentTeam: null,
      members: [],
      invites: [], // This should only be used for team-specific invites in team detail pages
      myInvites: [], // This is for user's received invites
      teamInvites: {}, // ADD: Store team-specific invites separately
      loading: false,
      error: null,
      teamsLoaded: false,
      teamMembersLoaded: {},
      teamInvitesLoaded: {},
      myInvitesLoaded: false,
    });
  },
}));
