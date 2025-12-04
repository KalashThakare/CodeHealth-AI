"use client";
import React, { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Particles from "./ui/Particles";
import {
  BarChart3,
  DollarSign,
  Rocket,
  ArrowRight,
  Terminal,
  CheckCircle,
  Zap,
  TrendingUp,
} from "lucide-react";

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

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="min-h-[80vh] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="text-center lg:text-left sm:break-words relative order-2 lg:order-1">
            <h1
              className="font-title align-middle font-light hero-title text-4xl sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl mb-6 sm:mb-8 leading-[1.05] text-nowrap"
              style={{ color: "var(--color-fg)" }}
            >
              Maximize
              <br />
              Developer
              <span> </span>
              <br className="block sm:hidden" />
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
                Efficiency
              </span>
            </h1>

            <div className="mb-6 sm:mb-8">
              <p
                className="hero-subtitle text-base sm:text-lg md:text-xl mb-4 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                style={{ color: "var(--color-fg-secondary)" }}
              >
                <strong style={{ color: "var(--color-fg)" }}>
                  The CodeHealth AI analyzer
                </strong>{" "}
                provides deep insights into developer productivity, code quality
                metrics, and business impact analytics to optimize your
                development workflow.
              </p>
            </div>

            <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-8 sm:mb-10">
              <button
                className="flex items-center gap-2 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 w-full sm:w-auto"
                style={{
                  backgroundColor: "var(--color-btn-bg)",
                  color: "var(--color-btn-fg)",
                  border: "var(--color-btn-border)",
                }}
                onClick={() =>
                  (window.location.href = process.env.NEXT_PUBLIC_LOGIN_URL!)
                }
              >
                Start Analytics Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative top-18 right-8 lg:pl-8 order-1 lg:order-2 hidden lg:block">
            <AnimatedTerminal theme={theme} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-20 sm:mt-32">
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Developer Analytics"
            description="Track productivity metrics, velocity trends, and efficiency patterns across your development teams"
            accentColor="var(--color-border)"
          />

          <FeatureCard
            icon={<DollarSign className="w-6 h-6" />}
            title="Cost Intelligence"
            description="Get accurate project cost estimates, resource allocation insights, and ROI projections"
            accentColor="var(--color-border2)"
          />

          <FeatureCard
            icon={<Rocket className="w-6 h-6" />}
            title="Performance Insights"
            description="Identify bottlenecks, optimize workflows, and accelerate delivery with data-driven recommendations"
            accentColor="var(--color-border)"
            className="sm:col-span-2 md:col-span-1 sm:mx-auto md:mx-0 max-w-sm sm:max-w-none"
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
}

