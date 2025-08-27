"use client";
import React, { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Lightning from "./ui/Lightning";
import Particles from "./ui/Particles";

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Function to get current theme from DOM attribute
    const getCurrentTheme = (): "light" | "dark" => {
      return (
        (document.documentElement.getAttribute("data-theme") as
          | "light"
          | "dark") || "dark"
      );
    };

    // Set initial theme
    setTheme(getCurrentTheme());

    // Create observer to watch for data-theme attribute changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          const newTheme = getCurrentTheme();
          console.log("Theme changed to:", newTheme);
          setTheme(newTheme);
        }
      });
    });

    // Start observing
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      // Subtle neon glow animation
      gsap.to(".neon-glow", {
        filter:
          "drop-shadow(0 0 8px var(--color-primary)) drop-shadow(0 0 16px var(--color-primary))",
        duration: 3,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Floating particles
      gsap.to(".particle", {
        y: "random(-15, 15)",
        x: "random(-15, 15)",
        rotation: "random(-90, 90)",
        duration: "random(4, 8)",
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
        stagger: {
          amount: 3,
          from: "random",
        },
      });

      // Fade effect for "Efficiency" text
      gsap.to(".fade-text", {
        opacity: 0.25,
        duration: 1.5,
        ease: "power2.out",
      });
    },
    { scope: heroRef }
  );

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 pt-16 sm:pt-20 overflow-hidden"
    >
      {/* Lightning Background - Option 1: Full Screen */}
      {theme == 'dark' && <div className="absolute inset-0 pointer-events-none opacity-75 z-0">
        <Lightning speed={2.0} intensity={1.2} size={3.5} xOffset={0} />
      </div>}

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
            particleCount={250}
            particleSpread={10}
            speed={0.3}
            particleBaseSize={100}
            moveParticlesOnHover={true}
            alphaParticles={false}
            disableRotation={true}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="min-h-[80vh] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left side - Text Content */}
          <div className="text-center lg:text-left sm:break-words relative order-2 lg:order-1">
            <h1 className="font-title align-middle font-light hero-title text-4xl sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl text-[var(--color-fg)] mb-6 sm:mb-8 leading-[1.05] text-nowrap">
              Maximize
              <br />
              Developer
              <span> </span>
              <br className="block sm:hidden" />
              <span
                // className="relative inline-block"
                style={{
                  backgroundImage:
                    "linear-gradient(125deg, var(--color-fg), var(--color-bg))",
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
              <p className="hero-subtitle text-base sm:text-lg md:text-xl text-[var(--color-fg-secondary)] mb-4 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                <strong className="text-[var(--color-primary)]">
                  The CodeHealth AI analyzer
                </strong>{" "}
                provides deep insights into developer productivity, code quality
                metrics, and business impact analytics to optimize your
                development workflow.
              </p>

              {/* Code snippet - hidden on mobile */}
              {/* <div className="hidden sm:block font-mono text-sm text-[var(--color-fg-secondary)] opacity-60 max-w-md mx-auto lg:mx-0 mt-6">
                <div className="mb-1">
                  import analytics from &apos;@codehealth/
                </div>
                <div className="mb-1">insights&apos;;</div>
                <div className="mb-1"></div>
                <div className="mb-1">
                  const metrics = await analytics.analyze({`{`}
                </div>
                <div className="mb-1">
                  {" "}
                  project: &apos;./enterprise-app&apos;,
                </div>
                <div className="mb-1"> team: &apos;frontend-team&apos;</div>
                <div className="mb-1">{`}`});</div>
              </div> */}
            </div>

            <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-8 sm:mb-10">
              <button
                className="apple-button bg-[var(--color-primary)] text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 w-full sm:w-auto"
                onClick={() =>
                  (window.location.href = process.env.NEXT_PUBLIC_LOGIN_URL!)
                }
              >
                Start Analytics Dashboard →
              </button>
            </div>

            {/* Performance indicator */}
            {/* <div className="flex items-center gap-4 sm:gap-6 justify-center lg:justify-start">
              <div className="flex items-center gap-3">
                <div className="text-4xl sm:text-5xl font-bold text-[var(--color-primary)] leading-none">
                  <span className="neon-glow">87</span>
                  <span className="text-base sm:text-lg font-normal opacity-80">
                    %
                  </span>
                </div>
                <div className="flex flex-col text-sm text-[var(--color-fg-secondary)]">
                  <span>Developer</span>
                  <span>Efficiency</span>
                </div>
                <div className="w-16 sm:w-20 h-0.5 bg-gradient-to-r from-[var(--color-primary)] via-blue-400 to-transparent rounded-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-pulse"></div>
                </div>
              </div>
            </div> */}
          </div>

          {/* Right side - Animated Terminal (Hidden on mobile) */}
          <div className="relative top-18 right-8 lg:pl-8 order-1 lg:order-2 hidden sm:block">
            <AnimatedTerminal />
          </div>
        </div>
        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-20 sm:mt-32">
          {/* Developer Analytics Card */}
          <div className="glass-card glass-shimmer glass-theme text-center p-6 sm:p-8 group relative overflow-hidden">
            {/* Floating accent elements */}
            <div className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-primary)]/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-3 left-3 w-1 h-4 bg-gradient-to-t from-[var(--color-accent)]/20 to-transparent rounded-full"></div>

            {/* Icon container with glass effect */}
            <div className="relative mx-auto mb-4 sm:mb-6 w-fit">
              <div className="w-12 sm:w-16 h-12 sm:h-16 glass-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
                {/* Inner shimmer */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="text-white text-lg sm:text-xl font-bold relative z-10">
                  📊
                </span>
              </div>
              {/* Glow ring */}
              <div className="absolute inset-0 w-12 sm:w-16 h-12 sm:h-16 bg-[var(--color-primary)]/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            </div>

            <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-fg)] mb-2 sm:mb-3 glass-text group-hover:text-[var(--color-primary)] transition-colors duration-300">
              Developer Analytics
            </h3>
            <p className="text-sm sm:text-base text-[var(--color-fg-secondary)] leading-relaxed glass-text-subtle">
              Track productivity metrics, velocity trends, and efficiency
              patterns across your development teams
            </p>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
          </div>

          {/* Cost Intelligence Card */}
          <div className="glass-card glass-shimmer glass-theme text-center p-6 sm:p-8 group relative overflow-hidden">
            {/* Floating accent elements */}
            <div className="absolute top-3 left-2 w-1.5 h-1.5 bg-[var(--color-accent)]/40 rounded-full animate-pulse delay-150"></div>
            <div className="absolute bottom-2 right-4 w-3 h-1 bg-gradient-to-r from-[var(--color-primary)]/20 to-transparent rounded-full"></div>

            {/* Icon container with glass effect */}
            <div className="relative mx-auto mb-4 sm:mb-6 w-fit">
              <div className="w-12 sm:w-16 h-12 sm:h-16 glass-accent rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
                {/* Inner shimmer */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="text-white text-lg sm:text-xl relative z-10">
                  💰
                </span>
              </div>
              {/* Glow ring */}
              <div className="absolute inset-0 w-12 sm:w-16 h-12 sm:h-16 bg-[var(--color-accent)]/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            </div>

            <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-fg)] mb-2 sm:mb-3 glass-text group-hover:text-[var(--color-accent)] transition-colors duration-300">
              Cost Intelligence
            </h3>
            <p className="text-sm sm:text-base text-[var(--color-fg-secondary)] leading-relaxed glass-text-subtle">
              Get accurate project cost estimates, resource allocation insights,
              and ROI projections
            </p>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
          </div>

          {/* Performance Insights Card */}
          <div className="glass-card glass-shimmer glass-theme text-center p-6 sm:p-8 sm:col-span-2 md:col-span-1 sm:mx-auto md:mx-0 max-w-sm sm:max-w-none group relative overflow-hidden">
            {/* Floating accent elements */}
            <div className="absolute top-4 right-3 w-2 h-2 bg-green-400/30 rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-4 left-2 w-1 h-3 bg-gradient-to-t from-green-400/20 to-transparent rounded-full"></div>
            <div className="absolute top-2 left-1/2 w-1.5 h-1.5 bg-[var(--color-primary)]/25 rounded-full animate-pulse delay-500"></div>

            {/* Icon container with glass effect */}
            <div className="relative mx-auto mb-4 sm:mb-6 w-fit">
              <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 relative overflow-hidden glass-primary">
                {/* Inner shimmer */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {/* Rocket trail effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-green-400/20 to-transparent opacity-0 group-hover:opacity-70 transition-all duration-500"></div>
                <span className="text-white text-lg sm:text-xl relative z-10">
                  🚀
                </span>
              </div>
              {/* Enhanced glow ring for performance */}
              <div className="absolute inset-0 w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-[var(--color-primary)]/20 to-green-400/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            </div>

            <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-fg)] mb-2 sm:mb-3 glass-text group-hover:text-green-400 transition-colors duration-300">
              Performance Insights
            </h3>
            <p className="text-sm sm:text-base text-[var(--color-fg-secondary)] leading-relaxed glass-text-subtle">
              Identify bottlenecks, optimize workflows, and accelerate delivery
              with data-driven recommendations
            </p>

            {/* Special hover overlay for performance card */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 via-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
          </div>
        </div>
      </div>

      {/* Gradient Overlay */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg)]/80 pointer-events-none" /> */}
    </section>
  );
}

