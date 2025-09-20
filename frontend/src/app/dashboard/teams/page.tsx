"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/services/AuthGuard";
import { useAuthStore } from "@/store/authStore";
import { useTeamStore } from "@/store/teamStore";
import Link from "next/link";
import { DashboardNavbar } from "../_components/DashboardNavbar";

const TeamsPage = () => {
  const router = useRouter();
  const { authUser } = useAuthStore();
  const {
    teams,
    myInvites, 
    loading,
    error,
    fetchTeams,
    fetchMyInvites,
    deleteTeam,
    leaveTeam,
    clearError,
    teamsLoaded,
    myInvitesLoaded,
  } = useTeamStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const [leavingTeamId, setLeavingTeamId] = useState<string | null>(null);

  useEffect(() => {
    if (authUser) {
      if (!teamsLoaded) {
        console.log("🔄 Teams page: Fetching user teams...");
        fetchTeams();
      }
      if (!myInvitesLoaded) {
        console.log("🔄 Teams page: Fetching received invites...");
        fetchMyInvites();
      }
    }
  }, [authUser, fetchTeams, fetchMyInvites, teamsLoaded, myInvitesLoaded]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteTeam = async (teamId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this team? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingTeamId(teamId);
    const success = await deleteTeam(teamId);
    setDeletingTeamId(null);

    if (success) {
      console.log("✅ Team deleted successfully");
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to leave this team?")) {
      return;
    }

    setLeavingTeamId(teamId);
    const success = await leaveTeam(teamId);
    setLeavingTeamId(null);

    if (success) {
      console.log("✅ Left team successfully");
    }
  };

  const pendingReceivedInvites = myInvites.filter((invite) => {
    const now = new Date();
    const expiresAt = new Date(invite.expiresAt);
    return (
      invite.status === "pending" ||
      (!invite.acceptedAt && !invite.revokedAt && now < expiresAt)
    );
  });

  const isUserOwner = (team: any) => {
    return team.userId === authUser?.id;
  };

  if (!authUser) {
    return null;
  }

  if (loading && teams.length === 0) {
    return (
      <div className="min-h-screen glass-bg">
        <DashboardNavbar currentTeam={null} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg">
      <DashboardNavbar currentTeam={null} />

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Teams</h1>
            <p className="text-text/70">
              Manage your teams and collaborate with others
            </p>
          </div>
          <Link
            href="/dashboard/teams/create"
            className="glass-btn glass-btn-primary px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
          >
            Create Team
          </Link>
        </div>

        {error && (
          <div className="glass-card bg-red-500/10 border-red-500/30 p-4 rounded-lg mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* FIX: Show pending invites notification */}
        {pendingReceivedInvites.length > 0 && (
          <div className="glass-card bg-yellow-500/10 border-yellow-500/30 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-yellow-400">
                  Pending Invitations
                </h3>
                <p className="text-yellow-300/80">
                  You have {pendingReceivedInvites.length} pending team
                  invitation{pendingReceivedInvites.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Link
                href="/dashboard/invites"
                className="glass-btn glass-btn-secondary px-4 py-2 rounded-lg text-sm"
              >
                View Invites
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4 rounded-xl text-center">
            <h3 className="text-sm font-medium text-text/70 mb-1">
              Total Teams
            </h3>
            <p className="text-2xl font-bold text-primary">{teams.length}</p>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <h3 className="text-sm font-medium text-text/70 mb-1">
              Teams Owned
            </h3>
            <p className="text-2xl font-bold text-blue-400">
              {teams.filter((t) => isUserOwner(t)).length}
            </p>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <h3 className="text-sm font-medium text-text/70 mb-1">
              Total Members
            </h3>
            <p className="text-2xl font-bold text-green-400">
              {teams.reduce(
                (total, team) => total + (team.members?.length || 0),
                0
              )}
            </p>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <h3 className="text-sm font-medium text-text/70 mb-1">
              Pending Invites
            </h3>
            <p className="text-2xl font-bold text-yellow-500">
              {pendingReceivedInvites.length}
            </p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl shadow-xl mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input pl-12 pr-4 py-3 rounded-lg"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {filteredTeams.length === 0 && searchTerm === "" ? (
          <div className="text-center py-12">
            <div className="glass-card p-8 rounded-2xl shadow-xl max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-4">No Teams Yet</h3>
              <p className="text-text/70 mb-6">
                Create your first team or wait for an invitation to join a team.
              </p>
              <Link
                href="/dashboard/teams/create"
                className="glass-btn glass-btn-primary px-6 py-3 rounded-lg font-medium transition-all inline-block"
              >
                Create Team
              </Link>
              {pendingReceivedInvites.length > 0 && (
                <Link
                  href="/dashboard/invites"
                  className="glass-btn glass-btn-secondary px-6 py-3 rounded-lg font-medium transition-all inline-block"
                >
                  View Invites ({pendingReceivedInvites.length})
                </Link>
              )}
            </div>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <div className="glass-card p-8 rounded-2xl shadow-xl max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-4">No Results Found</h3>
              <p className="text-text/70 mb-6">
                No teams match your search criteria.
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="glass-btn glass-btn-secondary px-6 py-3 rounded-lg font-medium transition-all"
              >
                Clear Search
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <div
                key={team.id || team._id}
                className="glass-card p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {team.name}
                    </h3>
                    <p className="text-text/70 text-sm line-clamp-3">
                      {team.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {isUserOwner(team) && (
                      <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-medium">
                        Owner
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-text/60 mb-4">
                  <span>{team.members?.length || 0} members</span>
                  <span>{team.projects?.length || 0} projects</span>
                  <span>{new Date(team.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <Link
                    href={`/dashboard/teams/${team.id || team._id}`}
                    className="flex-1 glass-btn glass-btn-primary text-center py-2 rounded-lg text-sm transition-all hover:scale-105"
                  >
                    Manage Team
                  </Link>

                  {isUserOwner(team) ? (
                    <button
                      onClick={() => handleDeleteTeam(team.id || team._id!)}
                      disabled={deletingTeamId === (team.id || team._id)}
                      className="glass-btn glass-btn-danger px-4 py-2 rounded-lg text-sm transition-all hover:scale-105 disabled:opacity-50"
                      title="Delete Team"
                    >
                      {deletingTeamId === (team.id || team._id) ? (
                        <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLeaveTeam(team.id || team._id!)}
                      disabled={leavingTeamId === (team.id || team._id)}
                      className="glass-btn glass-btn-warning px-4 py-2 rounded-lg text-sm transition-all hover:scale-105 disabled:opacity-50"
                      title="Leave Team"
                    >
                      {leavingTeamId === (team.id || team._id) ? (
                        <div className="w-4 h-4 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Wrap with AuthGuard
export default function TeamsPageWithAuth() {
  return (
    <AuthGuard>
      <TeamsPage />
    </AuthGuard>
  );
}
