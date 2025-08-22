"use client";
import { useTeamStore } from "@/store/teamStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardThemeToggle } from "@/components/ui/DashboardThemeToggle";

const TeamDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const teamId = params.id as string;

  const { authUser } = useAuthStore();
  const {
    teams,
    currentTeam,
    members,
    invites,
    loading,
    error,
    fetchTeamMembers,
    fetchTeamInvites,
    sendInvite,
    updateMemberRole,
    removeMember,
    cancelInvite,
    deleteTeam,
    leaveTeam,
    setCurrentTeam,
  } = useTeamStore();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Find team from the teams array
  const team = teams.find((t) => t.id === teamId || t._id === teamId);

  useEffect(() => {
    if (team) {
      setCurrentTeam(team);
      fetchTeamMembers(teamId);
      fetchTeamInvites(teamId);
    }
  }, [team, teamId, setCurrentTeam, fetchTeamMembers, fetchTeamInvites]);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const result = await sendInvite(teamId, inviteEmail.trim(), inviteRole);
    if (result) {
      setInviteEmail("");
      setShowInviteModal(false);
      fetchTeamInvites(teamId);
    }
  };

  const handleDeleteTeam = async () => {
    const success = await deleteTeam(teamId);
    if (success) {
      router.push("/dashboard/teams");
    }
  };

  const handleLeaveTeam = async () => {
    const success = await leaveTeam(teamId);
    if (success) {
      router.push("/dashboard/teams");
    }
  };

  const isOwner = team?.userId === authUser?._id;

  if (!authUser) {
    router.replace("/login");
    return null;
  }

  if (!team) {
    return (
      <div className="min-h-screen glass-bg flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl shadow-xl text-center">
          <h2 className="text-xl font-semibold mb-4">Team Not Found</h2>
          <p className="text-text/70 mb-6">
            The team you're looking for doesn't exist or you don't have access
            to it.
          </p>
          <Link
            href="/dashboard/teams"
            className="glass-btn glass-btn-primary px-6 py-3 rounded-lg font-medium transition-all inline-block"
          >
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg">
      {/* Header */}
      <div className="glass-nav sticky top-0 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard/teams"
            className="text-lg font-semibold text-primary hover:text-primary/80"
          >
            ← Back to Teams
          </Link>
          <div className="flex items-center gap-4">
            <DashboardThemeToggle />
            {isOwner && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="glass-btn glass-btn-primary px-4 py-2 rounded-lg font-medium transition-all"
              >
                Invite Member
              </button>
            )}
            <div className="flex items-center gap-2">
              {isOwner ? (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="glass-btn glass-btn-danger px-4 py-2 rounded-lg font-medium transition-all"
                >
                  Delete Team
                </button>
              ) : (
                <button
                  onClick={handleLeaveTeam}
                  className="glass-btn glass-btn-secondary px-4 py-2 rounded-lg font-medium transition-all"
                >
                  Leave Team
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Team Header */}
        <div className="glass-card p-8 rounded-2xl shadow-xl mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{team.name}</h1>
              <p className="text-text/70 text-lg">{team.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-text/60">Created</div>
              <div className="font-medium">
                {new Date(team.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <div className="text-2xl font-bold text-primary">
                {members.length}
              </div>
              <div className="text-sm text-text/60">Members</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <div className="text-2xl font-bold text-yellow-500">
                {invites.length}
              </div>
              <div className="text-sm text-text/60">Pending Invites</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <div className="text-2xl font-bold text-green-500">
                {team.projects?.length || 0}
              </div>
              <div className="text-sm text-text/60">Projects</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Members Section */}
          <div className="glass-card p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-6">Team Members</h2>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text/70">No members yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-text/60">
                          {member.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          member.role === "Owner"
                            ? "bg-purple-500/20 text-purple-400"
                            : member.role === "Manager"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {member.role}
                      </span>

                      {isOwner && member.role !== "Owner" && (
                        <div className="flex gap-1">
                          <select
                            value={member.role}
                            onChange={(e) =>
                              updateMemberRole(
                                teamId,
                                member.id,
                                e.target.value
                              )
                            }
                            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs"
                          >
                            <option value="Member">Member</option>
                            <option value="Manager">Manager</option>
                          </select>
                          <button
                            onClick={() => removeMember(teamId, member.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Invites Section */}
          <div className="glass-card p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-6">Pending Invitations</h2>

            {invites.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text/70">No pending invitations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-4 bg-yellow-50/10 rounded-xl border border-yellow-400/20"
                  >
                    <div>
                      <div className="font-medium">{invite.email}</div>
                      <div className="text-sm text-text/60">
                        Role: {invite.role}
                      </div>
                      <div className="text-xs text-text/40">
                        Expires:{" "}
                        {new Date(invite.expiresAt).toLocaleDateString()}
                      </div>
                    </div>

                    {isOwner && (
                      <button
                        onClick={() => cancelInvite(invite.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-2xl shadow-xl max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Invite Team Member</h3>

            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium mb-2"
                >
                  Role
                </label>
                <select
                  id="role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="Member">Member</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 glass-btn glass-btn-secondary px-4 py-2 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 glass-btn glass-btn-primary px-4 py-2 rounded-lg font-medium transition-all"
                >
                  {loading ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-2xl shadow-xl max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 text-red-400">
              Delete Team
            </h3>

            <p className="text-text/70 mb-6">
              Are you sure you want to delete this team? This action cannot be
              undone and all team data will be permanently lost.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 glass-btn glass-btn-secondary px-4 py-2 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTeam}
                disabled={loading}
                className="flex-1 glass-btn glass-btn-danger px-4 py-2 rounded-lg font-medium transition-all"
              >
                {loading ? "Deleting..." : "Delete Team"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetailPage;