// Theme-Aware Animated Terminal Component with Analytics Focus
function AnimatedTerminal() {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const steps = [
    {
      prompt: "$ codehealth analyze",
      responses: [
        "🔍 Scanning files...",
        "📊 Running analytics...",
        "🧠 AI processing...",
      ],
    },
    {
      prompt: "",
      responses: [
        "📈 Results:",
        "  Efficiency: 87.3%",
        "  Cost: $127k",
        "  Velocity: +23%",
        "✨ Done in 10ms",
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
          timeout = setTimeout(typeText, 600);
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
              }, 1500);
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
      <div className="apple-card terminal-window bg-[var(--terminal-bg)] rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl border border-[var(--terminal-border)] backdrop-blur-xl transform hover:scale-[1.02] transition-transform duration-300">
        <div className="flex items-center justify-between px-3 lg:px-4 py-2 lg:py-3 bg-[var(--terminal-header)] border-b border-[var(--terminal-border)]">
          <div className="flex items-center gap-1.5 lg:gap-2">
            <div className="w-2.5 lg:w-3 h-2.5 lg:h-3 bg-red-500 rounded-full shadow-sm hover:bg-red-400 transition-colors"></div>
            <div className="w-2.5 lg:w-3 h-2.5 lg:h-3 bg-yellow-500 rounded-full shadow-sm hover:bg-yellow-400 transition-colors"></div>
            <div className="w-2.5 lg:w-3 h-2.5 lg:h-3 bg-green-500 rounded-full shadow-sm hover:bg-green-400 transition-colors"></div>
          </div>
          <div className="text-[var(--terminal-title)] text-xs lg:text-sm font-mono font-medium opacity-80">
            Analytics
          </div>
          <div className="w-12 lg:w-16"></div>
        </div>

        {/* Compact Terminal Content */}
        <div className="p-3 lg:p-4 min-h-[200px] md:min-h-[240px] lg:min-h-[280px] font-mono text-xs lg:text-sm leading-relaxed">
          {/* Command prompt */}
          <div className="text-[var(--terminal-success)] mb-2 flex items-center flex-wrap">
            <span className="text-[var(--terminal-info)] font-medium">ai</span>
            <span className="text-[var(--terminal-text)] mx-1">@</span>
            <span className="text-[var(--terminal-path)] font-medium">
              workspace
            </span>
            <span className="text-[var(--terminal-text)] mx-1">$</span>
            <span className="text-[var(--terminal-command)] ml-1 font-medium">
              {steps[currentStep]?.prompt}
            </span>
          </div>

          {/* Compact Response text */}
          <div className="text-[var(--terminal-text)] space-y-1">
            {displayText.split("\n").map((line, index) => (
              <div key={index} className="animate-fadeIn">
                {line.includes("🔍") && (
                  <span className="text-[var(--terminal-info)] font-medium">
                    {line}
                  </span>
                )}
                {line.includes("📊") && (
                  <span className="text-[var(--terminal-warning)] font-medium">
                    {line}
                  </span>
                )}
                {line.includes("🧠") && (
                  <span className="text-[var(--terminal-cyan)] font-medium">
                    {line}
                  </span>
                )}
                {line.includes("📈") && (
                  <span className="text-[var(--terminal-success)] font-bold">
                    {line}
                  </span>
                )}
                {line.includes("Efficiency") && (
                  <span className="text-[var(--terminal-success-light)] font-medium">
                    {line}
                  </span>
                )}
                {line.includes("Cost") && (
                  <span className="text-[var(--terminal-info-light)] font-medium">
                    {line}
                  </span>
                )}
                {line.includes("Velocity") && (
                  <span className="text-[var(--terminal-accent-light)] font-medium">
                    {line}
                  </span>
                )}
                {line.includes("✨") && (
                  <span className="text-[var(--terminal-success)] font-bold">
                    {line}
                  </span>
                )}
                {!line.includes("🔍") &&
                  !line.includes("📊") &&
                  !line.includes("🧠") &&
                  !line.includes("📈") &&
                  !line.includes("Efficiency") &&
                  !line.includes("Cost") &&
                  !line.includes("Velocity") &&
                  !line.includes("✨") &&
                  line.trim() && (
                    <span className="text-[var(--terminal-text)]">{line}</span>
                  )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1 opacity-60">
                <div className="w-1 h-1 bg-[var(--terminal-accent)] rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-[var(--terminal-accent)] rounded-full animate-pulse delay-100"></div>
                <div className="w-1 h-1 bg-[var(--terminal-accent)] rounded-full animate-pulse delay-200"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute -top-2 -right-2 w-4 h-4 bg-[var(--color-primary)] rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[var(--color-accent)] rounded-full opacity-30 animate-pulse delay-300"></div>
    </div>
  );
}
