"use client";
import React, { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);

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
      {/* Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="particle absolute w-1 h-1 bg-[var(--color-primary)] rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="min-h-[80vh] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left side - Text Content */}
          <div className="text-center lg:text-left relative order-2 lg:order-1">
            <h1 className="font-title align-middle font-light hero-title text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl text-[var(--color-fg)] mb-6 sm:mb-8 leading-[1.05] text-nowrap">
              Maximize Developer
              <br />
              <span className="fade-text relative inline-block">
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
          <div className="apple-card card text-center p-6 sm:p-8 backdrop-blur-sm bg-[var(--color-card)]/60 border border-[var(--color-border)]/30">
            <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-[var(--color-primary)] to-blue-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
              <span className="text-white text-lg sm:text-xl font-bold">
                📊
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-fg)] mb-2 sm:mb-3">
              Developer Analytics
            </h3>
            <p className="text-sm sm:text-base text-[var(--color-fg-secondary)] leading-relaxed">
              Track productivity metrics, velocity trends, and efficiency
              patterns across your development teams
            </p>
          </div>

          <div className="apple-card card text-center p-6 sm:p-8 backdrop-blur-sm bg-[var(--color-card)]/60 border border-[var(--color-border)]/30">
            <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-[var(--color-accent)] to-purple-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
              <span className="text-white text-lg sm:text-xl">💰</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-fg)] mb-2 sm:mb-3">
              Cost Intelligence
            </h3>
            <p className="text-sm sm:text-base text-[var(--color-fg-secondary)] leading-relaxed">
              Get accurate project cost estimates, resource allocation insights,
              and ROI projections
            </p>
          </div>

          <div className="apple-card card text-center p-6 sm:p-8 backdrop-blur-sm bg-[var(--color-card)]/60 border border-[var(--color-border)]/30 sm:col-span-2 md:col-span-1 sm:mx-auto md:mx-0 max-w-sm sm:max-w-none">
            <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-[var(--color-primary)] to-green-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
              <span className="text-white text-lg sm:text-xl">🚀</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-fg)] mb-2 sm:mb-3">
              Performance Insights
            </h3>
            <p className="text-sm sm:text-base text-[var(--color-fg-secondary)] leading-relaxed">
              Identify bottlenecks, optimize workflows, and accelerate delivery
              with data-driven recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg)]/80 pointer-events-none" />
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

// "use client";
// import React, { useRef, useState, useEffect } from "react";
// import { useGSAP } from "@gsap/react";
// import gsap from "gsap";

// export default function HeroSection() {
//   const heroRef = useRef<HTMLDivElement>(null);

//   useGSAP(
//     () => {
//       // Subtle neon glow animation (reduced intensity)
//       gsap.to(".neon-glow", {
//         filter:
//           "drop-shadow(0 0 8px var(--color-primary)) drop-shadow(0 0 16px var(--color-primary))",
//         duration: 3,
//         ease: "power2.inOut",
//         yoyo: true,
//         repeat: -1,
//       });

//       // Floating particles
//       gsap.to(".particle", {
//         y: "random(-15, 15)",
//         x: "random(-15, 15)",
//         rotation: "random(-90, 90)",
//         duration: "random(4, 8)",
//         ease: "power1.inOut",
//         repeat: -1,
//         yoyo: true,
//         stagger: {
//           amount: 3,
//           from: "random",
//         },
//       });

//       // Fade effect for "ready" text
//       gsap.to(".fade-text", {
//         opacity: 0.3,
//         duration: 1,
//         ease: "power2.out",
//       });
//     },
//     { scope: heroRef }
//   );

//   return (
//     <section
//       ref={heroRef}
//       className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden"
//     >
//       {/* Background Particles */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         {Array.from({ length: 30 }).map((_, i) => (
//           <div
//             key={i}
//             className="particle absolute w-1 h-1 bg-[var(--color-primary)] rounded-full opacity-30"
//             style={{
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//               animationDelay: `${Math.random() * 5}s`,
//             }}
//           />
//         ))}
//       </div>

//       <div className="relative z-10 max-w-7xl mx-auto w-full">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
//           {/* Left side - Text Content */}
//           <div className="text-center lg:text-left relative">
//             <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-[var(--color-fg)] mb-8 leading-[0.9]">
//               Lightning fast.
//               <br />
//               Edge{" "}
//               <span className="fade-text relative inline-block">ready</span>
//             </h1>

