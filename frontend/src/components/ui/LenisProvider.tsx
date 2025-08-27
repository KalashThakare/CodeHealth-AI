"use client";
import { ReactLenis } from "lenis/react";
import { ReactNode } from "react";

interface LenisProviderProps {
  children: ReactNode;
}

export const LenisProvider: React.FC<LenisProviderProps> = ({ children }) => {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        infinite: false,
      }}
    >
      {children}
    </ReactLenis>
  );
};
