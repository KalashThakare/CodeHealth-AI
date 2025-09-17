// import { create } from "zustand";
// import { axiosInstance } from "@/lib/axios";

// type Team = {
//   id: string;
//   _id?: string;
//   name: string;
//   description: string;
//   slug: string;
//   userId: string;
//   createdAt: string;
//   updatedAt: string;
//   members?: Member[];
//   projects?: any[];
// };

// type Member = {
//   id: string;
//   name: string;
//   email: string;
//   role: "Owner" | "Manager" | "Member";
// };

// type Invite = {
//   id: string;
//   teamId: string;
//   email: string;
//   role: string;
//   expiresAt: string;
//   status: string;
// };

// type TeamStore = {
//   teams: Team[];
//   currentTeam: Team | null;
//   members: Member[];
//   invites: Invite[];
//   loading: boolean;
//   error: string | null;

//   teamsLoaded: boolean;
//   teamMembersLoaded: Record<string, boolean>;
//   teamInvitesLoaded: Record<string, boolean>;

//   fetchTeams: () => Promise<void>;
//   // fetchInvites: () => Promise<void>;
//   fetchTeamMembers: (teamId: string) => Promise<void>;
//   fetchTeamInvites: (teamId: string) => Promise<void>;
//   createTeam: (data: {
//     name: string;
//     description: string;
//   }) => Promise<Team | null>;
//   sendInvite: (
//     teamId: string,
//     email: string,
//     role: string
//   ) => Promise<Invite | null>;
//   acceptInvite: (token: string) => Promise<any>;
//   updateMemberRole: (
//     teamId: string,
//     memberId: string,
//     role: string
//   ) => Promise<boolean>;
//   deleteTeam: (teamId: string) => Promise<boolean>;
//   leaveTeam: (teamId: string) => Promise<boolean>;
//   removeMember: (teamId: string, memberId: string) => Promise<boolean>;
//   cancelInvite: (inviteId: string) => Promise<boolean>;
//   setCurrentTeam: (team: Team | null) => void;
//   clearError: () => void;
//   reset: () => void;
// };

// function getAuthHeaders() {
//   const token =
//     typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
//   return token ? { Authorization: `Bearer ${token}` } : {};
// }

// export const useTeamStore = create<TeamStore>((set, get) => ({
//   teams: [],
//   currentTeam: null,
//   members: [],
//   invites: [],
//   loading: false,
//   error: null,

//   teamsLoaded: false,
//   teamMembersLoaded: {},
//   teamInvitesLoaded: {},

//   fetchTeams: async () => {
//     set({ loading: true, error: null });
//     try {
//       console.log("Fetching teams...");
//       const headers = getAuthHeaders();
//       console.log("Auth headers:", headers);

//       const res = await axiosInstance.get("/teams/my/teams", {
//         headers,
//       });

//       console.log("Teams response:", res.data);

//       // Handle both possible response formats
//       const teams = res.data.teams || res.data || [];
//       set({ teams, loading: false });

//       console.log("Teams set in store:", teams);
//     } catch (err: any) {
//       console.error("fetchTeams error:", err);
//       const errorMessage =
//         err?.response?.data?.message || err?.message || "Failed to fetch teams";
//       set({
//         error: errorMessage,
//         loading: false,
//         teams: [], // Reset teams on error
//       });
//     }
//   },

//   // fetchInvites: async () => {
//   //   set({ loading: true, error: null });
//   //   try {
//   //     const res = await axiosInstance.get("/teams/invites", {
//   //       headers: getAuthHeaders(),
//   //     });

//   //     const invites = res.data.invites || res.data || [];
//   //     set({ invites, loading: false });
//   //   } catch (err: any) {
//   //     console.error("fetchInvites error:", err);
//   //     set({
//   //       error: err?.response?.data?.message || "Failed to fetch invites",
//   //       loading: false,
//   //     });
//   //   }
//   // },

//   fetchTeamMembers: async (teamId) => {
//     set({ loading: true, error: null });
//     try {
//       const res = await axiosInstance.get(`/teams/${teamId}/members`, {
//         headers: getAuthHeaders(),
//       });

//       const members = res.data.members || res.data || [];
//       set({ members, loading: false });
//     } catch (err: any) {
//       console.error("fetchTeamMembers error:", err);
//       set({
//         error: err?.response?.data?.message || "Failed to fetch members",
//         loading: false,
//       });
//     }
//   },

//   fetchTeamInvites: async (teamId) => {
//     set({ loading: true, error: null });
//     try {
//       const res = await axiosInstance.get(`/teams/${teamId}/invites`, {
//         headers: getAuthHeaders(),
//       });

//       const invites = res.data.invites || res.data || [];
//       set({ invites, loading: false });
//     } catch (err: any) {
//       console.error("fetchTeamInvites error:", err);
//       set({
//         error: err?.response?.data?.message || "Failed to fetch invites",
//         loading: false,
//       });
//     }
//   },

//   createTeam: async (data) => {
//     set({ loading: true, error: null });
//     try {
//       const res = await axiosInstance.post("/teams/create-team", data, {
//         headers: getAuthHeaders(),
//       });

