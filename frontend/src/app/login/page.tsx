"use client";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { DashboardThemeToggle } from "@/components/ui/DashboardThemeToggle";

export default function Login() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loaded, setLoaded] = useState(false);

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
      if (await login({ email, password })) {
        router.push("/dashboard");
      }
    } finally {
      setLoaded(false);
    }
  };

  if (loaded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"></div>
        <p className="mt-4">Logging in...</p>
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
          gap: "1.5rem",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "600px" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              marginBottom: "1rem",
              fontWeight: "700",
            }}
          >
            Welcome Back to<br />CodeHealth AI
          </h1>
          <p
            style={{
              color: "var(--color-fg-secondary)",
              fontSize: "1.125rem",
              lineHeight: "1.6",
              marginBottom: "2rem",
            }}
          >
            Your intelligent code analysis companion powered by advanced AI
          </p>

          {/* Key Features List */}
          <div
            style={{
              textAlign: "left",
              display: "grid",
              gap: "0.875rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "start", gap: "0.75rem" }}
            >
              <span
                style={{ fontSize: "1.25rem", flexShrink: 0, color: "var(--color-fg-primary)" }}
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
                  Smart Analysis:
                </strong>{" "}
                AI-powered code health scoring and architectural insights
              </p>
            </div>
            <div
              style={{ display: "flex", alignItems: "start", gap: "0.75rem" }}
            >
              <span
                style={{ fontSize: "1.25rem", flexShrink: 0, color: "var(--color-fg-primary)" }}
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
                  Real-time Metrics:
                </strong>{" "}
                Track PR velocity, team performance, and code quality trends
              </p>
            </div>
            <div
              style={{ display: "flex", alignItems: "start", gap: "0.75rem" }}
            >
              <span
                style={{ fontSize: "1.25rem", flexShrink: 0, color: "var(--color-fg-primary)" }}
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
                  Deep Insights:
                </strong>{" "}
                Identify code smells, security issues, and refactoring
                opportunities
              </p>
            </div>
          </div>
        </div>

        <div className="w-fit" style={{ width: "100%", maxWidth: "320px" }}>
          <h2
            className="text-center"
            style={{
              fontSize: "1.5rem",
              marginBottom: "1.5rem",
              fontWeight: "600",
            }}
          >
            Log in to your account
          </h2>

          {/* <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            placeholder="Email Address"
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginBottom: "1rem", width: "100%" }}
            autoComplete="email"
            required
          />
          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: "1rem", width: "100%" }}
            autoComplete="current-password"
            required
          />
          <button
            type="submit"
            className="btn"
            style={{ width: "100%", marginBottom: "1.5rem" }}
          >
            Continue with Email
          </button>
        </form> */}

          {/* <div
          style={{
            borderTop: "1px solid var(--color-border)",
            margin: "1.5rem 0",
          }}
        /> */}

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

          <div className="text-center">
            <span style={{ color: "var(--color-fg)", fontSize: "1rem" }}>
              Don't have an account?{" "}
            </span>
            <a
              href="/signup"
              style={{
                color: "var(--color-link)",
                fontWeight: 500,
              }}
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
