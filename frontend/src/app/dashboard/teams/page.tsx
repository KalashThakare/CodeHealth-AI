"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useTeamStore } from "@/store/teamStore";
import {
  Plus,
  Search,
  Users,
  Settings,
  Trash2,
  LogOut,
  Mail,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";

const TeamsPage = () => {
  const router = useRouter();
  const { authUser } = useAuthStore();
  const {
    teams,
    invites,
    loading,
    error,
    fetchTeams,
    // fetchInvites,
    deleteTeam,
    leaveTeam,
    clearError,
  } = useTeamStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const [leavingTeamId, setLeavingTeamId] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser) {
      router.replace("/login");
      return;
    }

    fetchTeams();
    // fetchInvites();
  }, [
    authUser, 
    fetchTeams, 
    // fetchInvites
  ]);

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
      // Team will be automatically removed from the store
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
      // Team will be automatically removed from the store
    }
  };

  if (!authUser) {
    return null;
  }

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--color-fg)" }}
            >
              Teams
            </h1>
            <p className="mt-2" style={{ color: "var(--color-fg-secondary)" }}>
              Manage your teams and collaborate with others
            </p>
          </div>
          <Link
            href="/dashboard/teams/create"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "white",
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Create Team</span>
          </Link>
        </div>

        {/* Error Display */}
        {error && (
          <div
            className="mb-6 p-4 rounded-lg border flex items-center space-x-3"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "#ef4444",
              color: "#ef4444",
            }}
          >
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button
              onClick={clearError}
              className="ml-auto text-sm underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--color-fg-secondary)" }}
            />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
                color: "var(--color-fg)",
              }}
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex items-center space-x-3">
              <Users
                className="w-8 h-8"
                style={{ color: "var(--color-primary)" }}
              />
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "var(--color-fg)" }}
                >
                  {teams.length}
                </p>
                <p style={{ color: "var(--color-fg-secondary)" }}>
                  Total Teams
                </p>
              </div>
            </div>
          </div>

          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex items-center space-x-3">
              <Mail
                className="w-8 h-8"
                style={{ color: "var(--color-primary)" }}
              />
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "var(--color-fg)" }}
                >
                  {invites.length}
                </p>
                <p style={{ color: "var(--color-fg-secondary)" }}>
                  Pending Invites
                </p>
              </div>
            </div>
          </div>

          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex items-center space-x-3">
              <Settings
                className="w-8 h-8"
                style={{ color: "var(--color-primary)" }}
              />
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "var(--color-fg)" }}
                >
                  {teams.filter((t) => t.userId === authUser?._id).length}
                </p>
                <p style={{ color: "var(--color-fg-secondary)" }}>
                  Owned Teams
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Invites */}
        {invites.length > 0 && (
          <div className="mb-8">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--color-fg)" }}
            >
              Pending Invites
            </h2>
            <div className="space-y-3">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="p-4 rounded-lg border flex items-center justify-between"
                  style={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Clock
                      className="w-5 h-5"
                      style={{ color: "var(--color-fg-secondary)" }}
                    />
                    <div>
                      <p
                        className="font-medium"
                        style={{ color: "var(--color-fg)" }}
                      >
                        Team Invite
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "var(--color-fg-secondary)" }}
                      >
                        Role: {invite.role} • Expires:{" "}
                        {new Date(invite.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    className="px-3 py-1 text-sm rounded-lg border transition-colors hover:opacity-80"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "white",
                      borderColor: "var(--color-primary)",
                    }}
                  >
                    View Invite
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teams Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: "var(--color-primary)" }}
            />
          </div>
        ) : filteredTeams.length === 0 ? (
          <div
            className="text-center py-12 rounded-lg border"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <Users
              className="w-12 h-12 mx-auto mb-4"
              style={{ color: "var(--color-fg-secondary)" }}
            />
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: "var(--color-fg)" }}
            >
              {searchTerm ? "No teams found" : "No teams yet"}
            </h3>
            <p className="mb-4" style={{ color: "var(--color-fg-secondary)" }}>
              {searchTerm
                ? "Try adjusting your search terms"
                : "Create your first team to get started"}
            </p>
            {!searchTerm && (
              <Link
                href="/dashboard/teams/create"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                }}
              >
                <Plus className="w-4 h-4" />
                <span>Create Team</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => {
              const isOwner = team.userId === authUser?._id;
              const isDeleting = deletingTeamId === team.id;
              const isLeaving = leavingTeamId === team.id;

              return (
                <div
                  key={team.id}
                  className="p-6 rounded-lg border hover:shadow-lg transition-all duration-200 group"
                  style={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3
                        className="text-lg font-semibold group-hover:text-blue-600 transition-colors"
                        style={{ color: "var(--color-fg)" }}
                      >
                        {team.name}
                      </h3>
                      <p
                        className="text-sm mt-1"
                        style={{ color: "var(--color-fg-secondary)" }}
                      >
                        {team.description}
                      </p>
                    </div>
                    {isOwner && (
                      <span
                        className="px-2 py-1 text-xs rounded-full"
                        style={{
                          backgroundColor: "var(--color-primary)",
                          color: "white",
                        }}
                      >
                        Owner
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 mb-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Users
                        className="w-4 h-4"
                        style={{ color: "var(--color-fg-secondary)" }}
                      />
                      <span style={{ color: "var(--color-fg-secondary)" }}>
                        {team.members?.length || 0} members
                      </span>
                    </div>
                    <div style={{ color: "var(--color-fg-secondary)" }}>
                      Created {new Date(team.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/teams/${team.id}`}
                      className="flex-1 px-3 py-2 text-sm rounded-lg border transition-colors text-center"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        color: "white",
                        borderColor: "var(--color-primary)",
                      }}
                    >
                      Manage
                    </Link>

                    {isOwner ? (
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        disabled={isDeleting}
                        className="p-2 rounded-lg border transition-colors hover:bg-red-50 hover:border-red-300"
                        style={{
                          borderColor: "var(--color-border)",
                          color: "#ef4444",
                        }}
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLeaveTeam(team.id)}
                        disabled={isLeaving}
                        className="p-2 rounded-lg border transition-colors hover:bg-red-50 hover:border-red-300"
                        style={{
                          borderColor: "var(--color-border)",
                          color: "#ef4444",
                        }}
                      >
                        {isLeaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <LogOut className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsPage;
