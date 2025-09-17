import React from "react";
import Particles from "./ui/Particles";
import "@/app/glass.css";
function Features() {
  return (
    <div>
      {/* Features Section */}
      <section className="relative features-section py-20 px-4 overflow-hidden">
        {/* Background Particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            style={{
              width: "100vw",
              height: "100vh",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Particles
              particleColors={[`var(--color-fg)`, `var(--color-fg)`]}
              particleCount={180}
              particleSpread={8}
              speed={0.2}
              particleBaseSize={80}
              moveParticlesOnHover={true}
              alphaParticles={false}
              disableRotation={true}
            />
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Section Header with Glass Effect */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[var(--color-fg)] mb-4 glass-text">
              Why Choose CodeHealth AI?
            </h2>
            <p className="text-xl text-[var(--color-fg-secondary)] max-w-2xl mx-auto glass-text-subtle">
              Powerful AI-driven code analysis and health monitoring for modern
              development teams
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* AI-Powered Analysis Card */}
            <div className="glass-card glass-shimmer glass-theme text-center p-8 group relative overflow-hidden">
              {/* Floating accent elements */}
              <div className="absolute top-3 right-3 w-2 h-2 bg-[var(--color-primary)]/30 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-3 w-1 h-5 bg-gradient-to-t from-[var(--color-accent)]/20 to-transparent rounded-full"></div>

              {/* Icon container with enhanced glass effect */}
              <div className="relative mx-auto mb-6 w-fit">
                <div className="w-16 h-16 glass-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
                  {/* Inner shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="text-2xl relative z-10">🧠</span>
                </div>
                {/* Enhanced glow ring */}
                <div className="absolute inset-0 w-16 h-16 bg-[var(--color-primary)]/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              </div>

              <h3 className="text-xl font-semibold text-[var(--color-fg)] mb-4 glass-text group-hover:text-[var(--color-primary)] transition-colors duration-300">
                AI-Powered Analysis
              </h3>
              <p className="text-[var(--color-fg-secondary)] glass-text-subtle leading-relaxed">
                Advanced machine learning algorithms analyze your codebase for
                potential issues, performance bottlenecks, and improvement
                opportunities.
              </p>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
            </div>

            {/* Real-time Monitoring Card */}
            <div className="glass-card glass-shimmer glass-theme text-center p-8 group relative overflow-hidden">
              {/* Floating accent elements */}
              <div className="absolute top-2 left-4 w-1.5 h-1.5 bg-[var(--color-accent)]/40 rounded-full animate-pulse delay-200"></div>
              <div className="absolute bottom-3 right-2 w-3 h-1 bg-gradient-to-r from-[var(--color-primary)]/30 to-transparent rounded-full"></div>
              <div className="absolute top-1/3 right-1 w-1 h-4 bg-gradient-to-t from-yellow-400/20 to-transparent rounded-full animate-pulse delay-500"></div>

              {/* Icon container with glass effect */}
              <div className="relative mx-auto mb-6 w-fit">
                <div className="w-16 h-16 glass-accent rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
                  {/* Inner shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {/* Lightning trail effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-70 transition-all duration-500"></div>
                  <span className="text-2xl relative z-10">⚡</span>
                </div>
                {/* Multi-colored glow ring */}
                <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-[var(--color-accent)]/20 via-yellow-400/15 to-transparent rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              </div>

              <h3 className="text-xl font-semibold text-[var(--color-fg)] mb-4 glass-text group-hover:text-yellow-400 transition-colors duration-300">
                Real-time Monitoring
              </h3>
              <p className="text-[var(--color-fg-secondary)] glass-text-subtle leading-relaxed">
                Monitor your code health in real-time with instant notifications
                and actionable insights delivered straight to your workflow.
              </p>

              {/* Special hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-[var(--color-accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
            </div>

            {/* Enterprise Security Card */}
            <div className="glass-card glass-shimmer glass-theme text-center p-8 group relative overflow-hidden">
              {/* Floating accent elements */}
              <div className="absolute top-4 right-2 w-2 h-2 bg-green-400/30 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-2 left-1/3 w-1.5 h-1.5 bg-[var(--color-primary)]/25 rounded-full animate-pulse delay-700"></div>
              <div className="absolute top-1/4 left-2 w-1 h-3 bg-gradient-to-t from-green-400/25 to-transparent rounded-full"></div>

              {/* Icon container with glass effect */}
              <div className="relative mx-auto mb-6 w-fit">
                <div className="w-16 h-16 glass-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
                  {/* Inner shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {/* Security pulse effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-green-400/15 to-transparent opacity-0 group-hover:opacity-70 transition-all duration-500"></div>
                  <span className="text-2xl relative z-10">🔒</span>
                </div>
                {/* Security glow ring */}
                <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-[var(--color-primary)]/20 to-green-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              </div>

              <h3 className="text-xl font-semibold text-[var(--color-fg)] mb-4 glass-text group-hover:text-green-400 transition-colors duration-300">
                Enterprise Security
              </h3>
              <p className="text-[var(--color-fg-secondary)] glass-text-subtle leading-relaxed">
                Bank-level security with encrypted data processing, SOC2
                compliance, and complete privacy protection for your code.
              </p>

              {/* Security hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 via-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Glass Theme */}
      <section className="relative stats-section py-16 overflow-hidden">
        {/* Subtle background overlay */}
        <div className="absolute inset-0 bg-[var(--color-bg-secondary)]/50 backdrop-blur-sm"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {/* Stat Cards with Glass Effect */}
            <div className="glass-subtle glass-theme p-6 rounded-2xl group transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-[var(--color-primary)] mb-2 glass-text group-hover:scale-110 transition-transform duration-300">
                <span
                  className="stat-number neon-glow-subtle"
                  data-value="1000"
                >
                  1000
                </span>
                +
              </div>
              <p className="text-[var(--color-fg-secondary)] glass-text-subtle">
                Projects Analyzed
              </p>
            </div>

            <div className="glass-subtle glass-theme p-6 rounded-2xl group transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-[var(--color-primary)] mb-2 glass-text group-hover:scale-110 transition-transform duration-300">
                <span
                  className="stat-number neon-glow-subtle"
                  data-value="5000"
                >
                  5000
                </span>
                +
              </div>
              <p className="text-[var(--color-fg-secondary)] glass-text-subtle">
                Issues Detected
              </p>
            </div>

            <div className="glass-subtle glass-theme p-6 rounded-2xl group transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-[var(--color-primary)] mb-2 glass-text group-hover:scale-110 transition-transform duration-300">
                <span className="stat-number neon-glow-subtle" data-value="90">
                  90
                </span>
                %
              </div>
              <p className="text-[var(--color-fg-secondary)] glass-text-subtle">
                Accuracy Rate
              </p>
            </div>

            <div className="glass-subtle glass-theme p-6 rounded-2xl group transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-[var(--color-primary)] mb-2 glass-text group-hover:scale-110 transition-transform duration-300">
                <span className="stat-number neon-glow-subtle" data-value="24">
                  24
                </span>
                /7
              </div>
              <p className="text-[var(--color-fg-secondary)] glass-text-subtle">
                Uptime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Glass Theme */}
      <section className="relative py-20 px-4">
        {/* Background particles for CTA */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <Particles
            particleColors={[`var(--color-primary)`, `var(--color-accent)`]}
            particleCount={180}
            particleSpread={15}
            speed={0.2}
            particleBaseSize={120}
            moveParticlesOnHover={false}
            alphaParticles={true}
            disableRotation={true}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* CTA Container with Glass Effect */}
          <div className="glass-card glass-shimmer glass-theme p-12 relative overflow-hidden">
            {/* Floating accent elements */}
            <div className="absolute top-4 right-6 w-3 h-3 bg-[var(--color-accent)]/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-6 left-8 w-2 h-2 bg-[var(--color-primary)]/40 rounded-full animate-pulse delay-500"></div>

            <h2 className="text-4xl font-bold text-[var(--color-fg)] mb-6 glass-text">
              Ready to Transform Your Code Quality?
            </h2>
            <p className="text-xl text-[var(--color-fg-secondary)] mb-8 max-w-2xl mx-auto glass-text-subtle leading-relaxed">
              Join thousands of developers who trust CodeHealth AI to maintain
              pristine code quality and accelerate their development process.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="glass-btn-primary text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                onClick={() =>
                  (window.location.href = process.env.NEXT_PUBLIC_SIGNUP_URL!)
                }
              >
                Start Free Trial →
              </button>
              <button
                className="glass-btn text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                onClick={() =>
                  (window.location.href = process.env.NEXT_PUBLIC_LOGIN_URL!)
                }
              >
                Login
              </button>
            </div>

            {/* CTA hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/3 via-[var(--color-accent)]/3 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Features;
