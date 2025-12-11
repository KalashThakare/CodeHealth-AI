"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useTeamStore } from "@/store/teamStore";
import { DashboardNavbar } from "../../_components/DashboardNavbar";
import { AuthGuard } from "@/services/AuthGuard";
import Link from "next/link";

const TeamDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const teamId = params.id as string;
  const { authUser } = useAuthStore();

  const {
    teams,
    members,
    loading,
    error,
    fetchTeams,
    fetchTeamMembers,
    fetchTeamInvites,
    sendInvite,
    updateMemberRole,
    removeMember,
    deleteTeam,
    leaveTeam,
    cancelInvite,
    clearError,
    getTeamInvites,
    teamMembersLoaded,
    teamInvitesLoaded,
    teamsLoaded,
  } = useTeamStore();

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "Member" as "Owner" | "Manager" | "Member",
  });
  const [sendingInvite, setSendingInvite] = useState(false);

  const currentTeam = teams.find((t) => (t.id || t._id) === teamId);

  const teamInvites = getTeamInvites(teamId);

  useEffect(() => {
    if (authUser) {
      if (!teamsLoaded) {
        fetchTeams();
      }

      if (!teamMembersLoaded[teamId]) {
        fetchTeamMembers(teamId);
      }
      if (!teamInvitesLoaded[teamId]) {
        fetchTeamInvites(teamId);
      }
    }
  }, [
    authUser,
    teamId,
    fetchTeams,
    fetchTeamMembers,
    fetchTeamInvites,
    teamsLoaded,
    teamMembersLoaded,
    teamInvitesLoaded,
  ]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email.trim()) return;

    setSendingInvite(true);
    try {
      const result = await sendInvite(
        teamId,
        inviteForm.email,
        inviteForm.role
      );
      if (result) {
        setInviteForm({ email: "", role: "Member" });
        setShowInviteForm(false);
        console.log("Invite sent successfully");
      }
    } catch (error) {
      console.error("Failed to send invite:", error);
    } finally {
      setSendingInvite(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (
      !window.confirm(
        `Are you sure you want to change this member's role to ${newRole}?`
      )
    ) {
      return;
    }

    try {
      const success = await updateMemberRole(teamId, memberId, newRole);
      if (success) {
        console.log("Member role updated successfully");
      }
    } catch (error) {
      console.error("Failed to update member role:", error);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${memberName} from this team?`
      )
    ) {
      return;
    }

    try {
      const success = await removeMember(teamId, memberId);
      if (success) {
        console.log("Member removed successfully");
      }
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  const handleCancelInvite = async (inviteId: string, email: string) => {
    if (
      !window.confirm(`Are you sure you want to cancel the invite to ${email}?`)
    ) {
      return;
    }

    try {
      const success = await cancelInvite(teamId, inviteId);
      if (success) {
        console.log("Invite cancelled successfully");
      }
    } catch (error) {
      console.error("Failed to cancel invite:", error);
    }
  };

  const handleDeleteTeam = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this team? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const success = await deleteTeam(teamId);
      if (success) {
        router.push("/dashboard/teams");
      }
    } catch (error) {
      console.error("Failed to delete team:", error);
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm("Are you sure you want to leave this team?")) {
      return;
    }

    try {
      const success = await leaveTeam(teamId);
      if (success) {
        router.push("/dashboard/teams");
      }
    } catch (error) {
      console.error("Failed to leave team:", error);
    }
  };

  const isOwnerOrManager = () => {
    if (!currentTeam || !authUser) return false;

    if (currentTeam.userId === authUser.id) return true;

    const userMember = members.find((m) => m.userId === authUser.id);
    return userMember?.role === "Manager";
  };

  const isOwner = () => {
    return currentTeam?.userId === authUser?.id;
  };

  if (loading && !currentTeam) {
    return (
      <div className="min-h-screen glass-bg">
        <DashboardNavbar currentTeam={null} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!currentTeam && teamsLoaded) {
    return (
      <div className="min-h-screen glass-bg">
        <DashboardNavbar currentTeam={null} />
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="glass-card p-8 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold mb-4">Team Not Found</h2>
              <p className="text-text/70 mb-6">
                The team you're looking for doesn't exist or you don't have
                access to it.
              </p>
              <Link
                href="/dashboard/teams"
                className="glass-btn glass-btn-primary px-6 py-3 rounded-lg font-medium transition-all inline-block"
              >
                Back to Teams
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg">
      <DashboardNavbar currentTeam={currentTeam} />

      <div className="max-w-6xl mx-auto p-6">
        {error && (
          <div className="glass-card bg-red-500/10 border-red-500/30 p-4 rounded-lg mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="glass-card p-6 rounded-2xl shadow-xl mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <h1 className="text-3xl font-bold">{currentTeam?.name}</h1>
                {isOwner() && (
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    Owner
                  </span>
                )}
              </div>
              <p className="text-text/70 mb-4">{currentTeam?.description}</p>
              <div className="flex items-center space-x-6 text-sm text-text/60">
                <span>{members.length} members</span>
                <span>{teamInvites.length} pending invites</span>
                <span>
                  Created{" "}
                  {new Date(currentTeam?.createdAt || "").toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isOwnerOrManager() && (
                <button
                  onClick={() => setShowInviteForm(true)}
                  className="glass-btn glass-btn-primary px-4 py-2 rounded-lg transition-all hover:scale-105"
                >
                  Invite Members
                </button>
              )}

              {isOwner() ? (
                <button
                  onClick={handleDeleteTeam}
                  className="glass-btn glass-btn-danger px-4 py-2 rounded-lg transition-all hover:scale-105"
                >
                  Delete Team
                </button>
              ) : (
                <button
                  onClick={handleLeaveTeam}
                  className="glass-btn glass-btn-warning px-4 py-2 rounded-lg transition-all hover:scale-105"
                >
                  Leave Team
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4">
              Members ({members.length})
            </h2>

            {members.length === 0 ? (
              <p className="text-text/70 text-center py-8">No members found</p>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 glass-card rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/40 to-primary/60 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-text/60">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.role === "Owner"
                            ? "bg-primary/20 text-primary"
                            : member.role === "Manager"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {member.role}
                      </span>

                      {isOwnerOrManager() &&
                        member.userId !== authUser?.id &&
                        member.role !== "Owner" && (
                          <div className="flex items-center space-x-1">
                            {member.role !== "Manager" && (
                              <button
                                onClick={() =>
                                  handleUpdateRole(member.id, "Manager")
                                }
                                className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1"
                              >
                                Promote
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleRemoveMember(member.id, member.name)
                              }
                              className="text-red-400 hover:text-red-300 text-xs px-2 py-1"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4">
              Pending Invites ({teamInvites.length})
            </h2>

            {teamInvites.length === 0 ? (
              <p className="text-text/70 text-center py-8">
                No pending invites
              </p>
            ) : (
              <div className="space-y-3">
                {teamInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3 glass-card rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-sm text-text/60">
                        Role: {invite.role} • Expires:{" "}
                        {new Date(invite.expiresAt).toLocaleDateString()}
                      </p>
                    </div>

                    {isOwnerOrManager() && (
                      <button
                        onClick={() =>
                          handleCancelInvite(invite.id, invite.email)
                        }
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showInviteForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass-card p-6 rounded-2xl shadow-2xl w-full max-w-md m-4">
              <h3 className="text-xl font-semibold mb-4">Invite Team Member</h3>

              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, email: e.target.value })
                    }
                    className="w-full glass-input px-4 py-3 rounded-lg"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) =>
                      setInviteForm({
                        ...inviteForm,
                        role: e.target.value as any,
                      })
                    }
                    className="w-full glass-input px-4 py-3 rounded-lg"
                  >
                    <option value="Member">Member</option>
                    <option value="Manager">Manager</option>
                    {isOwner() && <option value="Owner">Owner</option>}
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="glass-btn glass-btn-secondary px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingInvite}
                    className="glass-btn glass-btn-primary px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {sendingInvite ? "Sending..." : "Send Invite"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function TeamDetailPageWithAuth() {
  return (
    <AuthGuard>
      <TeamDetailPage />
    </AuthGuard>
  );
}