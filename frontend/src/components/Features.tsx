import React from "react";
import Particles from "./ui/Particles";
import "@/app/glass.css";
import { Brain, Zap, Shield, ArrowRight } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

function Features() {
  const { theme } = useTheme();
  const particleColor = theme === "dark" ? "#888888" : "#6d4e9c";

  return (
    <div>
      <section className="relative features-section py-20 px-4 overflow-hidden">
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
              particleColors={[particleColor, particleColor]}
              particleCount={400}
              particleSpread={15}
              speed={0.2}
              particleBaseSize={80}
              sizeRandomness={0}
              moveParticlesOnHover={true}
              alphaParticles={false}
              disableRotation={true}
            />
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[var(--color-fg)] mb-4 glass-text">
              Why Choose CodeHealth AI?
            </h2>
            <p className="text-xl text-[var(--color-fg-secondary)] max-w-2xl mx-auto glass-text-subtle">
              Powerful AI-driven code analysis and health monitoring for modern
              development teams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card glass-shimmer glass-theme text-center p-8 group relative overflow-hidden">
              <div className="absolute top-3 right-3 w-2 h-2 bg-[var(--color-primary)]/30 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-3 w-1 h-5 bg-gradient-to-t from-[var(--color-accent)]/20 to-transparent rounded-full"></div>

              <div className="relative mx-auto mb-6 w-fit">
                <div className="w-16 h-16 glass-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Brain className="w-7 h-7 text-[var(--color-primary)] relative z-10" />
                </div>
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

              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
            </div>

            <div className="glass-card glass-shimmer glass-theme text-center p-8 group relative overflow-hidden">
              <div className="absolute top-2 left-4 w-1.5 h-1.5 bg-[var(--color-accent)]/40 rounded-full animate-pulse delay-200"></div>
              <div className="absolute bottom-3 right-2 w-3 h-1 bg-gradient-to-r from-[var(--color-primary)]/30 to-transparent rounded-full"></div>
              <div className="absolute top-1/3 right-1 w-1 h-4 bg-gradient-to-t from-yellow-400/20 to-transparent rounded-full animate-pulse delay-500"></div>

              <div className="relative mx-auto mb-6 w-fit">
                <div className="w-16 h-16 glass-accent rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-70 transition-all duration-500"></div>
                  <Zap className="w-7 h-7 text-yellow-400 relative z-10" />
                </div>
                <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-[var(--color-accent)]/20 via-yellow-400/15 to-transparent rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              </div>

              <h3 className="text-xl font-semibold text-[var(--color-fg)] mb-4 glass-text group-hover:text-yellow-400 transition-colors duration-300">
                Real-time Monitoring
              </h3>
              <p className="text-[var(--color-fg-secondary)] glass-text-subtle leading-relaxed">
                Monitor your code health in real-time with instant notifications
                and actionable insights delivered straight to your workflow.
              </p>

              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-[var(--color-accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
            </div>

            <div className="glass-card glass-shimmer glass-theme text-center p-8 group relative overflow-hidden">
              <div className="absolute top-4 right-2 w-2 h-2 bg-green-400/30 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-2 left-1/3 w-1.5 h-1.5 bg-[var(--color-primary)]/25 rounded-full animate-pulse delay-700"></div>
              <div className="absolute top-1/4 left-2 w-1 h-3 bg-gradient-to-t from-green-400/25 to-transparent rounded-full"></div>

              <div className="relative mx-auto mb-6 w-fit">
                <div className="w-16 h-16 glass-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-green-400/15 to-transparent opacity-0 group-hover:opacity-70 transition-all duration-500"></div>
                  <Shield className="w-7 h-7 text-green-400 relative z-10" />
                </div>
                <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-[var(--color-primary)]/20 to-green-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              </div>

              <h3 className="text-xl font-semibold text-[var(--color-fg)] mb-4 glass-text group-hover:text-green-400 transition-colors duration-300">
                Enterprise Security
              </h3>
              <p className="text-[var(--color-fg-secondary)] glass-text-subtle leading-relaxed">
                Bank-level security with encrypted data processing, SOC2
                compliance, and complete privacy protection for your code.
              </p>

              <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 via-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative stats-section py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[var(--color-bg-secondary)]/50 backdrop-blur-sm"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="glass-subtle glass-theme p-6 rounded-2xl group transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-[var(--color-fg)] mb-2 glass-text group-hover:scale-110 transition-transform duration-300">
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
              <div className="text-4xl font-bold text-[var(--color-fg)] mb-2 glass-text group-hover:scale-110 transition-transform duration-300">
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
              <div className="text-4xl font-bold text-[var(--color-fg)] mb-2 glass-text group-hover:scale-110 transition-transform duration-300">
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
              <div className="text-4xl font-bold text-[var(--color-fg)] mb-2 glass-text group-hover:scale-110 transition-transform duration-300">
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

      <section className="relative py-20 px-4">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <Particles
            particleColors={[particleColor, particleColor]}
            particleCount={400}
            particleSpread={15}
            speed={0.2}
            particleBaseSize={80}
            sizeRandomness={0}
            moveParticlesOnHover={true}
            alphaParticles={true}
            disableRotation={true}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="glass-card glass-shimmer glass-theme p-12 relative overflow-hidden">
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
                className="glass-btn-primary text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                onClick={() =>
                  (window.location.href = process.env.NEXT_PUBLIC_SIGNUP_URL!)
                }
              >
                Start Free Trial <ArrowRight className="w-5 h-5" />
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

            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/3 via-[var(--color-accent)]/3 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Features;
