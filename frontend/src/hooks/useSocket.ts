"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import { socketService } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";

interface UseSocketOptions {
  /**
   * Auto-connect when component mounts
   * @default true
   */
  autoConnect?: boolean;
  /**
   * Auto-disconnect when component unmounts
   * @default true
   */
  autoDisconnect?: boolean;
  /**
   * Enable heartbeat ping every N milliseconds
   * @default 30000 (30 seconds)
   */
  heartbeatInterval?: number;
}

/**
 * React hook for Socket.IO connection management
 */
export function useSocket(options: UseSocketOptions = {}) {
  const {
    autoConnect = true,
    autoDisconnect = true,
    heartbeatInterval = 30000,
  } = options;

  const { authUser } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(() =>
    socketService.getSocket()
  );
  const [isConnected, setIsConnected] = useState(() =>
    socketService.isConnected()
  );
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedRef = useRef(false);

  // Sync connection state with socketService
  const syncConnectionState = useCallback(() => {
    const currentSocket = socketService.getSocket();
    const connected = socketService.isConnected();
    setSocket(currentSocket);
    setIsConnected(connected);
  }, []);

  const connect = useCallback(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.warn(
        "No authentication token available. Cannot connect to socket."
      );
      return;
    }

    // Don't reconnect if already connected
    if (socketService.isConnected()) {
      syncConnectionState();
      return;
    }

    try {
      const socketInstance = socketService.connect(token);

      // Set up listeners only once per socket instance
      const onConnect = () => {
        console.log("useSocket: connected");
        setIsConnected(true);
        setSocket(socketInstance);
      };

      const onDisconnect = () => {
        console.log("useSocket: disconnected");
        setIsConnected(false);
      };

      // Remove old listeners first to prevent duplicates
      socketInstance.off("connect", onConnect);
      socketInstance.off("disconnect", onDisconnect);

      // Add new listeners
      socketInstance.on("connect", onConnect);
      socketInstance.on("disconnect", onDisconnect);

      // If already connected, update state immediately
      if (socketInstance.connected) {
        setIsConnected(true);
        setSocket(socketInstance);
      }

      // Start heartbeat
      if (heartbeatInterval > 0 && !heartbeatIntervalRef.current) {
        heartbeatIntervalRef.current = setInterval(() => {
          if (socketService.isConnected()) {
            socketService.ping();
          }
        }, heartbeatInterval);
      }
    } catch (error) {
      console.error("Failed to connect socket:", error);
    }
  }, [heartbeatInterval, syncConnectionState]);

  const disconnect = useCallback(() => {
    // Clear heartbeat
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    socketService.disconnect();
    setSocket(null);
    setIsConnected(false);
  }, []);

  // Initialize connection once
  useEffect(() => {
    if (hasInitializedRef.current) return;

    const token = localStorage.getItem("authToken");

    if (autoConnect && token) {
      hasInitializedRef.current = true;
      connect();
    }
  }, [autoConnect, connect]);

  // Handle auth changes (login/logout)
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    // User logged in and we should auto-connect
    if (authUser && token && autoConnect && !socketService.isConnected()) {
      connect();
    }

    // User logged out
    if (!authUser && !token) {
      disconnect();
      hasInitializedRef.current = false;
    }
  }, [authUser, autoConnect, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }

      if (autoDisconnect) {
        socketService.disconnect();
      }
    };
  }, [autoDisconnect]);

  // Periodically sync state (fallback for edge cases)
  useEffect(() => {
    const interval = setInterval(() => {
      const actualConnected = socketService.isConnected();
      if (actualConnected !== isConnected) {
        syncConnectionState();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isConnected, syncConnectionState]);

  return {
    socket,
    isConnected,
    connect,
    disconnect,
  };
}