//             <div className="mb-8">
//               <p className="hero-subtitle text-lg md:text-xl text-[var(--color-fg-secondary)] mb-4 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
//                 <strong className="text-[var(--color-primary)]">
//                   The CodeHealth AI analyzer
//                 </strong>
//                 , designed for lightning-fast code analysis over any codebase.
//               </p>

//               {/* Code snippet */}
//               <div className="font-mono text-sm text-[var(--color-fg-secondary)] opacity-60 max-w-md mx-auto lg:mx-0 mt-6">
//                 <div className="mb-1">import ai from '@codehealth/</div>
//                 <div className="mb-1">analyzer';</div>
//                 <div className="mb-1"></div>
//                 <div className="mb-1">
//                   const result = await ai('SELECT * FROM
//                 </div>
//                 <div className="mb-1">issues');</div>
//               </div>
//             </div>

//             <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-10">
//               <button
//                 className="apple-button bg-[var(--color-primary)] text-white text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300"
//                 onClick={() =>
//                   (window.location.href = process.env.NEXT_PUBLIC_SIGNUP_URL!)
//                 }
//               >
//                 Get the AI Analyzer →
//               </button>
//             </div>

//             {/* Performance indicator */}
//             <div className="flex items-center gap-6 justify-center lg:justify-start">
//               <div className="flex items-center gap-3">
//                 <div className="text-5xl font-bold text-[var(--color-primary)] leading-none">
//                   <span className="neon-glow">10</span>
//                   <span className="text-lg font-normal opacity-80">ms</span>
//                 </div>
//                 <div className="w-20 h-0.5 bg-gradient-to-r from-[var(--color-primary)] via-blue-400 to-transparent rounded-full relative overflow-hidden">
//                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-pulse"></div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right side - Animated Terminal */}
//           <div className="relative lg:pl-8">
//             <AnimatedTerminal />
//           </div>
//         </div>

//         {/* Feature Highlights */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
//           <div className="apple-card card text-center p-8 backdrop-blur-sm bg-[var(--color-card)]/60 border border-[var(--color-border)]/30">
//             <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
//               <span className="text-white text-xl font-bold">AI</span>
//             </div>
//             <h3 className="text-xl font-semibold text-[var(--color-fg)] mb-3">
//               Smart Analysis
//             </h3>
//             <p className="text-[var(--color-fg-secondary)] leading-relaxed">
//               Advanced AI algorithms detect issues before they impact your users
//             </p>
//           </div>

//           <div className="apple-card card text-center p-8 backdrop-blur-sm bg-[var(--color-card)]/60 border border-[var(--color-border)]/30">
//             <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-accent)] to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
//               <span className="text-white text-xl">⚡</span>
//             </div>
//             <h3 className="text-xl font-semibold text-[var(--color-fg)] mb-3">
//               Real-time Insights
//             </h3>
//             <p className="text-[var(--color-fg-secondary)] leading-relaxed">
//               Get instant feedback and recommendations as you code
//             </p>
//           </div>

//           <div className="apple-card card text-center p-8 backdrop-blur-sm bg-[var(--color-card)]/60 border border-[var(--color-border)]/30">
//             <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-green-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
//               <span className="text-white text-xl">🔒</span>
//             </div>
//             <h3 className="text-xl font-semibold text-[var(--color-fg)] mb-3">
//               Enterprise Ready
//             </h3>
//             <p className="text-[var(--color-fg-secondary)] leading-relaxed">
//               Bank-level security with SOC2 compliance and data privacy
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Gradient Overlay */}
//       <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg)]/80 pointer-events-none" />
//     </section>
//   );
// }

// // Animated Terminal Component
// function AnimatedTerminal() {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [displayText, setDisplayText] = useState("");
//   const [isTyping, setIsTyping] = useState(true);

//   const steps = [
//     {
//       prompt: "$ codehealth analyze ./my-project",
//       responses: [
//         "🔍 Connecting to CodeHealth AI...",
//         "✅ Connected successfully",
//         "📂 Scanning project structure...",
//         "⚡ Found 247 files to analyze",
//         "🧠 Running AI analysis...",
//       ],
//     },
//     {
//       prompt: "",
//       responses: [
//         "📊 Analysis Results:",
//         "   Code Quality Score: 94.7%",
//         "   Security Issues: 0 critical, 2 minor",
//         "   Performance: 87% optimized",
//         "   Maintainability: Excellent",
//         "✨ Analysis complete in 10ms",
//       ],
//     },
//   ];

