import React from "react";
import { useAuthStore } from "@/store/authStore";

export const Logo: React.FC = () => {
  const { authUser } = useAuthStore();

  return (
    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
      <span className="text-white font-bold text-xs">
        {authUser?.name?.charAt(0).toUpperCase() || "U"}
      </span>
    </div>
  );
};
