"use client";
import React from "react";
import Particles from "./ui/Particles";
import "@/app/glass.css";
import "@/app/landing.css";
import {
  Brain,
  Zap,
  Shield,
  ArrowRight,
  GitBranch,
  Search,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  Code2,
  Wrench,
  BarChart3,
  FileCode,
  Activity,
  Target,
  Gauge,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

function Features() {
  const { theme } = useTheme();
  const particleColor = theme === "dark" ? "#888888" : "#6d4e9c";

  return (
    <div>
      {/* Why Choose Section */}
      <section
        id="features"
        className="relative features-section py-20 px-4 overflow-hidden"
      >
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

        <div className="relative z-10 landing-container">
          <div className="text-center mb-16">
            <span className="landing-section-label">
              <Zap className="w-3.5 h-3.5" />
              Why CodeHealth AI
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: "var(--color-fg)" }}
            >
              What Makes Us Different
            </h2>
            <p
              className="text-lg sm:text-xl max-w-2xl mx-auto"
              style={{ color: "var(--color-fg-secondary)" }}
            >
              More than just static analysis — we provide context-aware insights
              powered by AI
            </p>
          </div>

          {/* Varied Card Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Large featured card */}
            <div className="lg:col-span-2 landing-card-gradient p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      theme === "dark"
                        ? "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))"
                        : "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))",
                  }}
                >
                  <Brain
                    className="w-8 h-8"
                    style={{
                      color: theme === "dark" ? "#60a5fa" : "#7c3aed",
                    }}
                  />
                </div>
                <div>
                  <h3
                    className="text-xl font-semibold mb-3"
                    style={{ color: "var(--color-fg)" }}
                  >
                    AI-Powered Code Understanding
                  </h3>
                  <p
                    className="text-base leading-relaxed mb-4"
                    style={{ color: "var(--color-fg-secondary)" }}
                  >
                    Our AI doesn't just scan for patterns — it understands your
                    code contextually. Get explanations in plain language about
                    why certain patterns are problematic and how to fix them.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="landing-tech-badge">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Context-aware analysis
                    </span>
                    <span className="landing-tech-badge">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Plain language explanations
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Smaller card */}
            <div className="landing-card-accent p-6">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{
                  background:
                    theme === "dark"
                      ? "rgba(250, 204, 21, 0.15)"
                      : "rgba(234, 179, 8, 0.12)",
                }}
              >
                <Zap
                  className="w-6 h-6"
                  style={{ color: theme === "dark" ? "#fbbf24" : "#ca8a04" }}
                />
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--color-fg)" }}
              >
                Instant Results
              </h3>
              <p
                className="text-sm"
                style={{ color: "var(--color-fg-secondary)" }}
              >
                Get comprehensive analysis within seconds. No waiting for
                overnight builds or complex CI pipelines.
              </p>
            </div>

            {/* Two smaller cards */}
            <div className="landing-card-accent p-6">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{
                  background:
                    theme === "dark"
                      ? "rgba(34, 197, 94, 0.15)"
                      : "rgba(22, 163, 74, 0.12)",
                }}
              >
                <Shield
                  className="w-6 h-6"
                  style={{ color: theme === "dark" ? "#22c55e" : "#16a34a" }}
                />
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--color-fg)" }}
              >
                GitHub Native
              </h3>
              <p
                className="text-sm"
                style={{ color: "var(--color-fg-secondary)" }}
              >
                Install our GitHub App with read-only access. Your code stays
                secure and never leaves GitHub's servers.
              </p>
            </div>

            <div className="lg:col-span-2 landing-card-gradient p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      theme === "dark"
                        ? "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(59, 130, 246, 0.2))"
                        : "linear-gradient(135deg, rgba(22, 163, 74, 0.15), rgba(37, 99, 235, 0.15))",
                  }}
                >
                  <Target
                    className="w-8 h-8"
                    style={{
                      color: theme === "dark" ? "#22c55e" : "#16a34a",
                    }}
                  />
                </div>
                <div>
                  <h3
                    className="text-xl font-semibold mb-3"
                    style={{ color: "var(--color-fg)" }}
                  >
                    Prioritized Recommendations
                  </h3>
                  <p
                    className="text-base leading-relaxed mb-4"
                    style={{ color: "var(--color-fg-secondary)" }}
                  >
                    Not all issues are equal. We rank recommendations by impact,
                    helping you focus on changes that matter most. See estimated
                    effort and expected improvement for each suggestion.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="landing-tech-badge">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Impact-based ranking
                    </span>
                    <span className="landing-tech-badge">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Effort estimates
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics Section */}
      <section
        className="relative py-16 px-4"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="relative z-10 landing-container">
          <div className="text-center mb-12">
            <span className="landing-section-label">
              <Gauge className="w-3.5 h-3.5" />
              What We Measure
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: "var(--color-fg)" }}
            >
              Comprehensive Code Metrics
            </h2>
            <p
              className="text-lg max-w-xl mx-auto"
              style={{ color: "var(--color-fg-secondary)" }}
            >
              Industry-standard metrics to give you a complete picture of your
              codebase
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="landing-metric-card">
              <div className="landing-metric-value">CC</div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--color-fg)" }}
              >
                Cyclomatic Complexity
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-fg-secondary)" }}
              >
                Code path complexity
              </p>
            </div>
            <div className="landing-metric-card">
              <div className="landing-metric-value">MI</div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--color-fg)" }}
              >
                Maintainability Index
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-fg-secondary)" }}
              >
                Ease of maintenance
              </p>
            </div>
            <div className="landing-metric-card">
              <div className="landing-metric-value">HS</div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--color-fg)" }}
              >
                Halstead Metrics
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-fg-secondary)" }}
              >
                Volume & difficulty
              </p>
            </div>
            <div className="landing-metric-card">
              <div className="landing-metric-value">TD</div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--color-fg)" }}
              >
                Technical Debt
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-fg-secondary)" }}
              >
                Estimated fix time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Languages */}
      <section
        className="relative py-16 px-4 overflow-hidden"
        style={{ background: "var(--color-bg-secondary)" }}
      >
        <div className="relative z-10 landing-container text-center">
          <span className="landing-section-label">
            <FileCode className="w-3.5 h-3.5" />
            Language Support
          </span>
          <h2
            className="text-2xl sm:text-3xl font-bold mb-4"
            style={{ color: "var(--color-fg)" }}
          >
            Works With Your Stack
          </h2>
          <p
            className="text-base mb-8 max-w-lg mx-auto"
            style={{ color: "var(--color-fg-secondary)" }}
          >
            Currently supporting JavaScript, TypeScript, and Python with more
            languages coming soon
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <span className="landing-tech-badge">
              <span style={{ color: "#f7df1e" }}>●</span> JavaScript
            </span>
            <span className="landing-tech-badge">
              <span style={{ color: "#3178c6" }}>●</span> TypeScript
            </span>
            <span className="landing-tech-badge">
              <span style={{ color: "#3776ab" }}>●</span> Python
            </span>
            <span
              className="landing-tech-badge"
              style={{ opacity: 0.6, fontStyle: "italic" }}
            >
              + More coming soon
            </span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="relative py-20 px-4 overflow-hidden"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="relative z-10 landing-container">
          <div className="text-center mb-16">
            <span className="landing-section-label">
              <Wrench className="w-3.5 h-3.5" />
              How It Works
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: "var(--color-fg)" }}
            >
              Get Started in Minutes
            </h2>
            <p
              className="text-lg max-w-xl mx-auto"
              style={{ color: "var(--color-fg-secondary)" }}
            >
              Three simple steps to better code health
            </p>
          </div>

          <div className="relative">
            <div className="landing-steps-connector hidden md:block" />

            <div className="landing-steps-container">
              <div className="landing-step-card">
                <div className="landing-step-number">1</div>
                <div className="mb-4">
                  <GitBranch
                    className="w-8 h-8 mx-auto"
                    style={{ color: "var(--color-primary)" }}
                  />
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "var(--color-fg)" }}
                >
                  Connect Repository
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-fg-secondary)" }}
                >
                  Install our GitHub App and select which repositories you want
                  to analyze. Read-only access keeps your code secure.
                </p>
              </div>

              <div className="landing-step-card">
                <div className="landing-step-number">2</div>
                <div className="mb-4">
                  <Search
                    className="w-8 h-8 mx-auto"
                    style={{ color: "var(--color-primary)" }}
                  />
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "var(--color-fg)" }}
                >
                  AI Analyzes Code
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-fg-secondary)" }}
                >
                  Our AI scans every file, calculating metrics, detecting code
                  smells, and generating prioritized insights.
                </p>
              </div>

              <div className="landing-step-card">
                <div className="landing-step-number">3</div>
                <div className="mb-4">
                  <FileCheck
                    className="w-8 h-8 mx-auto"
                    style={{ color: "var(--color-primary)" }}
                  />
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "var(--color-fg)" }}
                >
                  Get Recommendations
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-fg-secondary)" }}
                >
                  View detailed health scores and follow prioritized improvement
                  suggestions to make your code better.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Discover Section */}
      <section
        className="relative py-20 px-4 overflow-hidden"
        style={{ background: "var(--color-bg-secondary)" }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <Particles
            particleColors={[particleColor, particleColor]}
            particleCount={300}
            particleSpread={15}
            speed={0.15}
            particleBaseSize={80}
            sizeRandomness={0}
            moveParticlesOnHover={true}
            alphaParticles={true}
            disableRotation={true}
          />
        </div>

        <div className="relative z-10 landing-container">
          <div className="text-center mb-16">
            <span className="landing-section-label">
              <Code2 className="w-3.5 h-3.5" />
              Dashboard Preview
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: "var(--color-fg)" }}
            >
              Insights You'll See
            </h2>
            <p
              className="text-lg max-w-xl mx-auto"
              style={{ color: "var(--color-fg-secondary)" }}
            >
              Clear, actionable information about your codebase
            </p>
          </div>

          <div className="landing-discover-grid">
            <div className="landing-discover-card">
              <div className="landing-discover-icon">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3
                  className="text-base font-semibold mb-1"
                  style={{ color: "var(--color-fg)" }}
                >
                  Overall Health Score
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-fg-secondary)" }}
                >
                  A single score (0-100) that summarizes your entire codebase
                  health.
                </p>
              </div>
            </div>

            <div className="landing-discover-card">
              <div className="landing-discover-icon">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3
                  className="text-base font-semibold mb-1"
                  style={{ color: "var(--color-fg)" }}
                >
                  Code Smell Detection
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-fg-secondary)" }}
                >
                  Identify long methods, deep nesting, god classes, and other
                  anti-patterns.
                </p>
              </div>
            </div>

            <div className="landing-discover-card">
              <div className="landing-discover-icon">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3
                  className="text-base font-semibold mb-1"
                  style={{ color: "var(--color-fg)" }}
                >
                  Refactoring Suggestions
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-fg-secondary)" }}
                >
                  AI-generated suggestions with effort estimates and expected
                  impact.
                </p>
              </div>
            </div>

            <div className="landing-discover-card">
              <div className="landing-discover-icon">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3
                  className="text-base font-semibold mb-1"
                  style={{ color: "var(--color-fg)" }}
                >
                  File-by-File Breakdown
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-fg-secondary)" }}
                >
                  See exactly which files need attention with individual quality
                  scores.
                </p>
              </div>
            </div>

            <div className="landing-discover-card">
              <div className="landing-discover-icon">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3
                  className="text-base font-semibold mb-1"
                  style={{ color: "var(--color-fg)" }}
                >
                  Complexity Distribution
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-fg-secondary)" }}
                >
                  Visualize how complexity is distributed across your codebase.
                </p>
              </div>
            </div>

            <div className="landing-discover-card">
              <div className="landing-discover-icon">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3
                  className="text-base font-semibold mb-1"
                  style={{ color: "var(--color-fg)" }}
                >
                  Security Flags
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-fg-secondary)" }}
                >
                  Basic security checks for common vulnerabilities and best
                  practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <div className="relative z-10 landing-container">
          <div className="landing-cta-section">
            <div
              className="absolute top-4 right-6 w-3 h-3 rounded-full animate-pulse"
              style={{ background: "var(--color-accent)", opacity: 0.3 }}
            />
            <div
              className="absolute bottom-6 left-8 w-2 h-2 rounded-full animate-pulse"
              style={{
                background: "var(--color-primary)",
                opacity: 0.4,
                animationDelay: "0.5s",
              }}
            />

            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: "var(--color-fg)" }}
            >
              Ready to Improve Your Code?
            </h2>
            <p
              className="text-lg mb-8 max-w-xl mx-auto"
              style={{ color: "var(--color-fg-secondary)" }}
            >
              Connect your repository and get your first analysis in under a
              minute. It's completely free.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="landing-btn-primary"
                onClick={() =>
                  (window.location.href = process.env.NEXT_PUBLIC_SIGNUP_URL!)
                }
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </button>
              <button
                className="landing-btn-ghost"
                onClick={() =>
                  (window.location.href = process.env.NEXT_PUBLIC_LOGIN_URL!)
                }
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Features;