//   useEffect(() => {
//     let timeout: NodeJS.Timeout;

//     const typeStep = () => {
//       const step = steps[currentStep];
//       if (!step) return;

//       let textIndex = 0;
//       const typeText = () => {
//         if (textIndex < step.responses.length) {
//           setDisplayText(step.responses.slice(0, textIndex + 1).join("\n"));
//           textIndex++;
//           timeout = setTimeout(typeText, 800);
//         } else {
//           setIsTyping(false);
//           timeout = setTimeout(() => {
//             if (currentStep < steps.length - 1) {
//               setCurrentStep(currentStep + 1);
//               setDisplayText("");
//               setIsTyping(true);
//             } else {
//               // Reset animation
//               setTimeout(() => {
//                 setCurrentStep(0);
//                 setDisplayText("");
//                 setIsTyping(true);
//               }, 2000);
//             }
//           }, 1500);
//         }
//       };

//       typeText();
//     };

//     typeStep();

//     return () => clearTimeout(timeout);
//   }, [currentStep]);

//   return (
//     <div className="relative max-w-2xl mx-auto">
//       {/* Terminal Window */}
//       <div className="apple-card bg-gray-900/95 rounded-3xl overflow-hidden shadow-2xl border border-gray-700/50 backdrop-blur-xl">
//         {/* Terminal Header */}
//         <div className="flex items-center justify-between px-6 py-4 bg-gray-800/80 border-b border-gray-700/50">
//           <div className="flex items-center gap-3">
//             <div className="w-3.5 h-3.5 bg-red-500 rounded-full shadow-sm"></div>
//             <div className="w-3.5 h-3.5 bg-yellow-500 rounded-full shadow-sm"></div>
//             <div className="w-3.5 h-3.5 bg-green-500 rounded-full shadow-sm"></div>
//           </div>
//           <div className="text-gray-400 text-sm font-mono font-medium">
//             Terminal
//           </div>
//           <div className="w-20"></div>
//         </div>

//         {/* Terminal Content */}
//         <div className="p-6 min-h-[450px] font-mono text-sm leading-relaxed">
//           {/* Command prompt */}
//           <div className="text-green-400 mb-3 flex items-center">
//             <span className="text-blue-400">codehealth@ai</span>
//             <span className="text-white mx-1">:</span>
//             <span className="text-blue-300">~/project</span>
//             <span className="text-white mx-1">$</span>
//             <span className="text-green-300 ml-1">
//               {steps[currentStep]?.prompt}
//             </span>
//           </div>

//           {/* Response text */}
//           <div className="text-gray-300 whitespace-pre-line">
//             {displayText.split("\n").map((line, index) => (
//               <div key={index} className="mb-2 flex items-start">
//                 {line.includes("✅") && (
//                   <span className="text-green-400 font-medium">{line}</span>
//                 )}
//                 {line.includes("🔍") && (
//                   <span className="text-blue-400 font-medium">{line}</span>
//                 )}
//                 {line.includes("📂") && (
//                   <span className="text-yellow-400 font-medium">{line}</span>
//                 )}
//                 {line.includes("⚡") && (
//                   <span className="text-purple-400 font-medium">{line}</span>
//                 )}
//                 {line.includes("🧠") && (
//                   <span className="text-cyan-400 font-medium">{line}</span>
//                 )}
//                 {line.includes("📊") && (
//                   <span className="text-green-400 font-bold">{line}</span>
//                 )}
//                 {line.includes("Code Quality") && (
//                   <span className="text-green-300">{line}</span>
//                 )}
//                 {line.includes("Security") && (
//                   <span className="text-blue-300">{line}</span>
//                 )}
//                 {line.includes("Performance") && (
//                   <span className="text-yellow-300">{line}</span>
//                 )}
//                 {line.includes("Maintainability") && (
//                   <span className="text-purple-300">{line}</span>
//                 )}
//                 {line.includes("✨") && (
//                   <span className="text-green-400 font-bold">{line}</span>
//                 )}
//                 {!line.includes("✅") &&
//                   !line.includes("🔍") &&
//                   !line.includes("📂") &&
//                   !line.includes("⚡") &&
//                   !line.includes("🧠") &&
//                   !line.includes("📊") &&
//                   !line.includes("Code Quality") &&
//                   !line.includes("Security") &&
//                   !line.includes("Performance") &&
//                   !line.includes("Maintainability") &&
//                   !line.includes("✨") && <span>{line}</span>}
//               </div>
//             ))}

