// "use client"
// import React, { useEffect, useState } from 'react';
// import { useRef } from 'react';
// import gsap from 'gsap';
// import { useGSAP } from '@gsap/react';
// import "@/app/globals.css"
// import { useRouter } from 'next/navigation';
// import { useAuthStore } from '@/store/authStore';

// gsap.registerPlugin(useGSAP);

// export default function Home() {
//  const router = useRouter();
//   const { authUser, isloggingin, checkAuth } = useAuthStore();
//   const container = useRef<HTMLDivElement>(null);
//   const circle = useRef<HTMLDivElement>(null); 
//   const [animationsReady, setAnimationsReady] = useState(false);

//   useEffect(() => {
//     const initAuth = async () => {
//       await checkAuth(router as any);
//       if (authUser) {
//         router.push('/dashboard');
//       } else {
//         setAnimationsReady(true);
//       }
//     };
//     initAuth();
//   }, [checkAuth, authUser, router]);

//   // Run animations only when ready and user is not authenticated
//   useGSAP(
//     () => {
//       if (animationsReady && !isloggingin && !authUser) {
//         // Ensure elements exist before animating
//         const boxElements = document.querySelectorAll(".box");
//         if (boxElements.length > 0 && circle.current) {
//           gsap.to(".box", { 
//             rotation: "+=360", 
//             duration: 3,
//             ease: "power2.inOut",
//             repeat: -1 
//           });
//           gsap.to(circle.current, { 
//             rotation: "-=360", 
//             duration: 3,
//             ease: "power2.inOut",
//             repeat: -1 
//           });
//         }
//       }
//     },
//     { 
//       scope: container,
//       dependencies: [animationsReady, isloggingin, authUser] // Add dependencies
//     }
//   );

//   // loading state for checking authentication
//   if (isloggingin) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"></div>
//           <p className="mt-4">Checking authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   if (authUser) {
//     return null;
//   }

//   return (
//   <div className="flex flex-col items-center justify-center min-h-screen">
//     <div ref={container} className="flex items-center justify-center gap-8 p-8 bg-secondary rounded-lg shadow-lg">
//       <div className="font-sans box w-24 h-24 rounded-lg flex items-center justify-center font-bold text-white bg-gradient-to-br from-blue-500 to-blue-300 shadow-md">
//         Hi
//       </div>
//       <div
//         className="circle w-24 h-24 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br from-green-500 to-green-300 shadow-md"
//         ref={circle}
//       >
//       Let's
//       </div>
//     </div>
//     <div className="box w-24 h-24 rounded-lg flex items-center justify-center font-bold text-white bg-gradient-to-br from-blue-500 to-blue-300 shadow-md mt-8">
//       Begin
//     </div>

//     <button className='btn w-40 mt-4' onClick={() => {window.location.href = `${process.env.NEXT_PUBLIC_LOGIN_URL}`}}>
//       Log In
//     </button>
//     <button className='btn w-40 mt-4' onClick={() => {window.location.href = `${process.env.NEXT_PUBLIC_SIGNUP_URL}`}}>
//       Sign Up
//     </button>
//   </div>
// );
// }







"use client";
import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import "@/app/globals.css";
import Particles from "@/components/ui/Particles";
import Features from "@/components/Features";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Home() {
  const router = useRouter();
  const { authUser, isloggingin, checkAuth } = useAuthStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationsReady, setAnimationsReady] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth(router as any);
      if (authUser) {
        router.push("/dashboard");
      } else {
        setAnimationsReady(true);
      }
    };
    initAuth();
  }, [checkAuth, authUser, router]);

  useGSAP(
    () => {
      if (animationsReady && !isloggingin && !authUser) {
        // Smooth scrolling setup
        gsap.registerPlugin(ScrollTrigger);

        // Hero animations
        gsap.fromTo(
          ".hero-title",
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
        );

        gsap.fromTo(
          ".hero-subtitle",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power3.out" }
        );

        gsap.fromTo(
          ".hero-cta",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, delay: 0.6, ease: "power3.out" }
        );

        // Floating animation for neon elements
        gsap.to(".neon-element", {
          y: "-10px",
          duration: 2,
          ease: "power1.inOut",
          yoyo: true,
          repeat: -1,
        });

        // Features section scroll animation
        gsap.fromTo(
          ".feature-card",
          {
            opacity: 0,
            y: 50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            scrollTrigger: {
              trigger: ".features-section",
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          }
        );

        // Stats counter animation - FIXED
        gsap.fromTo(
          ".stat-number",
          {
            innerHTML: "0",
          },
          {
            duration: 2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".stats-section",
              start: "top 80%",
            },
            onUpdate: function () {
              const elements = gsap.utils.toArray(
                ".stat-number"
              ) as HTMLElement[];
              elements.forEach((el) => {
                const targetValue = parseInt(
                  el.getAttribute("data-value") || "0"
                );
                const currentValue = Math.round(this.progress() * targetValue);
                el.textContent = currentValue.toString();
              });
            },
          }
        );
      }
    },
    { dependencies: [animationsReady, isloggingin, authUser] }
  );

  if (isloggingin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-primary)] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[var(--color-fg-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (authUser) {
    return null;
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />
      <HeroSection />
      <Features />
      <Footer />
    </div>
  );
}