"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import { socketService } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";

interface UseSocketOptions {
  autoConnect?: boolean;
  autoDisconnect?: boolean;
  heartbeatInterval?: number;
}

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

  const syncConnectionState = useCallback(() => {
    const currentSocket = socketService.getSocket();
    const connected = socketService.isConnected();
    setSocket(currentSocket);
    setIsConnected(connected);
  }, []);

  const connect = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.warn("No auth token available for socket connection");
      return;
    }

    if (socketService.isConnected()) {
      syncConnectionState();
      return;
    }

    try {
      const socketInstance = socketService.connect(token);

      const onConnect = () => {
        setIsConnected(true);
        setSocket(socketInstance);
      };

      const onDisconnect = () => {
        setIsConnected(false);
      };

      socketInstance.off("connect", onConnect);
      socketInstance.off("disconnect", onDisconnect);
      socketInstance.on("connect", onConnect);
      socketInstance.on("disconnect", onDisconnect);

      if (socketInstance.connected) {
        setIsConnected(true);
        setSocket(socketInstance);
      }

      if (heartbeatInterval > 0 && !heartbeatIntervalRef.current) {
        heartbeatIntervalRef.current = setInterval(() => {
          if (socketService.isConnected()) socketService.ping();
        }, heartbeatInterval);
      }
    } catch (error) {
      console.error("Failed to connect socket:", error);
    }
  }, [heartbeatInterval, syncConnectionState]);

  const disconnect = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    socketService.disconnect();
    setSocket(null);
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    const token = localStorage.getItem("authToken");
    if (autoConnect && token) {
      hasInitializedRef.current = true;
      connect();
    }
  }, [autoConnect, connect]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (authUser && token && autoConnect && !socketService.isConnected()) {
      connect();
    }
    if (!authUser && !token) {
      disconnect();
      hasInitializedRef.current = false;
    }
  }, [authUser, autoConnect, connect, disconnect]);

  useEffect(() => {
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (autoDisconnect) socketService.disconnect();
    };
  }, [autoDisconnect]);

  useEffect(() => {
    const interval = setInterval(() => {
      const actualConnected = socketService.isConnected();
      if (actualConnected !== isConnected) syncConnectionState();
    }, 2000);
    return () => clearInterval(interval);
  }, [isConnected, syncConnectionState]);

  return { socket, isConnected, connect, disconnect };
}
