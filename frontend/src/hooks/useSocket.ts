"use client";

import { useEffect, useRef, useState } from "react";
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
 *
 * @example
 * ```tsx
 * const { socket, isConnected, connect, disconnect } = useSocket({
 *   autoConnect: true,
 *   heartbeatInterval: 30000,
 * });
 *
 * useEffect(() => {
 *   if (!socket) return;
 *
 *   socket.on("customEvent", (data) => {
 *     console.log("Received:", data);
 *   });
 *
 *   return () => {
 *     socket.off("customEvent");
 *   };
 * }, [socket]);
 * ```
 */
export function useSocket(options: UseSocketOptions = {}) {
  const {
    autoConnect = true,
    autoDisconnect = true,
    heartbeatInterval = 30000,
  } = options;

  const { authUser } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.warn(
        "No authentication token available. Cannot connect to socket."
      );
      return;
    }

    try {
      const socketInstance = socketService.connect(token);
      setSocket(socketInstance);

      // Update connection status
      socketInstance.on("connect", () => {
        setIsConnected(true);
      });

      socketInstance.on("disconnect", () => {
        setIsConnected(false);
      });

      socketInstance.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      // Start heartbeat
      if (heartbeatInterval > 0) {
        heartbeatIntervalRef.current = setInterval(() => {
          if (socketService.isConnected()) {
            socketService.ping();
          }
        }, heartbeatInterval);
      }
    } catch (error) {
      console.error("Failed to connect socket:", error);
    }
  };

  const disconnect = () => {
    // Clear heartbeat
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    socketService.disconnect();
    setSocket(null);
    setIsConnected(false);
  };

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && authUser) {
      connect();
    }

    // Auto-disconnect on unmount
    return () => {
      if (autoDisconnect) {
        disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, autoConnect, autoDisconnect]);

  return {
    socket,
    isConnected,
    connect,
    disconnect,
  };
}
