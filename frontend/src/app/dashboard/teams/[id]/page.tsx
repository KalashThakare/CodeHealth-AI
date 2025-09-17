"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useTeamStore } from "@/store/teamStore";
import {
  ArrowLeft,
  Users,
  Mail,
  Settings,
  Trash2,
  LogOut,
  Plus,
  Crown,
  Shield,
  User,
  MoreVertical,
  Send,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

const TeamDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const teamId = params.id as string;
  const { authUser } = useAuthStore();

  const {
    teams,
    members,
    invites,
    loading,
    error,
    fetchTeamMembers,
    fetchTeamInvites,
    sendInvite,
    updateMemberRole,
    removeMember,
    deleteTeam,
    leaveTeam,
    clearError,
  } = useTeamStore();

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "Member" as "Owner" | "Manager" | "Member",
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const currentTeam = teams.find((t) => t.id === teamId);
  const isOwner = currentTeam?.userId === authUser?._id;

  useEffect(() => {
    if (!authUser) {
      router.replace("/login");
      return;
    }

    if (!currentTeam) {
      router.replace("/dashboard/teams");
      return;
    }

    fetchTeamMembers(teamId);
    fetchTeamInvites(teamId);
  }, [authUser, currentTeam, teamId, fetchTeamMembers, fetchTeamInvites]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email.trim()) return;

    setActionLoading("invite");
    const success = await sendInvite(teamId, inviteForm.email, inviteForm.role);
    setActionLoading(null);

    if (success) {
      setInviteForm({ email: "", role: "Member" });
      setShowInviteForm(false);
      fetchTeamInvites(teamId); // Refresh invites
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (
      !confirm(
        `Are you sure you want to change this member's role to ${newRole}?`
      )
    ) {
      return;
    }

    setActionLoading(`role-${memberId}`);
    const success = await updateMemberRole(teamId, memberId, newRole);
    setActionLoading(null);

    if (success) {
      fetchTeamMembers(teamId); // Refresh members
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (
      !confirm("Are you sure you want to remove this member from the team?")
    ) {
      return;
    }

    setActionLoading(`remove-${memberId}`);
    const success = await removeMember(teamId, memberId);
    setActionLoading(null);

    if (success) {
      fetchTeamMembers(teamId); // Refresh members
    }
  };

  const handleDeleteTeam = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this team? This action cannot be undone."
      )
    ) {
      return;
    }

    setActionLoading("delete");
    const success = await deleteTeam(teamId);
    setActionLoading(null);

    if (success) {
      router.push("/dashboard/teams");
    }
  };

  const handleLeaveTeam = async () => {
    if (!confirm("Are you sure you want to leave this team?")) {
      return;
    }

    setActionLoading("leave");
    const success = await leaveTeam(teamId);
    setActionLoading(null);

    if (success) {
      router.push("/dashboard/teams");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Owner":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "Manager":
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!authUser || !currentTeam) {
    return null;
  }

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/teams"
            className="inline-flex items-center space-x-2 mb-4 text-sm hover:opacity-80 transition-opacity"
            style={{ color: "var(--color-fg-secondary)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Teams</span>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1
                  className="text-3xl font-bold"
                  style={{ color: "var(--color-fg)" }}
                >
                  {currentTeam.name}
                </h1>
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
              <p
                className="text-lg mb-4"
                style={{ color: "var(--color-fg-secondary)" }}
              >
                {currentTeam.description}
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Users
                    className="w-4 h-4"
                    style={{ color: "var(--color-fg-secondary)" }}
                  />
                  <span style={{ color: "var(--color-fg-secondary)" }}>
                    {members.length} members
                  </span>
                </div>
                <div style={{ color: "var(--color-fg-secondary)" }}>
                  Created {new Date(currentTeam.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isOwner && (
                <button
                  onClick={() => setShowInviteForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "white",
                  }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Invite Member</span>
                </button>
              )}

              {isOwner ? (
                <button
                  onClick={handleDeleteTeam}
                  disabled={actionLoading === "delete"}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg border font-medium transition-colors hover:bg-red-50"
                  style={{
                    color: "#ef4444",
                    borderColor: "#ef4444",
                  }}
                >
                  {actionLoading === "delete" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Delete Team</span>
                </button>
              ) : (
                <button
                  onClick={handleLeaveTeam}
                  disabled={actionLoading === "leave"}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg border font-medium transition-colors hover:bg-red-50"
                  style={{
                    color: "#ef4444",
                    borderColor: "#ef4444",
                  }}
                >
                  {actionLoading === "leave" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  <span>Leave Team</span>
                </button>
              )}
            </div>
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Members Section */}
          <div className="lg:col-span-2">
            <div
              className="rounded-lg border"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
              }}
            >
              <div
                className="p-6 border-b"
                style={{ borderColor: "var(--color-border)" }}
              >
                <h2
                  className="text-xl font-semibold"
                  style={{ color: "var(--color-fg)" }}
                >
                  Team Members ({members.length})
                </h2>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2
                      className="w-8 h-8 animate-spin"
                      style={{ color: "var(--color-primary)" }}
                    />
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-8">
                    <Users
                      className="w-12 h-12 mx-auto mb-4"
                      style={{ color: "var(--color-fg-secondary)" }}
                    />
                    <p
                      className="text-lg font-medium mb-2"
                      style={{ color: "var(--color-fg)" }}
                    >
                      No members yet
                    </p>
                    <p style={{ color: "var(--color-fg-secondary)" }}>
                      Invite people to join your team
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                        style={{
                          backgroundColor: "var(--color-bg)",
                          borderColor: "var(--color-border)",
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {member.name?.charAt(0).toUpperCase() ||
                                member.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p
                              className="font-medium"
                              style={{ color: "var(--color-fg)" }}
                            >
                              {member.name || member.email.split("@")[0]}
                            </p>
                            <p
                              className="text-sm"
                              style={{ color: "var(--color-fg-secondary)" }}
                            >
                              {member.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(member.role)}
                            <span
                              className="text-sm font-medium"
                              style={{ color: "var(--color-fg)" }}
                            >
                              {member.role}
                            </span>
                          </div>

                          {isOwner && member.email !== authUser?.email && (
                            <div className="flex items-center space-x-2">
                              <select
                                value={member.role}
                                onChange={(e) =>
                                  handleUpdateRole(member.id, e.target.value)
                                }
                                disabled={actionLoading === `role-${member.id}`}
                                className="text-sm px-2 py-1 rounded border"
                                style={{
                                  backgroundColor: "var(--color-card)",
                                  borderColor: "var(--color-border)",
                                  color: "var(--color-fg)",
                                }}
                              >
                                <option value="Member">Member</option>
                                <option value="Manager">Manager</option>
                              </select>

                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                disabled={
                                  actionLoading === `remove-${member.id}`
                                }
                                className="p-1 rounded hover:bg-red-50 transition-colors"
                                style={{ color: "#ef4444" }}
                              >
                                {actionLoading === `remove-${member.id}` ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <X className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invites Section */}
          <div>
            <div
              className="rounded-lg border"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
              }}
            >
              <div
                className="p-6 border-b"
                style={{ borderColor: "var(--color-border)" }}
              >
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--color-fg)" }}
                >
                  Pending Invites ({invites.length})
                </h3>
              </div>

              <div className="p-6">
                {invites.length === 0 ? (
                  <div className="text-center py-6">
                    <Mail
                      className="w-8 h-8 mx-auto mb-3"
                      style={{ color: "var(--color-fg-secondary)" }}
                    />
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-fg-secondary)" }}
                    >
                      No pending invites
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invites.map((invite) => (
                      <div
                        key={invite.id}
                        className="p-3 rounded-lg border"
                        style={{
                          backgroundColor: "var(--color-bg)",
                          borderColor: "var(--color-border)",
                        }}
                      >
                        <p
                          className="font-medium text-sm"
                          style={{ color: "var(--color-fg)" }}
                        >
                          {invite.email}
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{ color: "var(--color-fg-secondary)" }}
                        >
                          Role: {invite.role}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--color-fg-secondary)" }}
                        >
                          Expires:{" "}
                          {new Date(invite.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Invite Form Modal */}
        {showInviteForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 backdrop-blur-sm"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
              onClick={() => setShowInviteForm(false)}
            />
            <div
              className="relative rounded-lg shadow-lg w-full max-w-md p-6"
              style={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--color-fg)" }}
                >
                  Invite Team Member
                </h3>
                <button
                  onClick={() => setShowInviteForm(false)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "var(--color-fg-secondary)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--color-fg)" }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-fg)",
                    }}
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--color-fg)" }}
                  >
                    Role
                  </label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) =>
                      setInviteForm((prev) => ({
                        ...prev,
                        role: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-fg)",
                    }}
                  >
                    <option value="Member">Member</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={
                      actionLoading === "invite" || !inviteForm.email.trim()
                    }
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "white",
                    }}
                  >
                    {actionLoading === "invite" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Invite</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="px-4 py-2 rounded-lg border font-medium transition-colors"
                    style={{
                      color: "var(--color-fg)",
                      borderColor: "var(--color-border)",
                    }}
                  >
                    Cancel
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

export default TeamDetailPage;
