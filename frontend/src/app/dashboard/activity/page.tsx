"use client";

import { useEffect, useState, useRef } from "react";
import { useActivityStore, ParsedActivity } from "@/store/activityStore";
import {
  Activity,
  Search,
  Calendar,
  RefreshCw,
  GitCommit,
  Users,
  Zap,
  Shield,
  User,
  Clock,
  ChevronDown,
  Check,
  LayoutGrid,
  AlertCircle,
} from "lucide-react";
import "./activity.css";

const TIME_FILTERS = [
  { label: "All Time", value: "all" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
];

const TYPE_FILTERS = [
  { label: "All Types", value: "all" },
  { label: "Repository", value: "repo" },
  { label: "Analysis", value: "analysis" },
  { label: "Teams", value: "team" },
  { label: "Security", value: "security" },
  { label: "Account", value: "account" },
];

export default function ActivityPage() {
  const {
    activities,
    loading,
    error,
    fetchActivities,
    getStats,
    getGroupedActivities,
  } = useActivityStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchActivities();

    const handleClickOutside = (event: MouseEvent) => {
      if (
        timeDropdownRef.current &&
        !timeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTimeDropdown(false);
      }
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTypeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [fetchActivities]);

  const handleRefresh = () => {
    fetchActivities();
  };

  const stats = getStats();
  const groupedActivities = getGroupedActivities({
    search: searchQuery,
    type: typeFilter,
    timeRange: timeFilter,
  });

  const getIconForType = (type: string) => {
    if (type.includes("repo")) return <GitCommit className="w-4 h-4" />;
    if (type.includes("analysis") || type.includes("scan"))
      return <Zap className="w-4 h-4" />;
    if (type.includes("team") || type.includes("member"))
      return <Users className="w-4 h-4" />;
    if (type.includes("security") || type.includes("alert"))
      return <Shield className="w-4 h-4" />;
    if (
      type.includes("login") ||
      type.includes("logout") ||
      type.includes("profile") ||
      type.includes("settings")
    )
      return <User className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getIconClass = (type: string) => {
    if (type.includes("repo")) return "repo";
    if (type.includes("analysis") || type.includes("scan")) return "analysis";
    if (type.includes("team") || type.includes("member")) return "team";
    if (type.includes("security") || type.includes("alert")) return "security";
    return "account";
  };

  const renderActivityDescription = (activity: ParsedActivity) => {
    const { description, metadata } = activity;

    if (metadata?.repoName) {
      return (
        <span>
          {activity.action}{" "}
          <span className="highlight-tag blue">{metadata.repoName}</span>
          {metadata.branch && (
            <>
              {" "}
              on branch{" "}
              <span className="highlight-tag purple">{metadata.branch}</span>
            </>
          )}
          {metadata.score && (
            <>
              {" "}
              - Score:{" "}
              <span className="highlight-tag green">{metadata.score}</span>
            </>
          )}
        </span>
      );
    }

    if (metadata?.teamName) {
      return (
        <span>
          {activity.action}{" "}
          <span className="highlight-tag purple">{metadata.teamName}</span>
          {metadata.memberName && (
            <>
              {" "}
              -{" "}
              <span className="highlight-tag blue">{metadata.memberName}</span>
            </>
          )}
        </span>
      );
    }

    return description;
  };

  const LoadingSkeleton = () => (
    <div className="activity-list">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-icon" />
          <div className="skeleton-content">
            <div className="skeleton-line medium" />
            <div className="skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="activity-page">
      <div className="activity-container">
        <div className="activity-header">
          <div className="activity-header-content">
            <div className="activity-icon-wrapper">
              <Activity className="w-6 h-6 text-[var(--color-fg)]" />
            </div>
            <div className="activity-header-text">
              <h1>Activity</h1>
              <p>Track all your actions and events</p>
            </div>
          </div>
        </div>

        <div className="activity-stats">
          <div className="stat-card">
            <div className="stat-icon blue">
              <Activity className="w-5 h-5" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">
              <Zap className="w-5 h-5" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.today}</span>
              <span className="stat-label">Today</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.thisWeek}</span>
              <span className="stat-label">This Week</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.thisMonth}</span>
              <span className="stat-label">This Month</span>
            </div>
          </div>
        </div>

        <div className="activity-controls">
          <div className="search-container">
            <div className="search-icon-wrapper">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search activities..."
              className="!search-input !h-full !w-full text-center !m-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-dropdown" ref={timeDropdownRef}>
            <button
              className="filter-btn"
              onClick={() => {
                setShowTimeDropdown(!showTimeDropdown);
                setShowTypeDropdown(false);
              }}
            >
              <Calendar className="w-4 h-4" />
              <span>
                {TIME_FILTERS.find((f) => f.value === timeFilter)?.label}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showTimeDropdown && (
              <div className="dropdown-menu">
                {TIME_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    className={`dropdown-item ${
                      timeFilter === filter.value ? "active" : ""
                    }`}
                    onClick={() => {
                      setTimeFilter(filter.value);
                      setShowTimeDropdown(false);
                    }}
                  >
                    {filter.label}
                    {timeFilter === filter.value && (
                      <Check className="w-3.5 h-3.5" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="filter-dropdown" ref={typeDropdownRef}>
            <button
              className="filter-btn"
              onClick={() => {
                setShowTypeDropdown(!showTypeDropdown);
                setShowTimeDropdown(false);
              }}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>
                {TYPE_FILTERS.find((f) => f.value === typeFilter)?.label}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showTypeDropdown && (
              <div className="dropdown-menu">
                {TYPE_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    className={`dropdown-item ${
                      typeFilter === filter.value ? "active" : ""
                    }`}
                    onClick={() => {
                      setTypeFilter(filter.value);
                      setShowTypeDropdown(false);
                    }}
                  >
                    {filter.label}
                    {typeFilter === filter.value && (
                      <Check className="w-3.5 h-3.5" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className={`refresh-btn ${loading ? "loading" : ""}`}
            onClick={handleRefresh}
            title="Refresh activities"
          >
            <RefreshCw />
          </button>
        </div>

        {loading && activities.length === 0 ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="error-state">
            <AlertCircle className="w-12 h-12" />
            <h3>Failed to load activities</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : Object.keys(groupedActivities).length > 0 ? (
          <div className="activity-list">
            {Object.entries(groupedActivities).map(
              ([month, monthActivities]) => (
                <div key={month} className="activity-month-group">
                  <div className="month-header">
                    <span className="month-title">{month}</span>
                    <span className="month-count">
                      {monthActivities.length} activities
                    </span>
                  </div>
                  {monthActivities.map((activity) => (
                    <div key={activity.id} className="activity-card">
                      <div
                        className={`activity-type-icon ${getIconClass(
                          activity.type
                        )}`}
                      >
                        {getIconForType(activity.type)}
                      </div>
                      <div className="activity-content">
                        <div className="activity-description">
                          {renderActivityDescription(activity)}
                        </div>
                        <div className="activity-meta">
                          <Clock />
                          <span>{activity.formattedDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        ) : (
          <div className="empty-state">
            <div className="flex items-center justify-center gap-3">
              <Activity className="w-12 h-12" />
              <h3>No activities found</h3>
            </div>

            <p>
              {searchQuery || timeFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your filters or search query"
                : "Your recent activity will appear here"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