function FeatureCard({
  icon,
  title,
  description,
  accentColor,
  className = "",
}: FeatureCardProps) {
  return (
    <div
      className={`glass-card glass-shimmer glass-theme text-center p-6 sm:p-8 group relative overflow-hidden ${className}`}
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

      <div className="relative mx-auto mb-4 sm:mb-6 w-fit">
        <div
          className="w-12 sm:w-16 h-12 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 relative overflow-hidden"
          style={{ backgroundColor: accentColor }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="text-white relative z-10">{icon}</span>
        </div>
        <div
          className="absolute inset-0 w-12 sm:w-16 h-12 sm:h-16 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{
            backgroundColor: `color-mix(in srgb, ${accentColor} 30%, transparent)`,
          }}
        />
      </div>

      <h3
        className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 glass-text group-hover:text-[var(--color-primary)] transition-colors duration-300"
        style={{ color: "var(--color-fg)" }}
      >
        {title}
      </h3>
      <p
        className="text-sm sm:text-base leading-relaxed glass-text-subtle"
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
      prompt: "codehealth analyze --project ./src",
      responses: [
        "Scanning repository...",
        "Analyzing code patterns...",
        "Running AI diagnostics...",
      ],
    },
    {
      prompt: "",
      responses: [
        "",
        "Analysis Complete",
        "─────────────────────────",
        "Efficiency Score: 87.3%",
        "Est. Cost: $127,000",
        "Velocity: +23% ↑",
        "─────────────────────────",
        "Done in 847ms",
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
          timeout = setTimeout(typeText, 400);
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
              }, 2000);
            }
          }, 1000);
        }
      };

      typeText();
    };

    typeStep();

    return () => clearTimeout(timeout);
  }, [currentStep]);

  return (
    <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto">
      <div
        className="terminal-window rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300"
        style={{
          backgroundColor: theme === "dark" ? "#0a0a0a" : "#fafafa",
          border: `1px solid ${theme === "dark" ? "#262626" : "#e5e5e5"}`,
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            backgroundColor: theme === "dark" ? "#171717" : "#f5f5f5",
            borderBottom: `1px solid ${
              theme === "dark" ? "#262626" : "#e5e5e5"
            }`,
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 transition-colors" />
            <div className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-400 transition-colors" />
            <div className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-400 transition-colors" />
          </div>
          <div
            className="flex items-center gap-2 text-xs font-mono font-medium"
            style={{ color: theme === "dark" ? "#737373" : "#737373" }}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>terminal</span>
          </div>
          <div className="w-16" />
        </div>

        <div
          className="p-4 min-h-[260px] font-mono text-sm leading-relaxed"
          style={{ backgroundColor: theme === "dark" ? "#0a0a0a" : "#fafafa" }}
        >
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span
              style={{ color: theme === "dark" ? "#22c55e" : "#16a34a" }}
              className="font-semibold"
            >
              →
            </span>
            <span style={{ color: theme === "dark" ? "#3b82f6" : "#2563eb" }}>
              ~/workspace
            </span>
            <span style={{ color: theme === "dark" ? "#737373" : "#a3a3a3" }}>
              $
            </span>
            <span
              style={{ color: theme === "dark" ? "#ededed" : "#171717" }}
              className="font-medium"
            >
              {steps[currentStep]?.prompt}
            </span>
          </div>

          <div className="space-y-1.5">
            {displayText.split("\n").map((line, index) => {
              let lineStyle: React.CSSProperties = {
                color: theme === "dark" ? "#a3a3a3" : "#525252",
              };

              if (line.includes("Analysis Complete")) {
                lineStyle = {
                  color: theme === "dark" ? "#22c55e" : "#16a34a",
                  fontWeight: 600,
                };
              } else if (line.includes("Efficiency Score")) {
                lineStyle = {
                  color: theme === "dark" ? "#3b82f6" : "#2563eb",
                };
              } else if (line.includes("Est. Cost")) {
                lineStyle = {
                  color: theme === "dark" ? "#f59e0b" : "#d97706",
                };
              } else if (line.includes("Velocity")) {
                lineStyle = {
                  color: theme === "dark" ? "#22c55e" : "#16a34a",
                };
              } else if (line.includes("Done in")) {
                lineStyle = {
                  color: theme === "dark" ? "#737373" : "#a3a3a3",
                  fontSize: "0.75rem",
                };
              } else if (line.includes("───")) {
                lineStyle = {
                  color: theme === "dark" ? "#404040" : "#d4d4d4",
                };
              }

              return (
                <div key={index} style={lineStyle} className="animate-fadeIn">
                  {line.includes("Analysis Complete") && (
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {line}
                    </span>
                  )}
                  {line.includes("Efficiency") && (
                    <span className="inline-flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      {line}
                    </span>
                  )}
                  {line.includes("Velocity") && (
                    <span className="inline-flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      {line}
                    </span>
                  )}
                  {!line.includes("Analysis Complete") &&
                    !line.includes("Efficiency") &&
                    !line.includes("Velocity") && <span>{line}</span>}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-1.5 mt-2">
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{
                    backgroundColor: theme === "dark" ? "#3b82f6" : "#2563eb",
                  }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{
                    backgroundColor: theme === "dark" ? "#3b82f6" : "#2563eb",
                    animationDelay: "0.2s",
                  }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{
                    backgroundColor: theme === "dark" ? "#3b82f6" : "#2563eb",
                    animationDelay: "0.4s",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="absolute -top-2 -right-2 w-4 h-4 rounded-full opacity-30 animate-pulse"
        style={{ backgroundColor: "var(--color-primary)" }}
      />
      <div
        className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full opacity-40 animate-pulse"
        style={{
          backgroundColor: "var(--color-accent)",
          animationDelay: "0.3s",
        }}
      />
    </div>
  );
}
