"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  ExternalLink,
  Book,
  Users,
  Activity,
  Loader2,
  Trash2,
  Plus,
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useSupportStore, SupportCase } from "@/store/supportStore";
import "./support.css";

type TabType = "All" | "Open" | "Closed";
type SortType = "Last Updated" | "Created Date";

export default function SupportClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("All");
  const [sortBy, setSortBy] = useState<SortType>("Last Updated");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<SupportCase | null>(null);
  const [newCaseProblem, setNewCaseProblem] = useState("");
  const sortRef = useRef<HTMLDivElement>(null);
  const createModalRef = useRef<HTMLDivElement>(null);
  const detailModalRef = useRef<HTMLDivElement>(null);

  const { cases, isLoading, fetchCases, createCase, deleteCase } =
    useSupportStore();

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
      if (
        createModalRef.current &&
        !createModalRef.current.contains(event.target as Node)
      ) {
        setShowCreateModal(false);
      }
      if (
        detailModalRef.current &&
        !detailModalRef.current.contains(event.target as Node)
      ) {
        setShowDetailModal(false);
        setSelectedCase(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs: TabType[] = ["All", "Open", "Closed"];

  const filteredCases = cases.filter((c) => {
    const matchesTab =
      activeTab === "All" || c.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = c.problem
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

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
      default:
        return 0;
    }
  });

  const handleCreateCase = async () => {
    if (!newCaseProblem.trim()) return;

    const caseId = await createCase(newCaseProblem.trim());
    if (caseId) {
      setNewCaseProblem("");
      setShowCreateModal(false);
    }
  };

  const handleDeleteCase = async (caseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this support case?")) {
      await deleteCase(caseId);
    }
  };

  const handleCaseClick = (supportCase: SupportCase) => {
    setSelectedCase(supportCase);
    setShowDetailModal(true);
  };

  const handleContactSupport = () => {
    setShowCreateModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="support-page">
      <div className="support-container">
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
            <Plus className="btn-icon" />
            Create Case
          </button>
        </div>

        <div className="support-filters">
          <div className="support-search">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

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
                {(["Last Updated", "Created Date"] as SortType[]).map(
                  (option) => (
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
                  )
                )}
              </div>
            )}
          </div>
        </div>

        <div className="support-cases">
          {isLoading ? (
            <div className="support-loading">
              <Loader2 className="loading-spinner" />
              <p>Loading cases...</p>
            </div>
          ) : sortedCases.length === 0 ? (
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
            sortedCases.map((supportCase) => (
              <div
                key={supportCase.id}
                className="support-case-item"
                onClick={() => handleCaseClick(supportCase)}
              >
                <div className="support-case-info">
                  <span className="support-case-title">
                    Case #{supportCase.caseId}
                  </span>
                  <span className="support-case-description">
                    {truncateText(supportCase.problem, 80)}
                  </span>
                  <span className="support-case-meta">
                    Created {formatDate(supportCase.createdAt)}
                  </span>
                </div>
                <div className="support-case-actions">
                  <span className={`support-case-status ${supportCase.status}`}>
                    {supportCase.status.charAt(0).toUpperCase() +
                      supportCase.status.slice(1)}
                  </span>
                  <button
                    className="support-case-delete"
                    onClick={(e) => handleDeleteCase(supportCase.caseId, e)}
                    title="Delete case"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {showCreateModal && (
          <div className="support-modal-overlay">
            <div className="support-modal" ref={createModalRef}>
              <h3>Create Support Case</h3>
              <p>
                Describe your issue and we'll get back to you as soon as
                possible.
              </p>
              <textarea
                className="support-modal-textarea"
                placeholder="Describe your problem..."
                value={newCaseProblem}
                onChange={(e) => setNewCaseProblem(e.target.value)}
                rows={5}
              />
              <div className="support-modal-actions">
                <button
                  className="support-modal-cancel"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewCaseProblem("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="support-modal-submit"
                  onClick={handleCreateCase}
                  disabled={!newCaseProblem.trim() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="loading-spinner" size={16} />
                      Creating...
                    </>
                  ) : (
                    "Create Case"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDetailModal && selectedCase && (
          <div className="support-modal-overlay">
            <div className="support-detail-modal" ref={detailModalRef}>
              <div className="detail-modal-header">
                <div className="detail-modal-title">
                  <h3>Case #{selectedCase.caseId}</h3>
                  <span
                    className={`support-case-status ${selectedCase.status}`}
                  >
                    {selectedCase.status.charAt(0).toUpperCase() +
                      selectedCase.status.slice(1)}
                  </span>
                </div>
                <button
                  className="detail-modal-close"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedCase(null);
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="detail-modal-content">
                <div className="detail-section">
                  <div className="detail-label">
                    <AlertCircle size={16} />
                    Problem Description
                  </div>
                  <div className="detail-value detail-description">
                    {selectedCase.problem}
                  </div>
                </div>

                <div className="detail-grid">
                  <div className="detail-section">
                    <div className="detail-label">
                      <Calendar size={16} />
                      Date Created
                    </div>
                    <div className="detail-value">
                      {formatDateTime(selectedCase.createdAt)}
                    </div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-label">
                      <Clock size={16} />
                      Last Updated
                    </div>
                    <div className="detail-value">
                      {formatDateTime(selectedCase.updatedAt)}
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <div className="detail-label">
                    {selectedCase.status === "open" ? (
                      <AlertCircle size={16} />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    Current Status
                  </div>
                  <div className="detail-value">
                    {selectedCase.status === "open" ? (
                      <span className="status-text open">
                        This case is currently open and under review.
                      </span>
                    ) : (
                      <span className="status-text closed">
                        This case has been resolved and closed.
                      </span>
                    )}
                  </div>
                </div>

                {selectedCase.status === "closed" && (
                  <div className="detail-section">
                    <div className="detail-label">
                      <CheckCircle2 size={16} />
                      Resolution
                    </div>
                    <div className="detail-value detail-resolution">
                      {selectedCase.resolution ||
                        "The issue has been resolved. If you have any further questions, please create a new support case."}
                    </div>
                  </div>
                )}
              </div>

              <div className="detail-modal-footer">
                <button
                  className="support-modal-cancel"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedCase(null);
                  }}
                >
                  Close
                </button>
                <button
                  className="detail-delete-btn"
                  onClick={(e) => {
                    handleDeleteCase(selectedCase.caseId, e);
                    setShowDetailModal(false);
                    setSelectedCase(null);
                  }}
                >
                  <Trash2 size={16} />
                  Delete Case
                </button>
              </div>
            </div>
          </div>
        )}

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
  );
}
