import React from "react";
import Image from "next/image";
import { useTheme } from "@/hooks/useTheme";

export const Logo: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="flex items-center justify-center">
      <Image
        src={isDark ? "/Logo_Dark.png" : "/Logo_white.png"}
        alt="Logo"
        width={36}
        height={36}
        style={{
          objectFit: "cover",
          borderRadius:"20px",
          alignContent:"center",
        }}
      />
    </div>
  );
};
