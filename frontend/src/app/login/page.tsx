// components/Login.js
'use client'
import { FaGoogle, FaGithub } from "react-icons/fa";

export default function Login() {

  const handleGoogleAuthClick = () => {
  window.location.href = "http://localhost:8080/auth/google";
};
  const handleGithubAuthClick = () => {
  window.location.href = "http://localhost:8080/auth/github";
};

  return (
    <div className="App">
      <div className="w-fit" style={{ width: '100%', maxWidth: '320px' }}>
        <h1 className="text-center" style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>
          Log in
        </h1>

        <form>
          <input
            type="email"
            placeholder="Email Address"
            style={{ marginBottom: "1rem", width: '100%' }}
            autoComplete="email"
            required
          />
          <input
            type="password"
            placeholder="Password"
            style={{ marginBottom: "1rem", width: '100%' }}
            autoComplete="current-password"
            required
          />
          <button
            type="submit"
            className="btn"
            style={{ width: '100%', marginBottom: "1.5rem" }}
          >
            Continue with Email
          </button>
        </form>

        <div style={{
          borderTop: '1px solid var(--color-border)',
          margin: "1.5rem 0"
        }} />

        <button className="btn" style={{
            width: '100%',
            marginBottom: "0.75rem",
            display: 'flex',
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            background: "var(--color-bg)",
            color: "var(--color-fg)"
          }}
          onClick={handleGoogleAuthClick}
          >
          <FaGoogle /> Continue with Google
        </button>
        <button className="btn" style={{
            width: '100%',
            marginBottom: "0.75rem",
            display: 'flex',
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            background: "var(--color-bg)",
            color: "var(--color-fg)"
          }}
          onClick={handleGithubAuthClick}
          >
          <FaGithub /> Continue with GitHub
        </button>

        <div className="text-center">
          <span style={{ color: "var(--color-fg)", fontSize: "1rem" }}>
            Don't have an account?{' '}
          </span>
          <a
            href="#"
            style={{
              color: "var(--color-link)",
              fontWeight: 500
            }}
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
