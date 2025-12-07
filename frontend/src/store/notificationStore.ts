import { create } from "zustand";
import { useAuthStore } from "./authStore";
import { axiosInstance } from "@/lib/axios";

export interface Notification {
  id: string;
  type:
    | "push"
    | "pull_request"
    | "issue"
    | "full_repo"
    | "analysis"
    | "delete"
    | "remove"
    | "notification"
    | "background"
    | "alert";
  title: string;
  message: string;
  repoId?: string;
  repoName?: string;
  prNumber?: number;
  issueNumber?: number;
  score?: number;
  timestamp: string;
  read: boolean;
  success?: boolean;
  error?: string;
  isFromBackend?: boolean;
  alert?: boolean;
}

interface BackendNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  is_read: boolean;
  alert: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationStore {
  notifications: Notification[];
  alerts: Notification[];
  unreadCount: number;
  alertsCount: number;
  currentUserId: string | null;
  isLoading: boolean;
  alertsLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  fetchAlerts: () => Promise<void>;
  markAsReadBackend: (id: string) => Promise<void>;
  markAllAsReadBackend: () => Promise<void>;
  addNotification: (notification: Omit<Notification, "id" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  dismissAlert: (id: string) => void;
  dismissAllAlerts: () => void;
  getUnreadNotifications: () => Notification[];
  setCurrentUser: (userId: string | null) => void;
  resetStore: () => void;
}

const convertBackendNotification = (
  backendNotif: BackendNotification
): Notification => ({
  id: backendNotif.id,
  type: backendNotif.alert ? "alert" : "notification",
  title: backendNotif.title,
  message: backendNotif.message,
  timestamp: backendNotif.createdAt,
  read: backendNotif.is_read,
  isFromBackend: true,
  alert: backendNotif.alert,
  success: true,
});

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  notifications: [],
  alerts: [],
  unreadCount: 0,
  alertsCount: 0,
  currentUserId: null,
  isLoading: false,
  alertsLoading: false,
  error: null,

  fetchNotifications: async () => {
    const { currentUserId } = get();
    if (!currentUserId) return;

    set({ isLoading: true, error: null });

    try {
      const response = await axiosInstance.get("/notifications/get");

      if (response.data.success && response.data.notifications) {
        const backendNotifications: BackendNotification[] =
          response.data.notifications;
        const convertedNotifications = backendNotifications.map(
          convertBackendNotification
        );
        const socketNotifications = get().notifications.filter(
          (n) => !n.isFromBackend
        );
        const allNotifications = [
          ...convertedNotifications,
          ...socketNotifications,
        ];

        const uniqueNotifications = allNotifications.reduce((acc, curr) => {
          if (!acc.find((n) => n.id === curr.id)) acc.push(curr);
          return acc;
        }, [] as Notification[]);

        uniqueNotifications.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        const unreadCount = uniqueNotifications.filter((n) => !n.read).length;

        set({
          notifications: uniqueNotifications.slice(0, 50),
          unreadCount,
          isLoading: false,
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch notifications:", error);
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch notifications",
      });
    }
  },

  fetchAlerts: async () => {
    const { currentUserId } = get();
    if (!currentUserId) return;

    set({ alertsLoading: true });

    try {
      const response = await axiosInstance.get("/notifications/alerts");

      if (response.data.alerts) {
        const backendAlerts: BackendNotification[] = response.data.alerts;
        const convertedAlerts = backendAlerts.map(convertBackendNotification);
        const socketAlerts = get().alerts.filter((a) => !a.isFromBackend);
        const allAlerts = [...convertedAlerts, ...socketAlerts];

        const uniqueAlerts = allAlerts.reduce((acc, curr) => {
          if (!acc.find((a) => a.id === curr.id)) acc.push(curr);
          return acc;
        }, [] as Notification[]);

        uniqueAlerts.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        set({
          alerts: uniqueAlerts.slice(0, 20),
          alertsCount: uniqueAlerts.length,
          alertsLoading: false,
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch alerts:", error);
      set({ alertsLoading: false });
    }
  },

  markAsReadBackend: async (id: string) => {
    const { currentUserId, notifications } = get();
    const notification = notifications.find((n) => n.id === id);
    if (!notification || notification.read) return;

    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    if (notification.isFromBackend && currentUserId) {
      try {
        await axiosInstance.patch(`/notifications/${id}/read`);
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: false } : n
          ),
          unreadCount: state.unreadCount + 1,
        }));
      }
    }
  },

  markAllAsReadBackend: async () => {
    const { currentUserId, notifications, unreadCount } = get();
    if (unreadCount === 0) return;

    const originalNotifications = [...notifications];
    const originalUnreadCount = unreadCount;

    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));

    if (currentUserId) {
      try {
        await axiosInstance.patch("/notifications/read-all");
      } catch (error) {
        console.error("Failed to mark all notifications as read:", error);
        set({
          notifications: originalNotifications,
          unreadCount: originalUnreadCount,
        });
      }
    }
  },

  setCurrentUser: (userId: string | null) => {
    const currentState = get();
    if (currentState.currentUserId !== userId) {
      set({
        currentUserId: userId,
        notifications: [],
        alerts: [],
        unreadCount: 0,
        alertsCount: 0,
        error: null,
      });

      if (userId) {
        get().fetchNotifications();
        get().fetchAlerts();
      }
    }
  },

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      isFromBackend: false,
    };

    if (notification.alert === true) {
      set((state) => ({
        alerts: [newNotification, ...state.alerts].slice(0, 20),
        alertsCount: state.alertsCount + 1,
      }));
    }

    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id) => get().markAsReadBackend(id),

  markAllAsRead: () => get().markAllAsReadBackend(),

  clearNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      const wasUnread = notification && !notification.read;
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: wasUnread
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    });
  },

  clearAllNotifications: () => set({ notifications: [], unreadCount: 0 }),

  dismissAlert: (id: string) => {
    const { alerts, currentUserId } = get();
    const alert = alerts.find((a) => a.id === id);
    if (!alert) return;

    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
      alertsCount: Math.max(0, state.alertsCount - 1),
    }));

    if (alert.isFromBackend && currentUserId) {
      axiosInstance.patch(`/notifications/${id}/read`).catch((error) => {
        console.error("Failed to dismiss alert:", error);
        set((state) => ({
          alerts: [alert, ...state.alerts],
          alertsCount: state.alertsCount + 1,
        }));
      });
    }
  },

  dismissAllAlerts: () => {
    const { alerts, currentUserId } = get();
    if (alerts.length === 0) return;

    const originalAlerts = [...alerts];
    const originalCount = alerts.length;

    set({ alerts: [], alertsCount: 0 });

    if (currentUserId) {
      const backendAlertIds = originalAlerts
        .filter((a) => a.isFromBackend)
        .map((a) => a.id);
      Promise.all(
        backendAlertIds.map((id) =>
          axiosInstance.patch(`/notifications/${id}/read`)
        )
      ).catch((error) => {
        console.error("Failed to dismiss all alerts:", error);
        set({ alerts: originalAlerts, alertsCount: originalCount });
      });
    }
  },

  getUnreadNotifications: () => get().notifications.filter((n) => !n.read),

  resetStore: () => {
    set({
      notifications: [],
      alerts: [],
      unreadCount: 0,
      alertsCount: 0,
      currentUserId: null,
      isLoading: false,
      alertsLoading: false,
      error: null,
    });
  },
}));

export const useSyncNotificationsWithAuth = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const setCurrentUser = useNotificationStore((state) => state.setCurrentUser);

  return {
    syncUser: () => {
      setCurrentUser(authUser?.id || null);
    },
    userId: authUser?.id || null,
  };
};
