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
      
      <div className="w-fit" style={{ width: "100%", maxWidth: "320px" }}>
        <h1
          className="text-center"
          style={{ fontSize: "2rem", marginBottom: "1.5rem" }}
        >
          Log in
        </h1>

        <form onSubmit={handleSubmit}>
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
        </form>

        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            margin: "1.5rem 0",
          }}
        />

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
  );
}
