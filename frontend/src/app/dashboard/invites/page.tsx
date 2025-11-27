"use client";

import { useTeamStore } from "@/store/teamStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function InvitesPage() {
  const router = useRouter();
  const { authUser } = useAuthStore();

  const {
    myInvites, // ✅ User's received invites
    loading,
    error,
    fetchMyInvites, // ✅ Fetch received invites
    acceptInvite,
    declineInvite,
    clearError,
    myInvitesLoaded,
  } = useTeamStore();

  const [processingInvites, setProcessingInvites] = useState<Set<string>>(
    new Set()
  );

  // ✅ CHANGE: Fetch user's received invites
  useEffect(() => {
    if (authUser && !myInvitesLoaded) {
      console.log("🔄 Invites page: Fetching received invites...");
      fetchMyInvites();
    }
  }, [authUser, fetchMyInvites, myInvitesLoaded]);

  // ✅ CHANGE: Enhanced invite acceptance with proper token handling
  const handleAcceptInvite = async (invite: any) => {
    if (!invite.tokenHash) {
      console.error("❌ No token hash found for invite:", invite.id);
      return;
    }

    setProcessingInvites((prev) => new Set([...prev, invite.id]));

    try {
      console.log("🔄 Accepting invite:", invite.id);
      // Use the token hash from the invite
      const result = await acceptInvite(invite.tokenHash);

      if (result) {
        console.log("✅ Invite accepted successfully");
        // Refresh invites to remove the accepted one
        await fetchMyInvites();

        // Optionally redirect to the team page
        if (result.teamId) {
          router.push(`/dashboard/teams/${result.teamId}`);
        }
      }
    } catch (error) {
      console.error("❌ Failed to accept invite:", error);
    } finally {
      setProcessingInvites((prev) => {
        const newSet = new Set(prev);
        newSet.delete(invite.id);
        return newSet;
      });
    }
  };

  // ✅ CHANGE: Enhanced invite decline with proper token handling
  const handleDeclineInvite = async (invite: any) => {
    if (
      !window.confirm(
        `Are you sure you want to decline the invitation to join "${
          invite.team?.name || "this team"
        }"?`
      )
    ) {
      return;
    }

    if (!invite.tokenHash) {
      console.error("❌ No token hash found for invite:", invite.id);
      return;
    }

    setProcessingInvites((prev) => new Set([...prev, invite.id]));

    try {
      console.log("🔄 Declining invite:", invite.id);
      const success = await declineInvite(invite.tokenHash);

      if (success) {
        console.log("✅ Invite declined successfully");
        // Refresh invites to remove the declined one
        await fetchMyInvites();
      }
    } catch (error) {
      console.error("❌ Failed to decline invite:", error);
    } finally {
      setProcessingInvites((prev) => {
        const newSet = new Set(prev);
        newSet.delete(invite.id);
        return newSet;
      });
    }
  };

  // ✅ CHANGE: Group invites by status and team
  const groupedInvites = myInvites.reduce((groups, invite) => {
    const now = new Date();
    const expiresAt = new Date(invite.expiresAt);

    let status = invite.status;
    if (!invite.acceptedAt && !invite.revokedAt) {
      status = now < expiresAt ? "pending" : "expired";
    }

    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(invite);

    return groups;
  }, {} as Record<string, any[]>);

  const pendingInvites = groupedInvites.pending || [];
  const expiredInvites = groupedInvites.expired || [];
  const acceptedInvites = groupedInvites.accepted || [];

  if (!authUser) {
    return null;
  }

  return (
    <div className="min-h-screen glass-bg">
      <div className="max-w-4xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/dashboard/teams"
              className="text-primary hover:text-primary/80 font-medium inline-flex items-center"
            >
              ← Back to Teams
            </Link>
            <button
              onClick={() => fetchMyInvites()}
              className="glass-btn glass-btn-secondary px-4 py-2 rounded-lg text-sm"
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <h1 className="text-3xl font-bold mb-2">Team Invitations</h1>
          <p className="text-text/70">
            Manage your pending team invitations and view your invitation
            history
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="glass-card bg-red-500/10 border-red-500/30 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <p className="text-red-400">{error}</p>
              <button
                onClick={clearError}
                className="text-red-300 hover:text-red-100 text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && myInvites.length === 0 && (
          <div className="flex justify-center py-12">
            <div className="glass-card p-8 rounded-2xl shadow-xl text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading your invitations...</p>
            </div>
          </div>
        )}

        {/* ✅ CHANGE: Statistics Cards */}
        {!loading && myInvites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-4 rounded-xl text-center">
              <h3 className="text-sm font-medium text-text/70 mb-1">Pending</h3>
              <p className="text-2xl font-bold text-yellow-500">
                {pendingInvites.length}
              </p>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <h3 className="text-sm font-medium text-text/70 mb-1">
                Accepted
              </h3>
              <p className="text-2xl font-bold text-green-500">
                {acceptedInvites.length}
              </p>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <h3 className="text-sm font-medium text-text/70 mb-1">Expired</h3>
              <p className="text-2xl font-bold text-red-500">
                {expiredInvites.length}
              </p>
            </div>
          </div>
        )}

        {/* ✅ CHANGE: Pending Invitations Section */}
        {pendingInvites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Pending Invitations ({pendingInvites.length})
            </h2>
            <div className="space-y-4">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="glass-card p-6 rounded-2xl shadow-xl border-l-4 border-yellow-500"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {invite.team?.name || "Team Invitation"}
                          </h3>
                          <p className="text-text/60 text-sm">
                            You've been invited to join this team
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="text-sm text-text/60">Your Role</div>
                          <div className="font-medium capitalize">
                            {invite.role}
                          </div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="text-sm text-text/60">Invited To</div>
                          <div className="font-medium">{invite.email}</div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="text-sm text-text/60">Expires</div>
                          <div className="font-medium text-sm">
                            {new Date(invite.expiresAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAcceptInvite(invite)}
                          disabled={processingInvites.has(invite.id)}
                          className="glass-btn glass-btn-success px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                        >
                          {processingInvites.has(invite.id)
                            ? "Accepting..."
                            : "Accept Invitation"}
                        </button>
                        <button
                          onClick={() => handleDeclineInvite(invite)}
                          disabled={processingInvites.has(invite.id)}
                          className="glass-btn glass-btn-danger px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                        >
                          {processingInvites.has(invite.id)
                            ? "Declining..."
                            : "Decline"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✅ CHANGE: Other Invitations Section */}
        {(acceptedInvites.length > 0 || expiredInvites.length > 0) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Invitation History</h2>

            {/* Accepted Invitations */}
            {acceptedInvites.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-green-400">
                  Accepted ({acceptedInvites.length})
                </h3>
                <div className="space-y-3">
                  {acceptedInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="glass-card p-4 rounded-xl border-l-4 border-green-500"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {invite.team?.name || "Team"}
                          </p>
                          <p className="text-sm text-text/60">
                            Role: {invite.role} • Accepted:{" "}
                            {new Date(invite.acceptedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                          Accepted
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expired Invitations */}
            {expiredInvites.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3 text-red-400">
                  Expired ({expiredInvites.length})
                </h3>
                <div className="space-y-3">
                  {expiredInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="glass-card p-4 rounded-xl border-l-4 border-red-500 opacity-75"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {invite.team?.name || "Team"}
                          </p>
                          <p className="text-sm text-text/60">
                            Role: {invite.role} • Expired:{" "}
                            {new Date(invite.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                          Expired
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && myInvites.length === 0 && (
          <div className="text-center py-12">
            <div className="glass-card p-8 rounded-2xl shadow-xl max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">
                No Invitations Found
              </h3>
              <p className="text-text/70 mb-6">
                You don't have any team invitations at the moment. Create a team
                or ask others to invite you!
              </p>
              <Link
                href="/dashboard/teams"
                className="glass-btn glass-btn-primary px-6 py-3 rounded-lg font-medium transition-all inline-block"
              >
                Browse Teams
              </Link>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="mt-12">
          <div className="glass-card p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              About Team Invitations
            </h3>
            <div className="space-y-3 text-text/70 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  Team invitations allow you to join teams and collaborate with
                  other members.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  Invitations expire after a certain period. Make sure to accept
                  them before they expire.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  Your role in the team determines what actions you can perform.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  You can leave a team at any time from the team's detail page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
