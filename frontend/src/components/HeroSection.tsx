"use client";
import React, { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Particles from "./ui/Particles";
import {
  BarChart3,
  GitBranch,
  Lightbulb,
  ArrowRight,
  Terminal,
  CheckCircle,
  Zap,
  TrendingUp,
  FileCode,
} from "lucide-react";
import "@/app/landing.css";

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const getCurrentTheme = (): "light" | "dark" => {
      return (
        (document.documentElement.getAttribute("data-theme") as
          | "light"
          | "dark") || "dark"
      );
    };

    setTheme(getCurrentTheme());

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          const newTheme = getCurrentTheme();
          setTheme(newTheme);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      gsap.to(".neon-glow", {
        filter:
          "drop-shadow(0 0 8px var(--color-primary)) drop-shadow(0 0 16px var(--color-primary))",
        duration: 3,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
      });

      gsap.to(".fade-text", {
        opacity: 0.25,
        duration: 1.5,
        ease: "power2.out",
      });
    },
    { scope: heroRef }
  );

  const particleColor = theme === "dark" ? "#444444" : "#6d4e9c";

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 pt-16 sm:pt-20 overflow-hidden"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="absolute inset-0 pointer-events-none z-0">
        <Particles
          particleColors={[particleColor, particleColor]}
          particleCount={300}
          particleSpread={10}
          speed={0.2}
          particleBaseSize={70}
          sizeRandomness={0}
          moveParticlesOnHover={false}
          particleHoverFactor={1}
          alphaParticles={false}
          disableRotation={true}
          cameraDistance={20}
        />
      </div>

      <div className="relative z-10 landing-container w-full">
        <div className="min-h-[80vh] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="text-center lg:text-left sm:break-words relative order-2 lg:order-1">
            <h1
              className="font-title align-middle font-light hero-title text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl mb-6 sm:mb-8 leading-[1.1] relative z-0"
              style={{ color: "var(--color-fg)" }}
            >
              Understand Your
              <br />
              <span
                className="whitespace-nowrap"
                style={{
                  display: "inline-block",
                }}
              >
                <span style={{ color: "var(--color-fg)" }}>Code Health </span>
                <span
                  className="efficiency-gradient"
                  style={{
                    backgroundImage:
                      theme === "dark"
                        ? "linear-gradient(135deg, #ffffff 0%, #e5e5e5 25%, #a1a1a1 50%, #888888 75%, #666666 100%)"
                        : "linear-gradient(135deg, #a084e8 0%, #8b5cf6 25%, #7c3aed 50%, #a855f7 75%, #cdb4f6 100%)",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "100% 100%",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                  }}
                >
                  at a Glance
                </span>
              </span>
            </h1>

            <div className="mb-6 sm:mb-8">
              <p
                className="hero-subtitle text-base sm:text-lg md:text-xl mb-4 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                style={{ color: "var(--color-fg-secondary)" }}
              >
                Analyze your GitHub repositories with{" "}
                <strong style={{ color: "var(--color-fg)" }}>
                  AI-powered insights
                </strong>
                . Get actionable recommendations for code quality, technical
                debt, and maintainability — completely free.
              </p>
            </div>

            <div className="hero-cta flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center mb-8 sm:mb-10">
              <button
                className="landing-btn-primary w-full sm:w-auto"
                onClick={() =>
                  (window.location.href = process.env.NEXT_PUBLIC_SIGNUP_URL!)
                }
              >
                Connect Your Repository
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                className="landing-btn-secondary w-full sm:w-auto"
                onClick={() =>
                  (window.location.href = process.env.NEXT_PUBLIC_LOGIN_URL!)
                }
              >
                Login to Dashboard
              </button>
            </div>

            <p
              className="text-sm"
              style={{ color: "var(--color-fg-secondary)", opacity: 0.7 }}
            >
              Free forever • No credit card required • GitHub integration
            </p>
          </div>

          <div className="relative lg:pl-8 order-1 lg:order-2 hidden lg:block z-20">
            <AnimatedTerminal theme={theme} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-16 sm:mt-24">
          <FeatureCard
            icon={<BarChart3 className="w-5 h-5" />}
            title="Code Quality Metrics"
            description="Measure cyclomatic complexity, maintainability index, and health scores for every file in your repository."
            accentColor="var(--color-border)"
            theme={theme}
          />

          <FeatureCard
            icon={<GitBranch className="w-5 h-5" />}
            title="Technical Debt Analysis"
            description="Identify and prioritize technical debt with AI-generated refactoring suggestions and estimated effort."
            accentColor="var(--color-border2)"
            theme={theme}
          />

          <FeatureCard
            icon={<Lightbulb className="w-5 h-5" />}
            title="Actionable Recommendations"
            description="Receive clear, prioritized suggestions for improving code quality based on industry best practices."
            accentColor="var(--color-border)"
            className="sm:col-span-2 md:col-span-1 sm:mx-auto md:mx-0 max-w-sm sm:max-w-none"
            theme={theme}
          />
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
  className?: string;
  theme: "light" | "dark";
}

