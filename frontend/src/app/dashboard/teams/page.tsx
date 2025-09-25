"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import Link from "next/link";
import { DashboardNavbar } from "../_components/DashboardNavbar";
import { AuthGuard } from "@/services/AuthGuard";
import { useAuthStore } from "@/store/authStore";
import { useTeamStore } from "@/store/teamStore";

const TeamsPageInner = () => {
  const authUser = useAuthStore((s) => s.authUser);

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
    reset,
  } = useTeamStore();

  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState<{
    deleting?: string;
    leaving?: string;
  }>({});
  const [initialUIBusy, setInitialUIBusy] = useState(true);
  const initialLoadRef = useRef(false);

  /* ---------- DATA LOADING STRATEGY ----------
     Problem previously: fetchTeams & fetchMyInvites were called in same effect.
     fetchTeams sets loading=true → fetchMyInvites early-returned (because store checks loading).
     Result: myInvites never fetched -> pending invites = 0.
     Fix: Sequential loading (await teams, then invites). Also second watcher if invites still not loaded.
  ------------------------------------------------ */

  const sequentialLoad = useCallback(async () => {
    if (!authUser) return;
    try {
      if (!teamsLoaded) {
        await fetchTeams();
      }
      // Only attempt after teams load finished (loading now false)
      if (!myInvitesLoaded) {
        await fetchMyInvites();
      }
    } finally {
      setInitialUIBusy(false);
    }
  }, [authUser, teamsLoaded, myInvitesLoaded, fetchTeams, fetchMyInvites]);

  useEffect(() => {
    if (!authUser) return;
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      sequentialLoad();
    }
  }, [authUser, sequentialLoad]);

  // Safety net: if teams finished later and invites still not loaded & not loading, fetch invites.
  useEffect(() => {
    if (authUser && teamsLoaded && !myInvitesLoaded && !loading) {
      fetchMyInvites();
    }
  }, [authUser, teamsLoaded, myInvitesLoaded, loading, fetchMyInvites]);

  // Auto clear error
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => clearError(), 5000);
    return () => clearTimeout(t);
  }, [error, clearError]);

  // Force refresh (hard reset + sequential load)
  const handleRefresh = async () => {
    reset();
    setInitialUIBusy(true);
    initialLoadRef.current = false;
    await sequentialLoad();
  };

  const {
    totalTeams,
    teamsOwned,
    totalMembers,
    pendingReceivedInvites,
    filteredTeams,
  } = useMemo(() => {
    const now = Date.now();
    const owned = teams.filter((t) => t.userId === authUser?.id);
    const pending = myInvites.filter((inv) => {
      if (inv.acceptedAt || inv.revokedAt) return false;
      const notExpired = new Date(inv.expiresAt).getTime() > now;
      return (
        notExpired &&
        (inv.status === "pending" || !inv.status || inv.status === "sent")
      );
    });
    const membersSum = teams.reduce(
      (acc, t) => acc + (Array.isArray(t.members) ? t.members.length : 0),
      0
    );
    const filtered = teams.filter((t) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q)
      );
    });
    return {
      totalTeams: teams.length,
      teamsOwned: owned.length,
      totalMembers: membersSum,
      pendingReceivedInvites: pending,
      filteredTeams: filtered,
    };
  }, [teams, myInvites, authUser?.id, search]);

  const handleDelete = async (teamId: string) => {
    if (!confirm("Delete this team? This cannot be undone.")) return;
    setProcessing((p) => ({ ...p, deleting: teamId }));
    await deleteTeam(teamId);
    setProcessing((p) => ({ ...p, deleting: undefined }));
  };

  const handleLeave = async (teamId: string) => {
    if (!confirm("Leave this team?")) return;
    setProcessing((p) => ({ ...p, leaving: teamId }));
    await leaveTeam(teamId);
    setProcessing((p) => ({ ...p, leaving: undefined }));
  };

  const isOwner = (team: any) => team.userId === authUser?.id;

  if (!authUser) return null;

  const emptySearch = filteredTeams.length === 0 && search.trim() !== "";
  const noTeams =
    filteredTeams.length === 0 && !search.trim() && totalTeams === 0;
  const showGlobalInitialSpinner = initialUIBusy && teams.length === 0;

  return (
    <div className="min-h-screen glass-bg">
      <DashboardNavbar currentTeam={null} />

      <div className="max-w-7xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-title">
              Teams Overview
            </h1>
            <p className="text-sm mt-2 opacity-70">
              Your teams and invitations (received).
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/teams/create"
              className="glass-btn glass-btn-primary px-6 py-3 rounded-lg font-medium transition-all hover:scale-[1.03]"
            >
              + New Team
            </Link>
            <button
              onClick={handleRefresh}
              className="glass-btn glass-btn-secondary px-6 py-3 rounded-lg font-medium transition-all hover:scale-[1.03]"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div
            className="rounded-lg border px-4 py-3 mb-6 text-sm"
            style={{
              background: "rgba(255,0,0,0.08)",
              borderColor: "rgba(255,0,0,0.25)",
              color: "#f87171",
            }}
          >
            {error}
          </div>
        )}

        {pendingReceivedInvites.length > 0 && (
          <div
            className="rounded-xl px-5 py-4 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, rgba(253,224,71,0.10), rgba(250,204,21,0.05))",
              border: "1px solid rgba(234,179,8,0.35)",
            }}
          >
            <div>
              <h3 className="font-semibold text-yellow-400">
                {pendingReceivedInvites.length} Pending Invitation
                {pendingReceivedInvites.length > 1 ? "s" : ""}
              </h3>
              <p className="text-xs mt-1 opacity-75">
                These are invites sent TO you (not those you sent).
              </p>
            </div>
            <Link
              href="/invites"
              className="glass-btn glass-btn-secondary px-4 py-2 rounded-lg text-sm font-medium hover:scale-[1.04] transition-all"
            >
              Review Invites
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <StatCard
            label="Total Teams"
            value={totalTeams}
            accent="var(--color-primary)"
          />
          <StatCard
            label="Teams Owned"
            value={teamsOwned}
            accent="var(--color-accent)"
          />
          <StatCard
            label="Total Members"
            value={totalMembers}
            accent="var(--terminal-success)"
          />
          <StatCard
            label="Pending Invites"
            value={pendingReceivedInvites.length}
            accent="var(--terminal-warning)"
          />
        </div>

        {/* Search */}
        <div
          className="rounded-xl p-4 mb-8 flex items-center gap-3"
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow)",
          }}
        >
          <svg
            width="18"
            height="18"
            stroke="currentColor"
            className="opacity-60 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams..."
            className="w-full bg-transparent outline-none text-sm"
            style={{ color: "var(--color-fg)" }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs px-2 py-1 rounded-md border hover:opacity-80 transition"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-bg-secondary)",
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Empty States */}
        {noTeams && !showGlobalInitialSpinner && (
          <EmptyState
            title="No Teams Yet"
            description="Create your first team or wait for an invitation."
            actions={
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                <Link
                  href="/dashboard/teams/create"
                  className="glass-btn glass-btn-primary px-6 py-3 rounded-lg font-medium"
                >
                  Create Team
                </Link>
                {pendingReceivedInvites.length > 0 && (
                  <Link
                    href="/invites"
                    className="glass-btn glass-btn-secondary px-6 py-3 rounded-lg font-medium"
                  >
                    View Invites ({pendingReceivedInvites.length})
                  </Link>
                )}
              </div>
            }
          />
        )}

        {emptySearch && (
          <EmptyState
            title="No Results"
            description="No teams match your search."
            actions={
              <button
                onClick={() => setSearch("")}
                className="glass-btn glass-btn-secondary px-6 py-3 rounded-lg font-medium mt-4"
              >
                Reset Search
              </button>
            }
          />
        )}

        {/* Teams Grid */}
        {!noTeams && !emptySearch && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {filteredTeams.map((team) => {
              const id = team.id || team._id;
              const membersCount = team.members?.length ?? 0;
              const projectsCount = team.projects?.length ?? 0;
              const owner = isOwner(team);

              return (
                <div
                  key={id}
                  className="relative flex flex-col rounded-2xl p-5 transition-all group"
                  style={{
                    background:
                      "linear-gradient(145deg,var(--color-card), var(--color-bg-secondary))",
                    border: "1px solid var(--color-border)",
                    boxShadow: "var(--shadow)",
                  }}
                >
                  {owner && (
                    <div
                      className="absolute top-0 right-0 rounded-bl-lg text-[10px] font-semibold px-2 py-1"
                      style={{
                        background:
                          "linear-gradient(135deg,var(--color-primary), var(--color-accent))",
                        color: "#fff",
                      }}
                    >
                      OWNER
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1 group-hover:text-[var(--color-primary)] transition-colors">
                      {team.name}
                    </h3>
                    <p className="text-xs opacity-70 line-clamp-2 mb-4">
                      {team.description || "No description provided."}
                    </p>

                    <div className="flex flex-wrap gap-3 text-[11px] font-medium mt-1 mb-5">
                      <Badge
                        icon="👥"
                        label={`${membersCount} member${
                          membersCount !== 1 ? "s" : ""
                        }`}
                      />
                      <Badge
                        icon="📁"
                        label={`${projectsCount} project${
                          projectsCount !== 1 ? "s" : ""
                        }`}
                      />
                      <Badge
                        icon="🗓"
                        label={new Date(team.createdAt).toLocaleDateString()}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <Link
                      href={`/dashboard/teams/${id}`}
                      className="flex-1 glass-btn glass-btn-primary py-2 rounded-lg text-xs font-medium text-center hover:scale-[1.04] transition"
                    >
                      Open
                    </Link>

                    {owner ? (
                      <button
                        onClick={() => handleDelete(id!)}
                        disabled={processing.deleting === id}
                        className="glass-btn glass-btn-danger px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center hover:scale-[1.04] transition disabled:opacity-60"
                        title="Delete Team"
                      >
                        {processing.deleting === id ? (
                          <Spinner size={16} />
                        ) : (
                          "Del"
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLeave(id!)}
                        disabled={processing.leaving === id}
                        className="glass-btn glass-btn-warning px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center hover:scale-[1.04] transition disabled:opacity-60"
                        title="Leave Team"
                      >
                        {processing.leaving === id ? (
                          <Spinner size={16} />
                        ) : (
                          "Leave"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showGlobalInitialSpinner && (
          <div className="mt-20 flex justify-center">
            <Spinner size={48} />
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- UI Helpers ---------- */

const StatCard = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) => (
  <div
    className="rounded-2xl p-5 relative overflow-hidden"
    style={{
      background: "var(--color-card)",
      border: "1px solid var(--color-border)",
      boxShadow: "var(--shadow)",
    }}
  >
    <div
      className="absolute inset-0 opacity-[0.08] pointer-events-none"
      style={{
        background: `radial-gradient(circle at 70% 30%, ${accent}, transparent 70%)`,
      }}
    />
    <p className="text-xs uppercase tracking-wide opacity-60 font-medium mb-2">
      {label}
    </p>
    <p
      className="text-3xl font-bold leading-none"
      style={{
        background: `linear-gradient(90deg, ${accent}, var(--color-fg))`,
        WebkitBackgroundClip: "text",
        color: "transparent",
      }}
    >
      {value}
    </p>
  </div>
);

const Badge = ({ icon, label }: { icon: string; label: string }) => (
  <span
    className="px-2 py-1 rounded-md flex items-center gap-1"
    style={{
      background: "var(--color-bg-tertiary)",
      border: "1px solid var(--color-border)",
    }}
  >
    <span className="text-[11px]">{icon}</span>
    {label}
  </span>
);

const Spinner = ({ size = 20 }: { size?: number }) => (
  <div
    style={{
      width: size,
      height: size,
      border: `${Math.max(
        2,
        Math.round(size / 8)
      )}px solid rgba(255,255,255,0.15)`,
      borderTopColor: "var(--color-primary)",
    }}
    className="rounded-full animate-spin"
  />
);

const EmptyState = ({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) => (
  <div
    className="rounded-2xl p-10 text-center mx-auto max-w-xl mb-10"
    style={{
      background:
        "linear-gradient(145deg,var(--color-card), var(--color-bg-secondary))",
      border: "1px solid var(--color-border)",
      boxShadow: "var(--shadow)",
    }}
  >
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-sm opacity-70">{description}</p>
    {actions}
  </div>
);

export default function TeamsPage() {
  return (
    <AuthGuard>
      <TeamsPageInner />
    </AuthGuard>
  );
}