//             {/* Removed the blinking cursor */}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";
// import React, { useRef, useState, useEffect } from "react";
// import { useGSAP } from "@gsap/react";
// import gsap from "gsap";

// export default function HeroSection() {
//   const heroRef = useRef<HTMLDivElement>(null);

//   useGSAP(
//     () => {
//       // Subtle neon glow animation
//       gsap.to(".neon-glow", {
//         filter:
//           "drop-shadow(0 0 8px var(--color-primary)) drop-shadow(0 0 16px var(--color-primary))",
//         duration: 3,
//         ease: "power2.inOut",
//         yoyo: true,
//         repeat: -1,
//       });

//       // Floating particles
//       gsap.to(".particle", {
//         y: "random(-15, 15)",
//         x: "random(-15, 15)",
//         rotation: "random(-90, 90)",
//         duration: "random(4, 8)",
//         ease: "power1.inOut",
//         repeat: -1,
//         yoyo: true,
//         stagger: {
//           amount: 3,
//           from: "random",
//         },
//       });

//       // Fade effect for "ready" text
//       gsap.to(".fade-text", {
//         opacity: 0.25,
//         duration: 1.5,
//         ease: "power2.out",
//       });
//     },
//     { scope: heroRef }
//   );

//   return (
//     <section
//       ref={heroRef}
//       className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 pt-16 sm:pt-20 overflow-hidden"
//     >
//       {/* Background Particles */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         {Array.from({ length: 300 }).map((_, i) => (
//           <div
//             key={i}
//             className="particle absolute w-1 h-1 bg-[var(--color-primary)] rounded-full opacity-30"
//             style={{
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//               animationDelay: `${Math.random() * 5}s`,
//             }}
//           />
//         ))}
//       </div>

//       <div className="relative z-10 max-w-7xl mx-auto w-full">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
//           {/* Left side - Text Content */}
//           <div className="text-center lg:text-left relative order-2 lg:order-1">
//             <h1 className="font-title font-light hero-title text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl text-[var(--color-fg)] mb-6 sm:mb-8 leading-[1.05]">
//               Lightning fast.
//               <br />
//               Edge{" "}
//               <span className="fade-text relative inline-block">ready</span>
//             </h1>

//             <div className="mb-6 sm:mb-8">
//               <p className="hero-subtitle text-base sm:text-lg md:text-xl text-[var(--color-fg-secondary)] mb-4 max-w-2xl mx-auto lg:mx-0 leading-relaxed line-clamp-3">
//                 <strong className="text-[var(--color-primary)]">
//                   The CodeHealth AI analyzer
//                 </strong>
//                 , designed for lightning-fast code analysis over any codebase.
//               </p>

//               {/* Code snippet - hidden on mobile */}
//               <div className="hidden sm:block font-mono text-sm text-[var(--color-fg-secondary)] opacity-60 max-w-md mx-auto lg:mx-0 mt-6">
//                 <div className="mb-1">import ai from '@codehealth/</div>
//                 <div className="mb-1">analyzer';</div>
//                 <div className="mb-1"></div>
//                 <div className="mb-1">
//                   const result = await ai('SELECT * FROM
//                 </div>
//                 <div className="mb-1">issues');</div>
//               </div>
//             </div>

//             <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-8 sm:mb-10">
//               <button
//                 className="apple-button bg-[var(--color-primary)] text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 w-full sm:w-auto"
//                 onClick={() =>
//                   (window.location.href = process.env.NEXT_PUBLIC_SIGNUP_URL!)
//                 }
//               >
//                 Get the AI Analyzer →
//               </button>
//             </div>

//             {/* Performance indicator */}
//             <div className="flex items-center gap-4 sm:gap-6 justify-center lg:justify-start">
//               <div className="flex items-center gap-3">
//                 <div className="text-4xl sm:text-5xl font-bold text-[var(--color-primary)] leading-none">
//                   <span className="neon-glow">10</span>
//                   <span className="text-base sm:text-lg font-normal opacity-80">
//                     ms
//                   </span>
//                 </div>
//                 <div className="w-16 sm:w-20 h-0.5 bg-gradient-to-r from-[var(--color-primary)] via-blue-400 to-transparent rounded-full relative overflow-hidden">
//                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-pulse"></div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right side - Animated Terminal (Hidden on mobile) */}
//           <div className="relative lg:pl-8 order-1 lg:order-2 hidden sm:block">
//             <AnimatedTerminal />
//           </div>
//         </div>

