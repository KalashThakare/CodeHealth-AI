import { Twitter, Github, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer
      id="contact"
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div className="landing-container py-12 sm:py-16">
        <div className="text-center mb-12">
          <h3
            className="text-2xl sm:text-3xl font-bold mb-4"
            style={{ color: "var(--color-fg)" }}
          >
            Get in Touch
          </h3>
          <p
            className="text-base max-w-md mx-auto mb-6"
            style={{ color: "var(--color-fg-secondary)" }}
          >
            Have questions or feedback? We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <a
              href="mailto:contact@codehealthai.com"
              className="flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{ color: "var(--color-fg-secondary)", textDecoration: "none" }}
            >
              <Mail className="w-4 h-4" />
              <span>contact@codehealthai.com</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{ color: "var(--color-fg-secondary)", textDecoration: "none" }}
            >
              <Github className="w-4 h-4" />
              <span>github.com/codehealthai</span>
            </a>
          </div>
        </div>

        <div
          className="pt-8 mb-8"
          style={{ borderTop: "1px solid var(--color-border)" }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-2">
            <h3
              className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4"
              style={{ color: "var(--color-fg)" }}
            >
              CodeHealth
              <span style={{ color: "var(--color-primary)" }}>AI</span>
            </h3>
            <p
              className="text-sm sm:text-base mb-4 sm:mb-6 max-w-md"
              style={{ color: "var(--color-fg-secondary)" }}
            >
              Free AI-powered code analysis for GitHub repositories. Understand
              your code health and get actionable recommendations to improve
              quality.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
                style={{
                  border: "1px solid var(--color-border)",
                  color: "var(--color-fg-secondary)",
                  textDecoration: "none",
                }}
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
                style={{
                  border: "1px solid var(--color-border)",
                  color: "var(--color-fg-secondary)",
                  textDecoration: "none",
                }}
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
                style={{
                  border: "1px solid var(--color-border)",
                  color: "var(--color-fg-secondary)",
                  textDecoration: "none",
                }}
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: "var(--color-fg)" }}
            >
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#features"
                  className="text-sm transition-opacity hover:opacity-70"
                  style={{ color: "var(--color-fg-secondary)", textDecoration: "none" }}
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-sm transition-opacity hover:opacity-70"
                  style={{ color: "var(--color-fg-secondary)", textDecoration: "none" }}
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm transition-opacity hover:opacity-70"
                  style={{ color: "var(--color-fg-secondary)", textDecoration: "none" }}
                >
                  GitHub Integration
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm transition-opacity hover:opacity-70"
                  style={{ color: "var(--color-fg-secondary)", textDecoration: "none" }}
                >
                  API Documentation
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: "var(--color-fg)" }}
            >
              Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm transition-opacity hover:opacity-70"
                  style={{ color: "var(--color-fg-secondary)", textDecoration: "none" }}
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm transition-opacity hover:opacity-70"
                  style={{ color: "var(--color-fg-secondary)", textDecoration: "none" }}
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm transition-opacity hover:opacity-70"
                  style={{ color: "var(--color-fg-secondary)", textDecoration: "none" }}
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm transition-opacity hover:opacity-70"
                  style={{ color: "var(--color-fg-secondary)", textDecoration: "none" }}
                >
                  Status
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-12 pt-8"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p
              className="text-xs text-center sm:text-left"
              style={{ color: "var(--color-fg-secondary)" }}
            >
              © {new Date().getFullYear()} CodeHealth AI. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-end space-x-4 sm:space-x-6">
              <a
                href="#"
                className="text-xs transition-opacity hover:opacity-70"
                style={{ color: "var(--color-fg-secondary)", textDecoration: "none" }}
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-xs transition-opacity hover:opacity-70"
                style={{ color: "var(--color-fg-secondary)", textDecoration: "none" }}
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
