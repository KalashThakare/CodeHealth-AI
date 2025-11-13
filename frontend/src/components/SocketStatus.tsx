"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";

interface SocketStatusProps {
  /**
   * Show detailed connection info
   * @default false
   */
  showDetails?: boolean;
  /**
   * Position of the indicator
   * @default "bottom-right"
   */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

/**
 * Visual indicator showing Socket.IO connection status
 * Displays a colored dot and optional details
 */
export default function SocketStatus({
  showDetails = false,
  position = "bottom-right",
}: SocketStatusProps) {
  const { socket, isConnected } = useSocket({
    autoConnect: true,
    heartbeatInterval: 30000,
  });

  const [lastPing, setLastPing] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState<number>(0);

  useEffect(() => {
    if (!socket) return;

    // Listen for pong to track connection health
    socket.on("pong", () => {
      setLastPing(new Date());
      console.log("✅ Socket heartbeat received");
    });

    // Listen for notifications (example)
    socket.on("notification", (data) => {
      console.log("📬 Notification received:", data);
      setNotifications((prev) => prev + 1);
    });

    return () => {
      socket.off("pong");
      socket.off("notification");
    };
  }, [socket]);

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  if (!showDetails) {
    // Simple dot indicator
    return (
      <div
        className={`fixed ${positionClasses[position]} z-50`}
        title={
          isConnected
            ? `Socket connected (ID: ${socket?.id})`
            : "Socket disconnected"
        }
      >
        <div className="relative">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {isConnected && (
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
          )}
        </div>
      </div>
    );
  }

  // Detailed status panel
  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 min-w-[200px]`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="relative">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {isConnected && (
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75" />
          )}
        </div>
        <span className="font-semibold text-sm">
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {socket && isConnected && (
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Socket ID:</span>
            <span className="font-mono text-[10px]">
              {socket.id?.slice(0, 8)}...
            </span>
          </div>
          {lastPing && (
            <div className="flex justify-between">
              <span>Last ping:</span>
              <span>{lastPing.toLocaleTimeString()}</span>
            </div>
          )}
          {notifications > 0 && (
            <div className="flex justify-between">
              <span>Notifications:</span>
              <span className="font-semibold text-blue-600">
                {notifications}
              </span>
            </div>
          )}
        </div>
      )}

      {!isConnected && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Reconnecting...
        </p>
      )}
    </div>
  );
}