//         {/* Feature Highlights */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-20 sm:mt-32">
//           <div className="apple-card card text-center p-6 sm:p-8 backdrop-blur-sm bg-[var(--color-card)]/60 border border-[var(--color-border)]/30">
//             <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-[var(--color-primary)] to-blue-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
//               <span className="text-white text-lg sm:text-xl font-bold">
//                 AI
//               </span>
//             </div>
//             <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-fg)] mb-2 sm:mb-3">
//               Smart Analysis
//             </h3>
//             <p className="text-sm sm:text-base text-[var(--color-fg-secondary)] leading-relaxed">
//               Advanced AI algorithms detect issues before they impact your users
//             </p>
//           </div>

//           <div className="apple-card card text-center p-6 sm:p-8 backdrop-blur-sm bg-[var(--color-card)]/60 border border-[var(--color-border)]/30">
//             <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-[var(--color-accent)] to-purple-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
//               <span className="text-white text-lg sm:text-xl">⚡</span>
//             </div>
//             <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-fg)] mb-2 sm:mb-3">
//               Real-time Insights
//             </h3>
//             <p className="text-sm sm:text-base text-[var(--color-fg-secondary)] leading-relaxed">
//               Get instant feedback and recommendations as you code
//             </p>
//           </div>

//           <div className="apple-card card text-center p-6 sm:p-8 backdrop-blur-sm bg-[var(--color-card)]/60 border border-[var(--color-border)]/30 sm:col-span-2 md:col-span-1 sm:mx-auto md:mx-0 max-w-sm sm:max-w-none">
//             <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-[var(--color-primary)] to-green-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
//               <span className="text-white text-lg sm:text-xl">🔒</span>
//             </div>
//             <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-fg)] mb-2 sm:mb-3">
//               Enterprise Ready
//             </h3>
//             <p className="text-sm sm:text-base text-[var(--color-fg-secondary)] leading-relaxed">
//               Bank-level security with SOC2 compliance and data privacy
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Gradient Overlay */}
//       <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg)]/80 pointer-events-none" />
//     </section>
//   );
// }

// // Theme-Aware Animated Terminal Component
// function AnimatedTerminal() {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [displayText, setDisplayText] = useState("");
//   const [isTyping, setIsTyping] = useState(true);

//   const steps = [
//     {
//       prompt: "$ codehealth analyze ./my-project",
//       responses: [
//         "🔍 Connecting to CodeHealth AI...",
//         "✅ Connected successfully",
//         "📂 Scanning project structure...",
//         "⚡ Found 247 files to analyze",
//         "🧠 Running AI analysis...",
//       ],
//     },
//     {
//       prompt: "",
//       responses: [
//         "📊 Analysis Results:",
//         "   Code Quality Score: 94.7%",
//         "   Security Issues: 0 critical, 2 minor",
//         "   Performance: 87% optimized",
//         "   Maintainability: Excellent",
//         "✨ Analysis complete in 10ms",
//       ],
//     },
//   ];

//   useEffect(() => {
//     let timeout: NodeJS.Timeout;

//     const typeStep = () => {
//       const step = steps[currentStep];
//       if (!step) return;

//       let textIndex = 0;
//       const typeText = () => {
//         if (textIndex < step.responses.length) {
//           setDisplayText(step.responses.slice(0, textIndex + 1).join("\n"));
//           textIndex++;
//           timeout = setTimeout(typeText, 800);
//         } else {
//           setIsTyping(false);
//           timeout = setTimeout(() => {
//             if (currentStep < steps.length - 1) {
//               setCurrentStep(currentStep + 1);
//               setDisplayText("");
//               setIsTyping(true);
//             } else {
//               setTimeout(() => {
//                 setCurrentStep(0);
//                 setDisplayText("");
//                 setIsTyping(true);
//               }, 2000);
//             }
//           }, 1500);
//         }
//       };

//       typeText();
//     };

//     typeStep();

//     return () => clearTimeout(timeout);
//   }, [currentStep]);

