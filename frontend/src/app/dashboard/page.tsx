"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useTeamStore } from "@/store/teamStore";
import { useRouter } from "next/navigation";
import { DashboardNavbar } from "./_components/DashboardNavbar";
import Link from "next/link";

const Dashboard = () => {
  const router = useRouter();

  const authUser = useAuthStore((s) => s.authUser);
  const isLoggingIn = useAuthStore((s) => s.isloggingin);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  const teams = useTeamStore((s) => s.teams);
  const myInvites = useTeamStore((s) => s.myInvites);
  const fetchTeams = useTeamStore((s) => s.fetchTeams);
  const fetchMyInvites = useTeamStore((s) => s.fetchMyInvites);
  const teamsLoading = useTeamStore((s) => s.loading);
  const teamsLoaded = useTeamStore((s) => s.teamsLoaded);
  const myInvitesLoaded = useTeamStore((s) => s.myInvitesLoaded);

  const [isInitializing, setIsInitializing] = useState(true);
  const initRef = useRef(false);
  const dataFetchRef = useRef(false);

  // ✅ CHANGE: Enhanced debugging to understand invite flow
  console.log("=== DASHBOARD DEBUG ===");
  console.log("myInvites (invites I received):", myInvites);
  console.log("myInvites length:", myInvites.length);
  console.log("authUser email:", authUser?.email);
  console.log("========================");

  // One-time initialization (guard StrictMode double-call)
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initialize = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get("token");
        if (tokenFromUrl) {
          localStorage.setItem("authToken", tokenFromUrl);
          window.history.replaceState({}, "", window.location.pathname);
        }
        await checkAuth(router as any);
      } catch (e) {
        router.replace("/login");
      } finally {
        setIsInitializing(false);
      }
    };
    initialize();
  }, [checkAuth, router]);

  useEffect(() => {
    if (!authUser || isInitializing) return;
    if (dataFetchRef.current) return; // Prevent multiple calls

    dataFetchRef.current = true;

    const fetchData = async () => {
      try {
        console.log("🔄 Dashboard: Starting data fetch...");

        // Fetch teams and received invites concurrently
        const promises = [];

        if (!teamsLoaded) {
          console.log("📋 Fetching teams...");
          promises.push(fetchTeams());
        }

        if (!myInvitesLoaded) {
          console.log("📨 Fetching my received invites...");
          promises.push(fetchMyInvites());
        }

        await Promise.all(promises);
        console.log("✅ Dashboard data fetch completed");
      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, [
    authUser,
    isInitializing,
    fetchTeams,
    fetchMyInvites,
    teamsLoaded,
    myInvitesLoaded,
  ]);

  // Redirect if not authenticated after init
  useEffect(() => {
    if (!isInitializing && !isLoggingIn && !authUser) {
      router.replace("/login");
    }
  }, [isInitializing, isLoggingIn, authUser, router]);

  if (isInitializing || isLoggingIn) {
    return (
      <div className="min-h-screen glass-bg flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-center">Loading Dashboard...</p>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen glass-bg flex flex-col items-center justify-center">
        <h1 className="font-semibold text-2xl mb-4">Access Denied</h1>
        <p className="mb-6 text-text/70">
          Please log in to access the dashboard.
        </p>
        <button
          onClick={() => router.replace("/login")}
          className="glass-btn glass-btn-primary px-6 py-3 rounded-lg font-medium transition-all"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const pendingReceivedInvites = myInvites.filter((invite) => {
    const now = new Date();
    const expiresAt = new Date(invite.expiresAt);

    const isPending =
      invite.status === "pending" ||
      (!invite.acceptedAt && !invite.revokedAt && now < expiresAt);

    console.log(
      `Invite ${invite.id}: email=${invite.email}, status=${invite.status}, isPending=${isPending}`
    );
    return isPending;
  });

  console.log(
    "📊 Pending received invites count:",
    pendingReceivedInvites.length
  );

  return (
    <div className="min-h-screen glass-bg">
      <DashboardNavbar currentTeam={teams[0]} />

      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-center">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 rounded-2xl shadow-xl text-center">
            <h3 className="text-lg font-semibold mb-2">Your Teams</h3>
            <p className="text-3xl font-bold text-primary">{teams.length}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl shadow-xl text-center">
            <h3 className="text-lg font-semibold mb-2">Pending Invites</h3>
            <p className="text-3xl font-bold text-yellow-500">
              {pendingReceivedInvites.length}
            </p>
          </div>
          <div className="glass-card p-6 rounded-2xl shadow-xl text-center">
            <h3 className="text-lg font-semibold mb-2">Active Projects</h3>
            <p className="text-3xl font-bold text-green-500">
              {teams.reduce(
                (total, team) => total + (team.projects?.length || 0),
                0
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/teams" className="group">
            <div className="glass-card p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all group-hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mr-4">
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
                <h3 className="text-xl font-semibold">Teams</h3>
              </div>
              <p className="text-text/70 mb-4">
                Manage your teams, invite members, and collaborate on projects
              </p>
              <div className="text-sm text-primary font-medium">
                View Teams →
              </div>
            </div>
          </Link>

          <Link href="/gitProject" className="group">
            <div className="glass-card p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all group-hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">GitHub Projects</h3>
              </div>
              <p className="text-text/70 mb-4">
                Connect and analyze your GitHub repositories
              </p>
              <div className="text-sm text-primary font-medium">
                View Projects →
              </div>
            </div>
          </Link>

          <div
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_GITHUB_PERMISSION_URL}`;
            }}
            className="group cursor-pointer"
          >
            <div className="glass-card p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all group-hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mr-4">
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.40A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Permissions</h3>
              </div>
              <p className="text-text/70 mb-4">
                Manage your GitHub repository access permissions
              </p>
              <div className="text-sm text-primary font-medium">
                Manage Permissions →
              </div>
            </div>
          </div>

          {/* FIX: Use pendingInvites instead of invites */}
          {pendingReceivedInvites.length > 0 && (
            <Link href="/dashboard/invites" className="group">
              <div className="glass-card p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all group-hover:scale-105 border-2 border-yellow-400/30">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mr-4">
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
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Invites</h3>
                </div>
                <p className="text-text/70 mb-4">
                  You have {pendingReceivedInvites.length} pending team invitation
                  {pendingReceivedInvites.length !== 1 ? "s" : ""}
                </p>
                <div className="text-sm text-yellow-500 font-medium">
                  View Invites →
                </div>
              </div>
            </Link>
          )}
        </div>

        {teams.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Your Recent Teams</h2>
              <Link
                href="/dashboard/teams"
                className="text-primary hover:text-primary/80 font-medium"
              >
                View All Teams →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.slice(0, 3).map((team) => (
                <Link
                  key={team.id || team._id}
                  href={`/dashboard/teams/${team.id || team._id}`}
                  className="group"
                >
                  <div className="glass-card p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all group-hover:scale-105">
                    <h3 className="text-xl font-semibold mb-2">{team.name}</h3>
                    <p className="text-text/70 mb-4 line-clamp-2">
                      {team.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text/60">
                        {team.members?.length || 0} members
                      </span>
                      <span className="text-text/60">
                        {team.projects?.length || 0} projects
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {teams.length === 0 && !teamsLoading && (
          <div className="text-center py-12">
            <div className="glass-card p-8 rounded-2xl shadow-xl max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-4">Get Started</h3>
              <p className="text-text/70 mb-6">
                Create your first team or wait for an invitation to join a team.
              </p>
              <Link
                href="/dashboard/teams/create"
                className="glass-btn glass-btn-primary px-6 py-3 rounded-lg font-medium transition-all inline-block"
              >
                Create Team
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;