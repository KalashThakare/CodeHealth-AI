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
import Features from "@/components/Features";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Home() {
  const router = useRouter();
  const { authUser, isloggingin, checkAuth, justLoggedOut, clearLogoutFlag } =
    useAuthStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationsReady, setAnimationsReady] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;

    const initAuth = async () => {
      if (justLoggedOut) {
        hasInitialized.current = true;
        clearLogoutFlag();
        setAnimationsReady(true);
        return;
      }

      if (authUser) {
        hasInitialized.current = true;
        router.push("/dashboard");
        return;
      }

      hasInitialized.current = true;
      await checkAuth();

      const currentAuthUser = useAuthStore.getState().authUser;
      if (currentAuthUser) {
        router.push("/dashboard");
      } else {
        setAnimationsReady(true);
      }
    };
    initAuth();
  }, [justLoggedOut]); 

  useGSAP(
    () => {
      if (animationsReady && !isloggingin && !authUser) {
        gsap.registerPlugin(ScrollTrigger);

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

        gsap.to(".neon-element", {
          y: "-10px",
          duration: 2,
          ease: "power1.inOut",
          yoyo: true,
          repeat: -1,
        });

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
