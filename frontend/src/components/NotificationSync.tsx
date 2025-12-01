"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";

export function NotificationSync() {
  const authUser = useAuthStore((state) => state.authUser);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setCurrentUser = useNotificationStore((state) => state.setCurrentUser);

  useEffect(() => {
    if (!isHydrated) return;
    setCurrentUser(authUser?.id || null);
  }, [authUser?.id, isHydrated, setCurrentUser]);

  return null;
}
