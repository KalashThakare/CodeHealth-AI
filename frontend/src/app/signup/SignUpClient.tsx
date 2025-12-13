"use client";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { DashboardThemeToggle } from "@/components/ui/DashboardThemeToggle";
import Link from "next/link";

export default function SignUpClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loaded, setLoaded] = useState(false);
  const signup = useAuthStore((state) => state.signup);
  const router = useRouter();

  const handleGoogleAuthClick = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL}`;
  };
  const handleGithubAuthClick = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_GITHUB_AUTH_URL}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setLoaded(true);
    e.preventDefault();
    try {
      await signup({ name, email, password });
      router.push("/dashboard");
    } finally {
      setLoaded(false);
    }
  };

  if (loaded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"></div>
        <p className="mt-4">Signing up...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="absolute top-4 right-4 z-50">
        <DashboardThemeToggle />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2.2rem",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "650px" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              marginBottom: "1rem",
              fontWeight: "700",
            }}
          >
            Elevate Your Code Quality
          </h1>
          <p
            style={{
              color: "var(--color-fg-secondary)",
              fontSize: "1.125rem",
              lineHeight: "1.6",
              marginBottom: "2.5rem",
            }}
          >
            Join developers who trust CodeHealth AI to maintain healthy
            codebases
          </p>

          <div style={{ textAlign: "left", display: "grid", gap: "0.75rem" }}>
            <div
              style={{ display: "flex", alignItems: "start", gap: "0.75rem" }}
            >
              <span
                style={{
                  fontSize: "1.25rem",
                  flexShrink: 0,
                  color: "var(--color-fg)",
                }}
              >
                ✓
              </span>
              <p
                style={{
                  margin: 0,
                  color: "var(--color-fg-secondary)",
                  fontSize: "0.9375rem",
                  lineHeight: "1.5",
                }}
              >
                <strong style={{ color: "var(--color-fg)" }}>
                  Automated Code Reviews:
                </strong>{" "}
                Get instant feedback on code quality and potential issues
              </p>
            </div>
            <div
              style={{ display: "flex", alignItems: "start", gap: "0.75rem" }}
            >
              <span
                style={{
                  fontSize: "1.25rem",
                  flexShrink: 0,
                  color: "var(--color-fg)",
                }}
              >
                ✓
              </span>
              <p
                style={{
                  margin: 0,
                  color: "var(--color-fg-secondary)",
                  fontSize: "0.9375rem",
                  lineHeight: "1.5",
                }}
              >
                <strong style={{ color: "var(--color-fg)" }}>
                  GitHub Integration:
                </strong>{" "}
                Seamlessly connect your repositories and track metrics in
                real-time
              </p>
            </div>
            <div
              style={{ display: "flex", alignItems: "start", gap: "0.75rem" }}
            >
              <span
                style={{
                  fontSize: "1.25rem",
                  flexShrink: 0,
                  color: "var(--color-fg)",
                }}
              >
                ✓
              </span>
              <p
                style={{
                  margin: 0,
                  color: "var(--color-fg-secondary)",
                  fontSize: "0.9375rem",
                  lineHeight: "1.5",
                }}
              >
                <strong style={{ color: "var(--color-fg)" }}>
                  Security First:
                </strong>{" "}
                Detect vulnerabilities and ensure compliance with best practices
              </p>
            </div>
          </div>
        </div>

        <div className="" style={{ width: "100%", maxWidth: "320px" }}>
          <h2
            className="text-center"
            style={{
              fontSize: "1.5rem",
              marginBottom: "1.5rem",
              fontWeight: "600",
            }}
          >
            Create your account
          </h2>

          <button
            className="btn"
            style={{
              width: "100%",
              marginBottom: "0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              background: "var(--color-bg)",
              color: "var(--color-fg)",
            }}
            onClick={handleGoogleAuthClick}
          >
            <FaGoogle /> Continue with Google
          </button>
          <button
            className="btn"
            style={{
              width: "100%",
              marginBottom: "0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              background: "var(--color-bg)",
              color: "var(--color-fg)",
            }}
            onClick={handleGithubAuthClick}
          >
            <FaGithub /> Continue with GitHub
          </button>

          <div className="text-center" style={{ marginBottom: "1rem" }}>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-fg-secondary)",
                lineHeight: "1.4",
                margin: "0 0 1rem 0",
              }}
            >
              By creating an account, you agree to our{" "}
              <Link
                href="#"
                style={{ color: "var(--color-link)", fontWeight: 500 }}
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="#"
                style={{ color: "var(--color-link)", fontWeight: 500 }}
              >
                Privacy Policy
              </Link>
            </p>
          </div>

          <div className="text-center">
            <span style={{ color: "var(--color-fg)", fontSize: "1rem" }}>
              Already have an account?{" "}
            </span>
            <Link
              href="/login"
              style={{
                color: "var(--color-link)",
                fontWeight: 500,
              }}
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
