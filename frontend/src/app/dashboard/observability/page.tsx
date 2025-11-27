"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { DashboardNavbar } from "../_components/DashboardNavbar";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Search,
  Eye,
  FileCode,
  Zap,
  Shield,
  Database,
  Layers,
  RefreshCw,
  Sparkles,
  Globe,
  ArrowUpRight,
} from "lucide-react";
import "../dashboard.css";

interface MetricCard {
  title: string;
  subtitle: string;
  value: string | number;
  icon: React.ReactNode;
  hasData: boolean;
}

const SidebarItem = ({
  icon,
  label,
  active = false,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
}) => (
  <button
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
      active
        ? "bg-[var(--color-bg-tertiary)] text-[var(--color-fg)]"
        : "text-[var(--color-fg-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-fg)]"
    }`}
  >
    {icon}
    <span>{label}</span>
    {badge && (
      <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-[var(--color-primary)] text-white">
        {badge}
      </span>
    )}
  </button>
);

export default function ObservabilityPage() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.authUser);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const [isLoading, setIsLoading] = useState(true);
  const [environment, setEnvironment] = useState("Production");
  const [timeRange, setTimeRange] = useState("Last 12 hours");
  const [searchTerm, setSearchTerm] = useState("");
  const [showEnvDropdown, setShowEnvDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  useEffect(() => {
    const init = async () => {
      await checkAuth(router as any);
      setIsLoading(false);
    };
    init();
  }, [checkAuth, router]);

  const metricCards: MetricCard[] = [
    {
      title: "Edge Requests",
      subtitle: "Invocations",
      value: "0",
      icon: <Globe className="w-5 h-5" />,
      hasData: false,
    },
    {
      title: "Fast Data Transfer",
      subtitle: "Total",
      value: "–",
      icon: <Zap className="w-5 h-5" />,
      hasData: false,
    },
    {
      title: "Vercel Functions",
      subtitle: "Invocations",
      value: "0",
      icon: <FileCode className="w-5 h-5" />,
      hasData: false,
    },
    {
      title: "Middleware Invocations",
      subtitle: "Invocations",
      value: "0",
      icon: <Layers className="w-5 h-5" />,
      hasData: false,
    },
  ];

  if (isLoading) {
    return (
      <div className="vercel-dashboard">
        <DashboardNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="vercel-dashboard">
      <DashboardNavbar />

      {/* Top Banner */}
      <div
        className="border-b px-6 py-3 flex items-center justify-between"
        style={{
          background: "var(--color-bg)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
          <span className="text-sm" style={{ color: "var(--color-fg)" }}>
            Unlock anomaly alerts, custom queries, 30-day retention, and more
            with Pro and Observability Plus.
          </span>
        </div>
        <button
          className="px-4 py-1.5 text-sm rounded-lg border transition-colors"
          style={{
            background: "var(--color-bg)",
            borderColor: "var(--color-border)",
            color: "var(--color-fg)",
          }}
        >
          Upgrade to Pro
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className="w-64 border-r min-h-[calc(100vh-120px)] p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="space-y-1">
            <SidebarItem
              icon={<BarChart3 className="w-4 h-4" />}
              label="Overview"
              active
            />
            <SidebarItem icon={<Search className="w-4 h-4" />} label="Query" />
            <SidebarItem
              icon={<FileCode className="w-4 h-4" />}
              label="Notebooks"
            />
            <SidebarItem
              icon={<Shield className="w-4 h-4" />}
              label="Alerts"
              badge="Beta"
            />
          </div>

          <div className="mt-6">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2 px-3"
              style={{ color: "var(--color-fg-secondary)" }}
            >
              Compute
            </p>
            <div className="space-y-1">
              <SidebarItem
                icon={<FileCode className="w-4 h-4" />}
                label="Functions"
              />
              <SidebarItem
                icon={<Globe className="w-4 h-4" />}
                label="External APIs"
              />
              <SidebarItem
                icon={<Layers className="w-4 h-4" />}
                label="Middleware"
              />
              <SidebarItem
                icon={<RefreshCw className="w-4 h-4" />}
                label="Workflows"
                badge="Beta"
              />
            </div>
          </div>

          <div className="mt-6">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2 px-3"
              style={{ color: "var(--color-fg-secondary)" }}
            >
              CDN
            </p>
            <div className="space-y-1">
              <SidebarItem
                icon={<Globe className="w-4 h-4" />}
                label="Edge Requests"
              />
              <SidebarItem
                icon={<Zap className="w-4 h-4" />}
                label="Fast Data Transfer"
              />
              <SidebarItem
                icon={<Database className="w-4 h-4" />}
                label="Image Optimization"
              />
              <SidebarItem
                icon={<RefreshCw className="w-4 h-4" />}
                label="ISR"
              />
              <SidebarItem
                icon={<ArrowUpRight className="w-4 h-4" />}
                label="External Rewrites"
              />
              <SidebarItem
                icon={<Layers className="w-4 h-4" />}
                label="Microfrontends"
              />
            </div>
          </div>

          <div className="mt-6">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2 px-3"
              style={{ color: "var(--color-fg-secondary)" }}
            >
              Services
            </p>
            <div className="space-y-1">
              <SidebarItem icon={<Sparkles className="w-4 h-4" />} label="AI" />
              <SidebarItem
                icon={<Database className="w-4 h-4" />}
                label="Blob"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <h1
              className="text-xl font-semibold"
              style={{ color: "var(--color-fg)" }}
            >
              Observability
            </h1>
            <div className="flex items-center gap-3">
              {/* Environment Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowEnvDropdown(!showEnvDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all"
                  style={{
                    background: "var(--color-bg-secondary)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-fg)",
                  }}
                >
                  <span className="text-sm">{environment}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showEnvDropdown && (
                  <div
                    className="absolute top-full mt-2 right-0 w-40 rounded-lg border shadow-lg z-50"
                    style={{
                      background: "var(--color-bg)",
                      borderColor: "var(--color-border)",
                    }}
                  >
                    {["Production", "Preview", "Development"].map((env) => (
                      <button
                        key={env}
                        onClick={() => {
                          setEnvironment(env);
                          setShowEnvDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-bg-secondary)] transition-colors"
                        style={{ color: "var(--color-fg)" }}
                      >
                        {env}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Time Range Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all"
                  style={{
                    background: "var(--color-bg-secondary)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-fg)",
                  }}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{timeRange}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showTimeDropdown && (
                  <div
                    className="absolute top-full mt-2 right-0 w-48 rounded-lg border shadow-lg z-50"
                    style={{
                      background: "var(--color-bg)",
                      borderColor: "var(--color-border)",
                    }}
                  >
                    {[
                      "Last 1 hour",
                      "Last 6 hours",
                      "Last 12 hours",
                      "Last 24 hours",
                      "Last 7 days",
                    ].map((range) => (
                      <button
                        key={range}
                        onClick={() => {
                          setTimeRange(range);
                          setShowTimeDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-bg-secondary)] transition-colors"
                        style={{ color: "var(--color-fg)" }}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {metricCards.map((card, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border cursor-pointer hover:border-[var(--color-fg-secondary)] transition-colors"
                style={{
                  background: "var(--color-bg-secondary)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className="text-sm font-medium"
                    style={{ color: "var(--color-fg)" }}
                  >
                    {card.title}
                  </h3>
                  <ChevronRight
                    className="w-4 h-4"
                    style={{ color: "var(--color-fg-secondary)" }}
                  />
                </div>
                <p
                  className="text-xs mb-1"
                  style={{ color: "var(--color-fg-secondary)" }}
                >
                  {card.subtitle}
                </p>
                <p
                  className="text-2xl font-semibold"
                  style={{ color: "var(--color-fg)" }}
                >
                  {card.value}
                </p>
                <div className="mt-4 h-16 flex items-center justify-center">
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-fg-secondary)" }}
                  >
                    {card.hasData
                      ? "Chart placeholder"
                      : "No invocations in this time range"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Projects Table */}
          <div
            className="rounded-lg border"
            style={{
              background: "var(--color-bg)",
              borderColor: "var(--color-border)",
            }}
          >
            {/* Search */}
            <div
              className="p-4 border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--color-fg-secondary)" }}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm"
                  style={{
                    background: "var(--color-bg-secondary)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-fg)",
                  }}
                />
              </div>
            </div>

            {/* Table Header */}
            <div
              className="grid grid-cols-2 px-4 py-3 border-b text-sm"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-fg-secondary)",
              }}
            >
              <span>Project</span>
              <span className="text-right">Requests</span>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-16">
              <BarChart3
                className="w-10 h-10 mb-4"
                style={{ color: "var(--color-fg-secondary)" }}
              />
              <h3
                className="text-base font-medium mb-2"
                style={{ color: "var(--color-fg)" }}
              >
                No data found
              </h3>
              <p
                className="text-sm"
                style={{ color: "var(--color-fg-secondary)" }}
              >
                No results found for the selected time period
              </p>
            </div>

            {/* Pagination */}
            <div
              className="flex items-center justify-between px-4 py-3 border-t"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-sm"
                  style={{ color: "var(--color-fg-secondary)" }}
                >
                  Show 10
                </span>
                <ChevronDown
                  className="w-4 h-4"
                  style={{ color: "var(--color-fg-secondary)" }}
                />
              </div>
              <span
                className="text-sm"
                style={{ color: "var(--color-fg-secondary)" }}
              >
                1 of 1
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
