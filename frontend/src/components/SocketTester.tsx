"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";

/**
 * Socket.IO Testing Panel
 * Use this component to test and verify your socket connection
 * Add to any page temporarily: import SocketTester from "@/components/SocketTester"
 */
export default function SocketTester() {
  const { socket, isConnected, connect, disconnect } = useSocket({
    autoConnect: true,
    heartbeatInterval: 10000, // 10 seconds for testing
  });

  const [logs, setLogs] = useState<string[]>([]);
  const [eventHistory, setEventHistory] = useState<
    Array<{ event: string; data: any; timestamp: Date }>
  >([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  };

  useEffect(() => {
    if (!socket) {
      addLog("❌ Socket not initialized");
      return;
    }

    // Connection events
    socket.on("connect", () => {
      addLog(`✅ Connected! Socket ID: ${socket.id}`);
      toast.success("Socket Connected", {
        description: `ID: ${socket.id?.slice(0, 8)}...`,
      });
    });

    socket.on("disconnect", (reason) => {
      addLog(`❌ Disconnected: ${reason}`);
      toast.error("Socket Disconnected", { description: reason });
    });

    socket.on("connect_error", (error) => {
      addLog(`⚠️ Connection Error: ${error.message}`);
      toast.error("Connection Error", { description: error.message });
    });

    // Heartbeat
    socket.on("pong", () => {
      addLog("💓 Heartbeat received (pong)");
    });

    // GitHub webhook notification
    socket.on("notification", (data) => {
      addLog(`📬 Notification: ${JSON.stringify(data)}`);
      setEventHistory((prev) => [
        { event: "notification", data, timestamp: new Date() },
        ...prev,
      ]);
      toast.info("GitHub Notification", {
        description: data.message || "New notification received",
      });
    });

    // Analysis updates (if you add this event)
    socket.on("analysisUpdate", (data) => {
      addLog(`📊 Analysis Update: ${JSON.stringify(data)}`);
      setEventHistory((prev) => [
        { event: "analysisUpdate", data, timestamp: new Date() },
        ...prev,
      ]);
    });

    // Catch-all for any event
    socket.onAny((event, ...args) => {
      if (["connect", "disconnect", "pong", "notification"].includes(event))
        return;
      addLog(`🔔 Event: ${event} - ${JSON.stringify(args)}`);
    });

    addLog("👂 Socket listeners registered");

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("pong");
      socket.off("notification");
      socket.off("analysisUpdate");
      socket.offAny();
    };
  }, [socket]);

  const sendPing = () => {
    if (!socket?.connected) {
      toast.error("Socket not connected");
      return;
    }
    socket.emit("ping");
    addLog("🏓 Sent ping to server");
    toast.info("Ping sent", { description: "Waiting for pong..." });
  };

  const sendTestEvent = () => {
    if (!socket?.connected) {
      toast.error("Socket not connected");
      return;
    }
    const testData = {
      message: "Test from frontend",
      timestamp: new Date().toISOString(),
    };
    socket.emit("testEvent", testData);
    addLog(`📤 Sent testEvent: ${JSON.stringify(testData)}`);
    toast.success("Test event sent");
  };

  const clearLogs = () => {
    setLogs([]);
    setEventHistory([]);
    toast.info("Logs cleared");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[450px] max-h-[600px] bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`w-4 h-4 rounded-full ${
                  isConnected ? "bg-green-400" : "bg-red-400"
                }`}
              />
              {isConnected && (
                <div className="absolute inset-0 w-4 h-4 rounded-full bg-green-400 animate-ping opacity-75" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg">Socket Tester</h3>
              <p className="text-xs opacity-90">
                {isConnected
                  ? `ID: ${socket?.id?.slice(0, 12)}...`
                  : "Not connected"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={connect}
            disabled={isConnected}
            className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Connect
          </button>
          <button
            onClick={disconnect}
            disabled={!isConnected}
            className="px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Disconnect
          </button>
          <button
            onClick={sendPing}
            disabled={!isConnected}
            className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Ping
          </button>
          <button
            onClick={sendTestEvent}
            disabled={!isConnected}
            className="px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test Event
          </button>
        </div>
        <button
          onClick={clearLogs}
          className="w-full mt-2 px-3 py-1.5 text-xs bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
        >
          Clear Logs
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <button className="flex-1 px-4 py-2 text-sm font-medium border-b-2 border-blue-500 text-blue-600 dark:text-blue-400">
          Console Logs
        </button>
        <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          Events ({eventHistory.length})
        </button>
      </div>

      {/* Console Logs */}
      <div className="h-[300px] overflow-y-auto bg-gray-900 text-gray-100 p-3 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-gray-500 italic text-center py-8">
            No logs yet. Try connecting or sending a ping.
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="hover:bg-gray-800 px-2 py-1 rounded">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 text-xs">
        <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
          How to test:
        </p>
        <ol className="list-decimal list-inside space-y-0.5 text-blue-800 dark:text-blue-400">
          <li>Check if connection status is green</li>
          <li>Click "Send Ping" and wait for "pong" response</li>
          <li>Trigger a GitHub push event (push code to your repo)</li>
          <li>Watch for "notification" events in the logs</li>
        </ol>
      </div>
    </div>
  );
}
