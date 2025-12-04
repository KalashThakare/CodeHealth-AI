"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard = ({ children, requireAuth = true }: AuthGuardProps) => {
  const router = useRouter();
  const { authUser, isloggingin, isHydrated, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (!isHydrated) return;

      try {
        await checkAuth(router);
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsChecking(false);
      }
    };

    initAuth();
  }, [isHydrated, checkAuth, router]);

  if (!isHydrated || isChecking || isloggingin) {
    return (
      <div className="min-h-screen glass-bg flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-center">Loading...</p>
      </div>
    );
  }

  if (requireAuth && !authUser) {
    router.replace("/login");
    return (
      <div className="min-h-screen glass-bg flex flex-col items-center justify-center">
        <p className="text-center">Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
};
