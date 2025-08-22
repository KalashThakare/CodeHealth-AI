"use client";
import Particles from "@/components/ui/Particles";
import { DashboardThemeToggle } from "@/components/ui/DashboardThemeToggle";
import React from "react";
import Link from "next/link";

function page() {
  return (
    <div className="min-h-screen glass-bg relative overflow-hidden">
      {/* Theme Toggle in Top Right Corner */}
      <div className="absolute top-4 right-4 z-50">
        <DashboardThemeToggle />
      </div>

      {/* Back to Home Button */}
      <div className="absolute top-4 left-4 z-50">
        <Link
          href="/"
          className="glass-btn glass-btn-secondary px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
        >
          ← Home
        </Link>
      </div>

      {/* Particles Background */}
      <div className="absolute inset-0 pointer-events-none">
        <Particles
          particleColors={[
            `var(--color-fg)`,
            `var(--color-fg-secondary)`,
            `var(--color-primary)`,
          ]}
          particleCount={320}
          particleSpread={15}
          speed={0.35}
          particleBaseSize={150}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={true}
          sizeRandomness={2.5}
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <div className="glass-card p-8 rounded-2xl shadow-xl text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-primary">
            Interactive Particles Demo
          </h1>
          <p className="text-lg mb-8 text-text/80 leading-relaxed">
            Experience our beautiful particle system with theme-aware colors and
            smooth animations. The particles respond to your theme changes and
            create an immersive visual experience.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="glass-card p-4 rounded-xl bg-white/5">
              <h3 className="font-semibold mb-2 text-primary">Features</h3>
              <ul className="text-sm text-text/70 space-y-1">
                <li>• Theme-aware particle colors</li>
                <li>• WebGL-powered performance</li>
                <li>• Smooth animations</li>
                <li>• Responsive design</li>
              </ul>
            </div>

            <div className="glass-card p-4 rounded-xl bg-white/5">
              <h3 className="font-semibold mb-2 text-primary">Technology</h3>
              <ul className="text-sm text-text/70 space-y-1">
                <li>• OGL WebGL Library</li>
                <li>• Custom GLSL Shaders</li>
                <li>• React Integration</li>
                <li>• TypeScript Support</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/dashboard"
              className="glass-btn glass-btn-primary px-6 py-3 rounded-lg font-medium transition-all"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/ExtraComp"
              className="glass-btn glass-btn-secondary px-6 py-3 rounded-lg font-medium transition-all"
            >
              View More Examples
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full max-w-4xl">
          <div className="glass-card p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-primary mb-1">120</div>
            <div className="text-sm text-text/60">Active Particles</div>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-green-500 mb-1">60fps</div>
            <div className="text-sm text-text/60">Smooth Animation</div>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-blue-500 mb-1">WebGL</div>
            <div className="text-sm text-text/60">Hardware Accelerated</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
