"use client";
import { useTeamStore } from "@/store/teamStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardThemeToggle } from "@/components/ui/DashboardThemeToggle";

const TeamsPage = () => {
  const router = useRouter();
  const { authUser } = useAuthStore();
  const { teams, invites, loading, error, fetchTeams, fetchInvites } =
    useTeamStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (authUser) {
      fetchTeams();
      fetchInvites();
    }
  }, [authUser, fetchTeams, fetchInvites]);

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!authUser) {
    router.replace("/login");
    return null;
  }

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
          <div className="flex items-center gap-4">
            <DashboardThemeToggle />
            <Link
              href="/dashboard/teams/create"
              className="glass-btn glass-btn-primary px-4 py-2 rounded-lg font-medium transition-all"
            >
              Create Team
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Teams</h1>
          <p className="text-text/70">
            Manage your teams and collaborate with others
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="glass-card p-6 rounded-2xl shadow-xl">
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 rounded-2xl shadow-xl text-center">
            <h3 className="text-lg font-semibold mb-2">Total Teams</h3>
            <p className="text-3xl font-bold text-primary">{teams.length}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl shadow-xl text-center">
            <h3 className="text-lg font-semibold mb-2">Pending Invites</h3>
            <p className="text-3xl font-bold text-yellow-500">
              {invites.length}
            </p>
          </div>
          <div className="glass-card p-6 rounded-2xl shadow-xl text-center">
            <h3 className="text-lg font-semibold mb-2">Total Members</h3>
            <p className="text-3xl font-bold text-green-500">
              {teams.reduce(
                (total, team) => total + (team.members?.length || 0),
                0
              )}
            </p>
          </div>
        </div>

        {/* Pending Invites */}
        {invites.length > 0 && (
          <div className="mb-8">
            <div className="glass-card p-6 rounded-2xl shadow-xl border-2 border-yellow-400/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Pending Invitations</h2>
                <Link
                  href="/dashboard/invites"
                  className="text-yellow-500 hover:text-yellow-400 font-medium"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {invites.slice(0, 3).map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-4 bg-yellow-50/10 rounded-lg border border-yellow-400/20"
                  >
                    <div>
                      <p className="font-medium">Team Invitation</p>
                      <p className="text-sm text-text/70">
                        Role: {invite.role}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="glass-btn glass-btn-success px-3 py-1 text-sm rounded-md">
                        Accept
                      </button>
                      <button className="glass-btn glass-btn-danger px-3 py-1 text-sm rounded-md">
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Teams Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="glass-card p-8 rounded-2xl shadow-xl max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-4 text-red-500">Error</h3>
              <p className="text-text/70 mb-6">{error}</p>
              <button
                onClick={() => fetchTeams()}
                className="glass-btn glass-btn-primary px-6 py-3 rounded-lg font-medium transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <div className="glass-card p-8 rounded-2xl shadow-xl max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-4">
                {searchTerm ? "No Teams Found" : "No Teams Yet"}
              </h3>
              <p className="text-text/70 mb-6">
                {searchTerm
                  ? `No teams match "${searchTerm}". Try a different search term.`
                  : "Create your first team to get started with collaboration."}
              </p>
              {!searchTerm && (
                <Link
                  href="/dashboard/teams/create"
                  className="glass-btn glass-btn-primary px-6 py-3 rounded-lg font-medium transition-all inline-block"
                >
                  Create Your First Team
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <Link
                key={team.id || team._id}
                href={`/dashboard/teams/${team.id || team._id}`}
                className="group"
              >
                <div className="glass-card p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all group-hover:scale-105">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {team.name}
                    </h3>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>

                  <p className="text-text/70 mb-4 line-clamp-2">
                    {team.description || "No description provided"}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-text/60">
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
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                        {team.members?.length || 0}
                      </span>
                      <span className="flex items-center gap-1 text-text/60">
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
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        {team.projects?.length || 0}
                      </span>
                    </div>
                    <span className="text-xs text-text/40">
                      {new Date(team.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text/60">
                        Created by{" "}
                        {team.userId === authUser?._id ? "You" : "Team Owner"}
                      </span>
                      <div className="text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                        View →
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsPage;