//       const newTeam = res.data.team || res.data;
//       set((state) => ({
//         teams: [...state.teams, newTeam],
//         loading: false,
//       }));
//       return newTeam;
//     } catch (err: any) {
//       console.error("createTeam error:", err);
//       set({
//         error: err?.response?.data?.message || "Failed to create team",
//         loading: false,
//       });
//       return null;
//     }
//   },

//   sendInvite: async (teamId, email, role) => {
//     set({ loading: true, error: null });
//     try {
//       const res = await axiosInstance.post(
//         `/teams/${teamId}/invites`,
//         { email, role, teamId },
//         { headers: getAuthHeaders() }
//       );

//       const newInvite = res.data.invite || res.data;
//       set((state) => ({
//         invites: [...state.invites, newInvite],
//         loading: false,
//       }));
//       return newInvite;
//     } catch (err: any) {
//       console.error("sendInvite error:", err);
//       set({
//         error: err?.response?.data?.message || "Failed to send invite",
//         loading: false,
//       });
//       return null;
//     }
//   },

//   acceptInvite: async (token) => {
//     set({ loading: true, error: null });
//     try {
//       const res = await axiosInstance.post(
//         "/teams/invites/accept",
//         { token },
//         { headers: getAuthHeaders() }
//       );
//       set({ loading: false });
//       // Refresh teams after accepting invite
//       await get().fetchTeams();
//       return res.data;
//     } catch (err: any) {
//       console.error("acceptInvite error:", err);
//       set({
//         error: err?.response?.data?.message || "Failed to accept invite",
//         loading: false,
//       });
//       return null;
//     }
//   },

//   updateMemberRole: async (teamId, memberId, role) => {
//     set({ loading: true, error: null });
//     try {
//       await axiosInstance.patch(
//         `/teams/${teamId}/members/${memberId}/role`,
//         { role },
//         { headers: getAuthHeaders() }
//       );
//       // Update member in local state
//       set((state) => ({
//         members: state.members.map((member) =>
//           member.id === memberId ? { ...member, role: role as any } : member
//         ),
//         loading: false,
//       }));
//       return true;
//     } catch (err: any) {
//       console.error("updateMemberRole error:", err);
//       set({
//         error: err?.response?.data?.message || "Failed to update role",
//         loading: false,
//       });
//       return false;
//     }
//   },

//   deleteTeam: async (teamId) => {
//     set({ loading: true, error: null });
//     try {
//       await axiosInstance.delete(`/teams/${teamId}`, {
//         headers: getAuthHeaders(),
//       });
//       set((state) => ({
//         teams: state.teams.filter((t) => t.id !== teamId),
//         currentTeam:
//           state.currentTeam?.id === teamId ? null : state.currentTeam,
//         loading: false,
//       }));
//       return true;
//     } catch (err: any) {
//       console.error("deleteTeam error:", err);
//       set({
//         error: err?.response?.data?.message || "Failed to delete team",
//         loading: false,
//       });
//       return false;
//     }
//   },

//   leaveTeam: async (teamId) => {
//     set({ loading: true, error: null });
//     try {
//       await axiosInstance.delete(`/teams/${teamId}/leave`, {
//         headers: getAuthHeaders(),
//       });
//       set((state) => ({
//         teams: state.teams.filter((t) => t.id !== teamId),
//         currentTeam:
//           state.currentTeam?.id === teamId ? null : state.currentTeam,
//         loading: false,
//       }));
//       return true;
//     } catch (err: any) {
//       console.error("leaveTeam error:", err);
//       set({
//         error: err?.response?.data?.message || "Failed to leave team",
//         loading: false,
//       });
//       return false;
//     }
//   },

//   removeMember: async (teamId, memberId) => {
//     set({ loading: true, error: null });
//     try {
//       await axiosInstance.delete(`/teams/${teamId}/members/${memberId}`, {
//         headers: getAuthHeaders(),
//       });
//       set((state) => ({
//         members: state.members.filter((m) => m.id !== memberId),
//         loading: false,
//       }));
//       return true;
//     } catch (err: any) {
//       console.error("removeMember error:", err);
//       set({
//         error: err?.response?.data?.message || "Failed to remove member",
//         loading: false,
//       });
//       return false;
//     }
//   },

//   cancelInvite: async (inviteId) => {
//     set({ loading: true, error: null });
//     try {
//       await axiosInstance.delete(`/teams/invites/${inviteId}`, {
//         headers: getAuthHeaders(),
//       });
//       set((state) => ({
//         invites: state.invites.filter((i) => i.id !== inviteId),
//         loading: false,
//       }));
//       return true;
//     } catch (err: any) {
//       console.error("cancelInvite error:", err);
//       set({
//         error: err?.response?.data?.message || "Failed to cancel invite",
//         loading: false,
//       });
//       return false;
//     }
//   },

//   setCurrentTeam: (team) => set({ currentTeam: team }),

//   clearError: () => set({ error: null }),

