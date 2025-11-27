"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { DashboardNavbar } from "../_components/DashboardNavbar";
import {
  Search,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  ExternalLink,
  Book,
  Users,
  Activity,
} from "lucide-react";
import "./support.css";

type TabType = "All" | "Open" | "Transferred" | "Closed";
type SortType = "Last Updated" | "Created Date" | "Priority";

interface SupportCase {
  id: string;
  title: string;
  status: "open" | "closed" | "transferred";
  createdAt: string;
  updatedAt: string;
  priority: "low" | "medium" | "high";
}

// Mock data - replace with real API calls
const mockCases: SupportCase[] = [];

export default function SupportPage() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.authUser);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("All");
  const [sortBy, setSortBy] = useState<SortType>("Last Updated");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [cases, setCases] = useState<SupportCase[]>(mockCases);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      await checkAuth(router as any);
      setIsLoading(false);
    };
    init();
  }, [checkAuth, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs: TabType[] = ["All", "Open", "Transferred", "Closed"];

  // Filter cases based on active tab and search
  const filteredCases = cases.filter((c) => {
    const matchesTab =
      activeTab === "All" || c.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = c.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Sort cases
  const sortedCases = [...filteredCases].sort((a, b) => {
    switch (sortBy) {
      case "Last Updated":
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      case "Created Date":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "Priority":
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      default:
        return 0;
    }
  });

  const handleContactSupport = () => {
    // Open support form or redirect to support portal
    window.open("mailto:support@codehealth.ai", "_blank");
  };

  if (isLoading) {
    return (
      <div className="vercel-dashboard">
        <DashboardNavbar />
        <div className="support-loading">
          <div className="support-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="vercel-dashboard">
      <DashboardNavbar />
      <div className="support-page">
        <div className="support-container">
          {/* Header */}
          <div className="support-header">
            <div className="support-header-content">
              <h1>Support Center</h1>
              <p>
                Create and view support cases for your projects.{" "}
                <a
                  href="https://docs.codehealth.ai/support"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more
                  <ExternalLink className="external-icon" />
                </a>
              </p>
            </div>
            <button
              className="contact-support-btn"
              onClick={handleContactSupport}
            >
              <MessageCircle className="btn-icon" />
              Contact Support
            </button>
          </div>

          {/* Search and Filters */}
          <div className="support-filters">
            {/* Search */}
            <div className="support-search">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Tabs */}
            <div className="support-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`support-tab ${activeTab === tab ? "active" : ""}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="support-sort" ref={sortRef}>
              <button
                className="support-sort-btn"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
              >
                Sort by {sortBy}
                <ChevronDown className="chevron-icon" />
              </button>
              {showSortDropdown && (
                <div className="support-dropdown">
                  {(
                    ["Last Updated", "Created Date", "Priority"] as SortType[]
                  ).map((option) => (
                    <button
                      key={option}
                      className={`support-dropdown-item ${
                        sortBy === option ? "active" : ""
                      }`}
                      onClick={() => {
                        setSortBy(option);
                        setShowSortDropdown(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cases List */}
          <div className="support-cases">
            {sortedCases.length === 0 ? (
              /* Empty State */
              <div className="support-empty">
                <div className="support-empty-icon">
                  <HelpCircle />
                </div>
                <h3>No support cases yet</h3>
                <p>When you create a support case, it will appear here.</p>
                <button
                  className="support-empty-btn"
                  onClick={handleContactSupport}
                >
                  <MessageCircle className="btn-icon" />
                  Create a Case
                </button>
              </div>
            ) : (
              /* Cases List */
              sortedCases.map((supportCase) => (
                <div key={supportCase.id} className="support-case-item">
                  <div className="support-case-info">
                    <span className="support-case-title">
                      {supportCase.title}
                    </span>
                    <span className="support-case-meta">
                      Updated{" "}
                      {new Date(supportCase.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`support-case-status ${supportCase.status}`}>
                    {supportCase.status.charAt(0).toUpperCase() +
                      supportCase.status.slice(1)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Help Resources */}
          <div className="support-resources">
            <h3 className="resources-title">Resources</h3>
            <div className="resources-grid">
              <a
                href="https://docs.codehealth.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="support-resource-card"
              >
                <div className="resource-icon">
                  <Book />
                </div>
                <div className="resource-content">
                  <h4>
                    Documentation
                    <ExternalLink className="external-icon" />
                  </h4>
                  <p>Explore guides, tutorials, and API references</p>
                </div>
              </a>

              <a
                href="https://github.com/codehealth-ai/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="support-resource-card"
              >
                <div className="resource-icon">
                  <Users />
                </div>
                <div className="resource-content">
                  <h4>
                    Community
                    <ExternalLink className="external-icon" />
                  </h4>
                  <p>Join discussions and get help from the community</p>
                </div>
              </a>

              <a
                href="https://status.codehealth.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="support-resource-card"
              >
                <div className="resource-icon">
                  <Activity />
                </div>
                <div className="resource-content">
                  <h4>
                    System Status
                    <ExternalLink className="external-icon" />
                  </h4>
                  <p>Check system status and incident reports</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