function FeatureCard({
  icon,
  title,
  description,
  accentColor,
  className = "",
  theme,
}: FeatureCardProps) {
  return (
    <div
      className={`landing-card-gradient p-6 sm:p-8 group relative overflow-hidden ${className}`}
    >
      <div
        className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
        style={{
          backgroundColor: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
        }}
      />
      <div
        className="absolute bottom-3 left-3 w-1 h-4 rounded-full"
        style={{
          background: `linear-gradient(to top, color-mix(in srgb, ${accentColor} 20%, transparent), transparent)`,
        }}
      />

      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="relative flex-shrink-0">
          <div
            className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 relative overflow-hidden"
            style={{ 
              backgroundColor: theme === "dark" ? "rgba(59, 130, 246, 0.15)" : "rgba(139, 92, 246, 0.12)",
              border: theme === "dark" ? "1px solid rgba(59, 130, 246, 0.2)" : "1px solid rgba(139, 92, 246, 0.2)"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span style={{ color: theme === "dark" ? "#60a5fa" : "#7c3aed" }} className="relative z-10">{icon}</span>
          </div>
          <div
            className="absolute inset-0 w-10 sm:w-12 h-10 sm:h-12 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"
            style={{
              backgroundColor: theme === "dark" ? "rgba(59, 130, 246, 0.2)" : "rgba(139, 92, 246, 0.15)",
            }}
          />
        </div>

        <h3
          className="text-lg sm:text-xl font-semibold glass-text group-hover:text-[var(--color-primary)] transition-colors duration-300 text-left"
          style={{ color: "var(--color-fg)" }}
        >
          {title}
        </h3>
      </div>

      <p
        className="text-sm sm:text-base leading-relaxed glass-text-subtle text-left"
        style={{ color: "var(--color-fg-secondary)" }}
      >
        {description}
      </p>

      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, ${accentColor} 8%, transparent), transparent)`,
        }}
      />
    </div>
  );
}

function AnimatedTerminal({ theme }: { theme: "light" | "dark" }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const steps = [
    {
      prompt: "codehealth analyze ./my-project",
      responses: [
        "Connecting to GitHub...",
        "Scanning repository files...",
        "Running AI analysis...",
      ],
    },
    {
      prompt: "",
      responses: [
        "",
        "✓ Analysis Complete",
        "─────────────────────────────",
        "Health Score:     87/100",
        "Maintainability:  A",
        "Code Smells:      3 detected",
        "Tech Debt:        ~4 hours",
        "─────────────────────────────",
        "→ 5 recommendations ready",
      ],
    },
  ];

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const typeStep = () => {
      const step = steps[currentStep];
      if (!step) return;

      let textIndex = 0;
      const typeText = () => {
        if (textIndex < step.responses.length) {
          setDisplayText(step.responses.slice(0, textIndex + 1).join("\n"));
          textIndex++;
          timeout = setTimeout(typeText, 350);
        } else {
          setIsTyping(false);
          timeout = setTimeout(() => {
            if (currentStep < steps.length - 1) {
              setCurrentStep(currentStep + 1);
              setDisplayText("");
              setIsTyping(true);
            } else {
              setTimeout(() => {
                setCurrentStep(0);
                setDisplayText("");
                setIsTyping(true);
              }, 2500);
            }
          }, 1200);
        }
      };

      typeText();
    };

    typeStep();

    return () => clearTimeout(timeout);
  }, [currentStep]);

  return (
    <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto">
      <div className="landing-terminal">
        <div className="landing-terminal-header">
          <div className="landing-terminal-dots">
            <div className="landing-terminal-dot red" />
            <div className="landing-terminal-dot yellow" />
            <div className="landing-terminal-dot green" />
          </div>
          <div
            className="flex items-center gap-2 text-xs font-mono font-medium"
            style={{ color: theme === "dark" ? "#6b7280" : "#9ca3af" }}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>codehealth-cli</span>
          </div>
          <div className="w-16" />
        </div>

        <div className="landing-terminal-content">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span
              style={{ color: theme === "dark" ? "#22c55e" : "#16a34a" }}
              className="font-semibold"
            >
              ➜
            </span>
            <span style={{ color: theme === "dark" ? "#60a5fa" : "#7c3aed" }}>
              ~/projects
            </span>
            <span style={{ color: theme === "dark" ? "#6b7280" : "#9ca3af" }}>
              $
            </span>
            <span
              style={{ color: theme === "dark" ? "#f5f5f5" : "#18181b" }}
              className="font-medium"
            >
              {steps[currentStep]?.prompt}
            </span>
          </div>

          <div className="space-y-1">
            {displayText.split("\n").map((line, index) => {
              let lineStyle: React.CSSProperties = {
                color: theme === "dark" ? "#a1a1aa" : "#71717a",
              };

              if (line.includes("✓ Analysis Complete")) {
                lineStyle = {
                  color: theme === "dark" ? "#22c55e" : "#16a34a",
                  fontWeight: 600,
                };
              } else if (line.includes("Health Score")) {
                lineStyle = {
                  color: theme === "dark" ? "#60a5fa" : "#7c3aed",
                  fontWeight: 500,
                };
              } else if (line.includes("Maintainability")) {
                lineStyle = {
                  color: theme === "dark" ? "#22c55e" : "#16a34a",
                };
              } else if (line.includes("Code Smells")) {
                lineStyle = {
                  color: theme === "dark" ? "#fbbf24" : "#d97706",
                };
              } else if (line.includes("Tech Debt")) {
                lineStyle = {
                  color: theme === "dark" ? "#f87171" : "#dc2626",
                };
              } else if (line.includes("recommendations")) {
                lineStyle = {
                  color: theme === "dark" ? "#a78bfa" : "#7c3aed",
                  fontWeight: 500,
                };
              } else if (line.includes("───")) {
                lineStyle = {
                  color: theme === "dark" ? "#3f3f46" : "#d4d4d8",
                };
              }

              return (
                <div key={index} style={lineStyle} className="animate-fadeIn">
                  {line.includes("✓ Analysis Complete") && (
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Analysis Complete
                    </span>
                  )}
                  {line.includes("Health Score") && (
                    <span className="inline-flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      {line}
                    </span>
                  )}
                  {line.includes("recommendations") && (
                    <span className="inline-flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      5 recommendations ready
                    </span>
                  )}
                  {!line.includes("✓ Analysis Complete") &&
                    !line.includes("Health Score") &&
                    !line.includes("recommendations") && <span>{line}</span>}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-1.5 mt-3">
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{
                    backgroundColor: theme === "dark" ? "#60a5fa" : "#7c3aed",
                  }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{
                    backgroundColor: theme === "dark" ? "#60a5fa" : "#7c3aed",
                    animationDelay: "0.2s",
                  }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{
                    backgroundColor: theme === "dark" ? "#60a5fa" : "#7c3aed",
                    animationDelay: "0.4s",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="absolute -top-3 -right-3 w-6 h-6 rounded-full opacity-20 animate-pulse"
        style={{ backgroundColor: theme === "dark" ? "#60a5fa" : "#7c3aed" }}
      />
      <div
        className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full opacity-25 animate-pulse"
        style={{
          backgroundColor: theme === "dark" ? "#a78bfa" : "#8b5cf6",
          animationDelay: "0.5s",
        }}
      />
    </div>
  );
}