//   reset: () =>
//     set({
//       teams: [],
//       currentTeam: null,
//       members: [],
//       invites: [],
//       loading: false,
//       error: null,
//     }),
// }));


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
  name: string;
  email: string;
  role: "Owner" | "Manager" | "Member";
};

type Invite = {
  id: string;
  teamId: string;
  email: string;
  role: string;
  expiresAt: string;
  status: string;
};

type TeamStore = {
  teams: Team[];
  currentTeam: Team | null;
  members: Member[];
  invites: Invite[];
  loading: boolean;
  error: string | null;

  // lightweight flags to prevent duplicate fetches
  teamsLoaded: boolean;
  teamMembersLoaded: Record<string, boolean>;
  teamInvitesLoaded: Record<string, boolean>;

  fetchTeams: () => Promise<void>;
  fetchTeamMembers: (teamId: string) => Promise<void>;
  fetchTeamInvites: (teamId: string) => Promise<void>;
  createTeam: (data: {
    name: string;
    description: string;
  }) => Promise<Team | null>;
  sendInvite: (
    teamId: string,
    email: string,
    role: string
  ) => Promise<Invite | null>;
  acceptInvite: (token: string) => Promise<any>;
  updateMemberRole: (
    teamId: string,
    memberId: string,
    role: string
  ) => Promise<boolean>;
  deleteTeam: (teamId: string) => Promise<boolean>;
  leaveTeam: (teamId: string) => Promise<boolean>;
  removeMember: (teamId: string, memberId: string) => Promise<boolean>;
  cancelInvite: (inviteId: string) => Promise<boolean>;
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
  teams: [],
  currentTeam: null,
  members: [],
  invites: [],
  loading: false,
  error: null,

  teamsLoaded: false,
  teamMembersLoaded: {},
  teamInvitesLoaded: {},

  fetchTeams: async () => {
    const { teamsLoaded, loading } = get();
    if (teamsLoaded || loading) return;
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get("/teams/my/teams", {
        headers: getAuthHeaders(),
      });
      const teams = res.data?.teams || [];
      set({
        teams,
        loading: false,
        teamsLoaded: true,
      });
    } catch (err: any) {
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
      set((state) => ({
        members,
        loading: false,
        teamMembersLoaded: { ...state.teamMembersLoaded, [teamId]: true },
      }));
    } catch (err: any) {
      set((state) => ({
        error: err?.response?.data?.message || "Failed to fetch members",
        loading: false,
        teamMembersLoaded: { ...state.teamMembersLoaded, [teamId]: true },
      }));
    }
  },

  fetchTeamInvites: async (teamId) => {
    const { teamInvitesLoaded, loading } = get();
    if (teamInvitesLoaded[teamId] || loading) return;
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(`/teams/${teamId}/invites`, {
        headers: getAuthHeaders(),
      });
      const invites = res.data.invites || [];
      set((state) => ({
        invites,
        loading: false,
        teamInvitesLoaded: { ...state.teamInvitesLoaded, [teamId]: true },
      }));
    } catch (err: any) {
      set((state) => ({
        error: err?.response?.data?.message || "Failed to fetch invites",
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
      const newTeam = res.data.team || res.data;
      set((state) => ({
        teams: [...state.teams, newTeam],
        loading: false,
      }));
      return newTeam;
    } catch (err: any) {
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
      const newInvite = res.data.invite || res.data;
      set((state) => ({
        invites: [...state.invites, newInvite],
        loading: false,
      }));
      return newInvite;
    } catch (err: any) {
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
      set({ loading: false });
      await get().fetchTeams();
      return res.data;
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to accept invite",
        loading: false,
      });
      return null;
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
      set((state) => ({
        members: state.members.map((m) =>
          m.id === memberId ? { ...m, role: role as any } : m
        ),
        loading: false,
      }));
      return true;
    } catch (err: any) {
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
      set((state) => ({
        teams: state.teams.filter((t) => t.id !== teamId),
        currentTeam:
          state.currentTeam?.id === teamId ? null : state.currentTeam,
        loading: false,
      }));
      return true;
    } catch (err: any) {
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
      set((state) => ({
        teams: state.teams.filter((t) => t.id !== teamId),
        currentTeam:
          state.currentTeam?.id === teamId ? null : state.currentTeam,
        loading: false,
      }));
      return true;
    } catch (err: any) {
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
      set((state) => ({
        members: state.members.filter((m) => m.id !== memberId),
        loading: false,
      }));
      return true;
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to remove member",
        loading: false,
      });
      return false;
    }
  },

  cancelInvite: async (inviteId) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/teams/invites/${inviteId}`, {
        headers: getAuthHeaders(),
      });
      set((state) => ({
        invites: state.invites.filter((i) => i.id !== inviteId),
        loading: false,
      }));
      return true;
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to cancel invite",
        loading: false,
      });
      return false;
    }
  },

  setCurrentTeam: (team) => set({ currentTeam: team }),

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      teams: [],
      currentTeam: null,
      members: [],
      invites: [],
      loading: false,
      error: null,
      teamsLoaded: false,
      teamMembersLoaded: {},
      teamInvitesLoaded: {},
    }),
}));