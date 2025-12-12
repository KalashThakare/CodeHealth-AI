"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Github,
  AlertCircle,
} from "lucide-react";

export default function OAuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState("");

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const provider = searchParams.get("provider") || "OAuth";
    const linked = searchParams.get("linked");

    if (success === "true") {
      setStatus("success");
      if (linked === "true") {
        setMessage(`${capitalize(provider)} Connected Successfully!`);
        setDetails(
          `Your ${capitalize(
            provider
          )} account has been linked. You can now use ${capitalize(
            provider
          )} features.`
        );
      } else {
        setMessage(`${capitalize(provider)} Authentication Successful!`);
        setDetails("Redirecting to dashboard...");
      }

      setTimeout(() => {
        router.replace("/dashboard");
      }, 2000);
    } else if (error) {
      setStatus("error");
      const errorMessages: Record<string, { title: string; details: string }> =
        {
          missing_parameters: {
            title: "Authentication Failed",
            details: "Required parameters were missing. Please try again.",
          },
          invalid_state: {
            title: "Security Check Failed",
            details:
              "The authentication request could not be verified. Please try again.",
          },
          authentication_failed: {
            title: "Authentication Failed",
            details: `Could not authenticate with ${capitalize(
              provider
            )}. Please try again.`,
          },
          user_not_found: {
            title: "User Not Found",
            details:
              "Your user account could not be found. Please login again.",
          },
          github_already_linked: {
            title: "Account Already Linked",
            details:
              "This GitHub account is already connected to a different user.",
          },
          google_already_linked: {
            title: "Account Already Linked",
            details:
              "This Google account is already connected to a different user.",
          },
        };

      const errorInfo = errorMessages[error] || {
        title: "Authentication Error",
        details: `An error occurred during ${capitalize(
          provider
        )} authentication: ${error}`,
      };

      setMessage(errorInfo.title);
      setDetails(errorInfo.details);
    } else {
      setStatus("error");
      setMessage("Invalid Request");
      setDetails("This page should only be accessed via OAuth callback.");
    }
  }, [searchParams, router]);

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const handleRetry = () => {
    router.push("/login");
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center `bg-[var(--color-bg)]`">
      <div className="max-w-md w-full mx-4">
        <div
          className="rounded-xl p-8 text-center"
          style={{
            backgroundColor: "var(--color-bg-secondary)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="mb-6 flex justify-center">
            {status === "loading" && (
              <div className="w-16 h-16 rounded-full `bg-[var(--color-bg-tertiary)]` flex items-center justify-center">
                <Loader2
                  className="w-8 h-8 animate-spin"
                  style={{ color: "var(--color-primary)" }}
                />
              </div>
            )}
            {status === "success" && (
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            )}
            {status === "error" && (
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            )}
          </div>

          {searchParams.get("provider") && (
            <div className="mb-4 flex justify-center">
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: "var(--color-bg-tertiary)",
                  color: "var(--color-fg-secondary)",
                }}
              >
                {searchParams.get("provider") === "github" && (
                  <Github className="w-4 h-4" />
                )}
                {searchParams.get("provider") === "google" && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                {capitalize(searchParams.get("provider") || "")}
              </span>
            </div>
          )}

          <h1
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--color-fg)" }}
          >
            {status === "loading" ? "Processing..." : message}
          </h1>

          <p
            className="text-sm mb-6"
            style={{ color: "var(--color-fg-secondary)" }}
          >
            {status === "loading"
              ? "Please wait while we process your authentication..."
              : details}
          </p>

          {status === "error" && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="px-6 py-2.5 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                }}
              >
                Try Again
              </button>
              <button
                onClick={handleGoToDashboard}
                className="px-6 py-2.5 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: "var(--color-bg-tertiary)",
                  color: "var(--color-fg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {status === "success" && (
            <div
              className="flex items-center justify-center gap-2 text-sm"
              style={{ color: "var(--color-fg-muted)" }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecting...
            </div>
          )}
        </div>

        <p
          className="text-center text-xs mt-4"
          style={{ color: "var(--color-fg-muted)" }}
        >
          Having trouble?{" "}
          <a
            href="/dashboard/support"
            className="underline hover:no-underline"
            style={{ color: "var(--color-primary)" }}
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
