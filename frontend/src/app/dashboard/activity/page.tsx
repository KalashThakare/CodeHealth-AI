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
  ChevronDown,
  Check,
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
  { label: "All Types", value: "all", icon: Activity },
  { label: "Repository", value: "repo", icon: GitCommit },
  { label: "Analysis", value: "analysis", icon: Zap },
  { label: "Teams", value: "team", icon: Users },
  { label: "Security", value: "security", icon: Shield },
  { label: "Account", value: "account", icon: User },
];

export default function ActivityPage() {
  const { activities, loading, error, fetchActivities, getGroupedActivities } =
    useActivityStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const timeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchActivities();

    const handleClickOutside = (event: MouseEvent) => {
      if (
        timeDropdownRef.current &&
        !timeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTimeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [fetchActivities]);

  const handleRefresh = () => {
    fetchActivities();
  };

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

  const renderActivityDescription = (activity: ParsedActivity) => {
    const { description } = activity;

    return <span className="activity-text">{description}</span>;
  };

  const LoadingSkeleton = () => (
    <div className="activity-list">
      <div className="activity-month-group">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton-item">
            <div className="skeleton-avatar" />
            <div className="skeleton-content">
              <div className="skeleton-line long" />
              <div className="skeleton-line short" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="activity-page">
      <div className="activity-container">
        <div className="activity-header">
          <div className="activity-header-row">
            <h1>Activity</h1>
            <button
              className={`refresh-btn ${loading ? "loading" : ""}`}
              onClick={handleRefresh}
              title="Refresh"
              type="button"
            >
              <RefreshCw size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="activity-main">
          <aside className="activity-sidebar">
            <div className="filter-section">
              <span className="filter-section-title">Filters</span>
              <div className="filter-dropdown" ref={timeDropdownRef}>
                <button
                  className="filter-btn"
                  onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                  type="button"
                >
                  <div className="filter-btn-content">
                    <Calendar />
                    <span>
                      {TIME_FILTERS.find((f) => f.value === timeFilter)?.label}
                    </span>
                  </div>
                  <ChevronDown />
                </button>
                {showTimeDropdown && (
                  <div className="dropdown-menu">
                    {TIME_FILTERS.map((filter) => (
                      <button
                        key={filter.value}
                        type="button"
                        className={`dropdown-item ${
                          timeFilter === filter.value ? "active" : ""
                        }`}
                        onClick={() => {
                          setTimeFilter(filter.value);
                          setShowTimeDropdown(false);
                        }}
                      >
                        {filter.label}
                        {timeFilter === filter.value && <Check />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="filter-section">
              <span className="filter-section-title">Type</span>
              <div className="filter-type-list">
                {TYPE_FILTERS.map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <button
                      key={filter.value}
                      type="button"
                      className={`filter-type-btn ${
                        typeFilter === filter.value ? "active" : ""
                      }`}
                      onClick={() => setTypeFilter(filter.value)}
                    >
                      <Icon />
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="activity-content-area">
            <div className="search-container">
              <div className="search-input-wrapper">
                <div className="search-icon">
                  <Search />
                </div>
                <input
                  type="text"
                  placeholder="Find..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {loading && activities.length === 0 ? (
              <LoadingSkeleton />
            ) : error ? (
              <div className="error-state">
                <AlertCircle />
                <h3>Failed to load activities</h3>
                <p>{error}</p>
                <button
                  className="retry-btn"
                  onClick={handleRefresh}
                  type="button"
                >
                  <RefreshCw />
                  Try Again
                </button>
              </div>
            ) : Object.keys(groupedActivities).length > 0 ? (
              <div className={`activity-list ${loading ? "refreshing" : ""}`}>
                {Object.entries(groupedActivities).map(
                  ([month, monthActivities]) => (
                    <div key={month} className="activity-month-group">
                      <div className="month-header">
                        <span className="month-title">{month}</span>
                      </div>
                      {monthActivities.map((activity) => (
                        <div key={activity.id} className="activity-item">
                          <div className="activity-avatar">
                            {getIconForType(activity.type)}
                          </div>
                          <div className="activity-details">
                            <div className="activity-main-row">
                              {renderActivityDescription(activity)}
                              <span className="activity-date">
                                {activity.formattedDate}
                              </span>
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
                <Activity />
                <h3>No activities found</h3>
                <p>
                  {searchQuery || timeFilter !== "all" || typeFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Your activity will appear here"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
