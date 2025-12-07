"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
// import { useTeamStore } from "@/store/teamStore";
import { DashboardNavbar } from "./_components/DashboardNavbar";
import SocketStatus from "@/components/SocketStatus";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const authUser = useAuthStore((s) => s.authUser);
  const isLoggingIn = useAuthStore((s) => s.isloggingin);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const justLoggedOut = useAuthStore((s) => s.justLoggedOut);

  // const teams = useTeamStore((s) => s.teams);
  // const fetchTeams = useTeamStore((s) => s.fetchTeams);
  // const teamsLoaded = useTeamStore((s) => s.teamsLoaded);

  const [isInitializing, setIsInitializing] = useState(true);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initialize = async () => {
      const { justLoggedOut } = useAuthStore.getState();
      if (justLoggedOut) {
        useAuthStore.setState({ isloggingin: false });
        setIsInitializing(false);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get("token");
      if (tokenFromUrl) {
        localStorage.setItem("authToken", tokenFromUrl);
        window.history.replaceState({}, "", window.location.pathname);
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        useAuthStore.setState({ isloggingin: false, authUser: null });
        setIsInitializing(false);
        return;
      }

      try {
        await checkAuth();
      } catch (e) {
      } finally {
        setIsInitializing(false);
      }
    };
    initialize();
  }, [checkAuth]);

  useEffect(() => {
    if (!authUser ||isInitializing 
      // || teamsLoaded
    ) return;
    // fetchTeams();
  }, [authUser, isInitializing
    // , fetchTeams, teamsLoaded
  ]);

  useEffect(() => {
    if (!isInitializing && !isLoggingIn && !authUser && !justLoggedOut) {
      router.replace("/login");
    }
  }, [isInitializing, isLoggingIn, authUser, router, justLoggedOut]);

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

  return (
    <div className="vercel-dashboard">
      <DashboardNavbar 
      // currentTeam={teams[0]} 
      />
      <SocketStatus showDetails={false} position="bottom-right" />
      {children}
    </div>
  );
}
