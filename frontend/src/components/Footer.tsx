import { Twitter, Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-fg)] mb-3 sm:mb-4">
              CodeHealth<span className="text-[var(--color-primary)]">AI</span>
            </h3>
            <p className="text-sm sm:text-base text-[var(--color-fg-secondary)] mb-4 sm:mb-6 max-w-md">
              Empowering developers with AI-driven code analysis and health
              monitoring to build better software, faster.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-[var(--color-fg-secondary)] hover:text-[var(--color-primary)] transition-colors"
              >
                <span className="sr-only">Twitter</span>
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-[var(--color-fg-secondary)] hover:text-[var(--color-primary)] transition-colors"
              >
                <span className="sr-only">GitHub</span>
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-[var(--color-fg-secondary)] hover:text-[var(--color-primary)] transition-colors"
              >
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-[var(--color-fg)] mb-3 sm:mb-4">
              Product
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors"
                >
                  Integrations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors"
                >
                  API
                </a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-[var(--color-fg)] mb-3 sm:mb-4">
              Support
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm sm:text-base text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors"
                >
                  Status
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-xs sm:text-sm text-[var(--color-fg-secondary)] text-center sm:text-left">
              © 2024 CodeHealth AI. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-end space-x-4 sm:space-x-6">
              <a
                href="#"
                className="text-xs sm:text-sm text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-xs sm:text-sm text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-xs sm:text-sm text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)] transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
