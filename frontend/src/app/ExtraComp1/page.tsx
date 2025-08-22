"use client";
import ThemeAwareParticles from "@/components/ui/ThemeAwareParticles";
import React from "react";

function page() {
  return (
    <div>
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <ThemeAwareParticles
          particleCount={200}
          particleSpread={10}
          moveParticlesOnHover={true}
          particleHoverFactor={1.5}
          sizeRandomness={0.8}
          disableRotation={false}
          className="opacity-60"
        />
      </div>
    </div>
  );
}

export default page;
