"use client";

import { useState } from "react";
import { useSocket } from "@/hooks/useSocket";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isConnected } = useSocket({
    autoConnect: true,
    autoDisconnect: false,
    heartbeatInterval: 30000,
  });

  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <>
      <div
        className="fixed bottom-4 right-4 z-[9999] cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="relative">
          <div
            className={`w-3 h-3 rounded-full transition-colors ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {isConnected && (
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
          )}
        </div>

        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
            <div className="font-semibold">
              {isConnected ? "✓ Connected" : "✗ Disconnected"}
            </div>
            <div className="text-gray-300 dark:text-gray-400 mt-0.5">
              {isConnected ? "Real-time updates active" : "Reconnecting..."}
            </div>
            <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
          </div>
        )}
      </div>
      {children}
    </>
  );
}