//   return (
//     <div className="relative max-w-xl lg:max-w-2xl mx-auto">
//       {/* Theme-Aware Terminal Window */}
//       <div className="apple-card terminal-window bg-[var(--terminal-bg)] rounded-3xl overflow-hidden shadow-2xl border border-[var(--terminal-border)] backdrop-blur-xl">
//         {/* Terminal Header */}
//         <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-[var(--terminal-header)] border-b border-[var(--terminal-border)]">
//           <div className="flex items-center gap-2 sm:gap-3">
//             <div className="w-3 sm:w-3.5 h-3 sm:h-3.5 bg-red-500 rounded-full shadow-sm"></div>
//             <div className="w-3 sm:w-3.5 h-3 sm:h-3.5 bg-yellow-500 rounded-full shadow-sm"></div>
//             <div className="w-3 sm:w-3.5 h-3 sm:h-3.5 bg-green-500 rounded-full shadow-sm"></div>
//           </div>
//           <div className="text-[var(--terminal-title)] text-xs sm:text-sm font-mono font-medium">
//             Terminal
//           </div>
//           <div className="w-16 sm:w-20"></div>
//         </div>

//         {/* Terminal Content */}
//         <div className="p-4 sm:p-6 min-h-[350px] sm:min-h-[450px] font-mono text-xs sm:text-sm leading-relaxed">
//           {/* Command prompt */}
//           <div className="text-[var(--terminal-success)] mb-2 sm:mb-3 flex items-center flex-wrap">
//             <span className="text-[var(--terminal-info)]">codehealth@ai</span>
//             <span className="text-[var(--terminal-text)] mx-1">:</span>
//             <span className="text-[var(--terminal-path)]">~/project</span>
//             <span className="text-[var(--terminal-text)] mx-1">$</span>
//             <span className="text-[var(--terminal-command)] ml-1 break-all">
//               {steps[currentStep]?.prompt}
//             </span>
//           </div>

//           {/* Response text */}
//           <div className="text-[var(--terminal-text)] whitespace-pre-line">
//             {displayText.split("\n").map((line, index) => (
//               <div key={index} className="mb-1 sm:mb-2">
//                 {line.includes("✅") && (
//                   <span className="text-[var(--terminal-success)] font-medium">
//                     {line}
//                   </span>
//                 )}
//                 {line.includes("🔍") && (
//                   <span className="text-[var(--terminal-info)] font-medium">
//                     {line}
//                   </span>
//                 )}
//                 {line.includes("📂") && (
//                   <span className="text-[var(--terminal-warning)] font-medium">
//                     {line}
//                   </span>
//                 )}
//                 {line.includes("⚡") && (
//                   <span className="text-[var(--terminal-accent)] font-medium">
//                     {line}
//                   </span>
//                 )}
//                 {line.includes("🧠") && (
//                   <span className="text-[var(--terminal-cyan)] font-medium">
//                     {line}
//                   </span>
//                 )}
//                 {line.includes("📊") && (
//                   <span className="text-[var(--terminal-success)] font-bold">
//                     {line}
//                   </span>
//                 )}
//                 {line.includes("Code Quality") && (
//                   <span className="text-[var(--terminal-success-light)]">
//                     {line}
//                   </span>
//                 )}
//                 {line.includes("Security") && (
//                   <span className="text-[var(--terminal-info-light)]">
//                     {line}
//                   </span>
//                 )}
//                 {line.includes("Performance") && (
//                   <span className="text-[var(--terminal-warning-light)]">
//                     {line}
//                   </span>
//                 )}
//                 {line.includes("Maintainability") && (
//                   <span className="text-[var(--terminal-accent-light)]">
//                     {line}
//                   </span>
//                 )}
//                 {line.includes("✨") && (
//                   <span className="text-[var(--terminal-success)] font-bold">
//                     {line}
//                   </span>
//                 )}
//                 {!line.includes("✅") &&
//                   !line.includes("🔍") &&
//                   !line.includes("📂") &&
//                   !line.includes("⚡") &&
//                   !line.includes("🧠") &&
//                   !line.includes("📊") &&
//                   !line.includes("Code Quality") &&
//                   !line.includes("Security") &&
//                   !line.includes("Performance") &&
//                   !line.includes("Maintainability") &&
//                   !line.includes("✨") && (
//                     <span className="text-[var(--terminal-text)]">{line}</span>
//                   )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
