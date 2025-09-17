"use client";
import { useTeamStore } from "@/store/teamStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { DashboardThemeToggle } from "@/components/ui/DashboardThemeToggle";

const InvitesPage = () => {
  const router = useRouter();
  const { authUser } = useAuthStore();
  const { invites, 
    loading, 
    error, 
    // fetchInvites, 
    acceptInvite } =
    useTeamStore();

  // useEffect(() => {
  //   if (authUser) {
  //     fetchInvites();
  //   }
  // }, [authUser, fetchInvites]);

  const handleAcceptInvite = async (token: string) => {
    const result = await acceptInvite(token);
    if (result) {
      // fetchInvites(); // Refresh invites
      // Optionally redirect to the team page
      // router.push(`/dashboard/teams/${result.teamId}`);
    }
  };

  const handleDeclineInvite = (inviteId: string) => {
    // Implement decline functionality if needed
    console.log("Decline invite:", inviteId);
  };

  // if (!authUser) {
  //   router.replace("/login");
  //   return null;
  // }

  return (
    <div className="min-h-screen glass-bg">
      {/* Header */}
      <div className="glass-nav sticky top-0 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-lg font-semibold text-primary hover:text-primary/80"
          >
            ← Back to Dashboard
          </Link>
          <DashboardThemeToggle />
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Team Invitations</h1>
          <p className="text-text/70">Manage your pending team invitations</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="glass-card p-8 rounded-2xl shadow-xl text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading invitations...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="glass-card p-8 rounded-2xl shadow-xl max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-4 text-red-500">Error</h3>
              <p className="text-text/70 mb-6">{error}</p>
              <button
                // onClick={() => fetchInvites()}
                className="glass-btn glass-btn-primary px-6 py-3 rounded-lg font-medium transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && invites.length === 0 && (
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
                No Pending Invitations
              </h3>
              <p className="text-text/70 mb-6">
                You don't have any pending team invitations at the moment.
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

        {/* Invitations List */}
        {!loading && !error && invites.length > 0 && (
          <div className="space-y-6">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="glass-card p-6 rounded-2xl shadow-xl"
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
                          Team Invitation
                        </h3>
                        <p className="text-text/60 text-sm">
                          You've been invited to join a team
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-text/60">Role</div>
                        <div className="font-medium capitalize">
                          {invite.role}
                        </div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-text/60">Status</div>
                        <div className="font-medium">
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                            {invite.status}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-sm text-text/60">Expires</div>
                        <div className="font-medium text-sm">
                          {new Date(invite.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Check if invite is expired */}
                    {new Date(invite.expiresAt) < new Date() ? (
                      <div className="p-4 bg-red-50/10 border border-red-400/20 rounded-lg mb-4">
                        <p className="text-red-400 text-sm">
                          This invitation has expired
                        </p>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAcceptInvite(invite.id)} // Using ID as token for now
                          className="glass-btn glass-btn-success px-6 py-2 rounded-lg font-medium transition-all"
                        >
                          Accept Invitation
                        </button>
                        <button
                          onClick={() => handleDeclineInvite(invite.id)}
                          className="glass-btn glass-btn-secondary px-6 py-2 rounded-lg font-medium transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
};

export default InvitesPage;
