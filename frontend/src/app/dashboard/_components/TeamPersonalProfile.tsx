"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Plus, Check, Github } from "lucide-react";
import { useGitHubStore } from "@/store/githubStore";
import "./profile.css";

interface Team {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  avatar?: string;
}

interface TeamPersonalProfileProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const TeamPersonalProfile: React.FC<TeamPersonalProfileProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // GitHub Store
  const {
    repositories,
    githubUser,
    isLoading,
    fetchGitHubRepos,
    selectRepository,
    selectedRepo,
  } = useGitHubStore();

  // Mock teams data
  const teams: Team[] = [
    {
      id: "1",
      name: "Jayesh Rajbhar's projects",
      type: "Hobby",
      isActive: true,
    },
    {
      id: "2",
      name: "Company Projects",
      type: "Professional",
      isActive: false,
    },
  ];

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(teamSearchQuery.toLowerCase())
  );

  const filteredProjects = repositories.filter((repo) =>
    repo.repoName.toLowerCase().includes(projectSearchQuery.toLowerCase())
  );

  // Generate avatar letter from team name
  const getAvatarLetter = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // Generate gradient colors based on team name
  const getAvatarGradient = (name: string) => {
    const colors = [
      "from-blue-500 to-purple-600",
      "from-green-500 to-teal-600",
      "from-orange-500 to-red-600",
      "from-pink-500 to-purple-600",
      "from-indigo-500 to-blue-600",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, setIsOpen]);

  // Fetch repos when component mounts
  useEffect(() => {
    if (repositories.length === 0) {
      fetchGitHubRepos();
    }
  }, []);

  // Prevent event bubbling on dropdown content
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

      {/* Centered Modal */}
      <div className="fixed inset-0 z-50 p-4">
        <div
          ref={dropdownRef}
          className="w-fit max-w-4xl mx-auto rounded-2xl border shadow-2xl overflow-hidden"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow)",
            maxHeight: "60vh",
          }}
          onClick={handleDropdownClick}
        >
          {/* Responsive Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 ">
            {/* Left Panel - Teams */}
            <div
              className="flex flex-col border-r md:border-r border-b md:border-b-0"
              style={{ borderColor: "var(--color-border)" }}
            >
              {/* Search Teams */}
              <div
                className="px-4 py-3 border-b flex-shrink-0"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="flex items-center space-x-3">
                  <Search
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "var(--color-fg-secondary)" }}
                  />
                  <input
                    type="text"
                    placeholder="Find Team..."
                    value={teamSearchQuery}
                    onChange={(e) => setTeamSearchQuery(e.target.value)}
                    className="input flex-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Teams Section */}
              <div className="flex-1 p-4 overflow-y-auto">
                <h4
                  className="text-xs font-semibold uppercase tracking-wider mb-4"
                  style={{ color: "var(--color-fg-secondary)" }}
                >
                  Teams
                </h4>

                {/* Team List */}
                <div className="space-y-2 mb-4">
                  {filteredTeams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-3 rounded-md transition-colors duration-200 cursor-pointer"
                      style={{
                        backgroundColor: team.isActive
                          ? "var(--color-bg-secondary)"
                          : "transparent",
                      }}
                      onMouseEnter={(e) =>
                        !team.isActive &&
                        (e.currentTarget.style.backgroundColor =
                          "var(--color-bg-tertiary)")
                      }
                      onMouseLeave={(e) =>
                        !team.isActive &&
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div
                          className={`w-6 h-6 bg-gradient-to-br ${getAvatarGradient(
                            team.name
                          )} rounded-full flex items-center justify-center flex-shrink-0`}
                        >
                          <span className="text-white font-bold text-xs">
                            {getAvatarLetter(team.name)}
                          </span>
                        </div>
                        <div
                          className="text-sm font-medium truncate"
                          style={{ color: "var(--color-fg)" }}
                        >
                          {team.name}
                        </div>
                      </div>
                      {team.isActive && (
                        <Check
                          className="w-4 h-4 flex-shrink-0 ml-2"
                          style={{ color: "var(--color-primary)" }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Create Team Button */}
                <button
                  className="flex items-center space-x-3 px-3 py-2 w-full rounded-md transition-colors duration-200"
                  style={{
                    color: "var(--color-primary)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--color-bg-secondary)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  onClick={(e) => e.stopPropagation()}
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Create Team</span>
                </button>
              </div>
            </div>

            {/* Right Panel - Projects (Hidden below md) */}
            <div
              className="hidden md:flex flex-col"
              style={{ backgroundColor: "var(--color-bg)" }}
            >
              {/* Search Projects */}
              <div
                className="px-4 py-3 border-b flex-shrink-0"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="flex items-center space-x-3">
                  <Search
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "var(--color-fg-secondary)" }}
                  />
                  <input
                    type="text"
                    placeholder="Find Project..."
                    value={projectSearchQuery}
                    onChange={(e) => setProjectSearchQuery(e.target.value)}
                    className="input flex-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Projects Section */}
              <div className="flex-1 p-4 overflow-y-auto">
                <h4
                  className="text-xs font-semibold uppercase tracking-wider mb-4"
                  style={{ color: "var(--color-fg-secondary)" }}
                >
                  Projects ({repositories.length})
                </h4>

                {/* Loading State */}
                {isLoading && (
                  <div className="flex items-center justify-center h-32">
                    <div
                      className="animate-spin rounded-full h-8 w-8 border-b-2"
                      style={{ borderColor: "var(--color-primary)" }}
                    ></div>
                  </div>
                )}

                {/* Projects List */}
                {!isLoading && filteredProjects.length > 0 && (
                  <div className="space-y-2">
                    {filteredProjects.map((repo) => (
                      <div
                        key={repo.id}
                        className="flex items-center justify-between p-3 rounded-md transition-colors duration-200 cursor-pointer border"
                        style={{
                          backgroundColor:
                            selectedRepo?.id === repo.id
                              ? "var(--color-bg-secondary)"
                              : "transparent",
                          borderColor: "var(--color-border)",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectRepository(repo);
                        }}
                        onMouseEnter={(e) =>
                          selectedRepo?.id !== repo.id &&
                          (e.currentTarget.style.backgroundColor =
                            "var(--color-bg-tertiary)")
                        }
                        onMouseLeave={(e) =>
                          selectedRepo?.id !== repo.id &&
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <Github
                            className="w-4 h-4 flex-shrink-0"
                            style={{ color: "var(--color-fg-secondary)" }}
                          />
                          <div className="min-w-0 flex-1">
                            <div
                              className="text-sm font-medium truncate"
                              style={{ color: "var(--color-fg)" }}
                            >
                              {repo.repoName}
                            </div>
                            <div
                              className="text-xs truncate"
                              style={{ color: "var(--color-fg-secondary)" }}
                            >
                              Updated {formatDate(repo.updatedAt)}
                            </div>
                          </div>
                        </div>
                        {selectedRepo?.id === repo.id && (
                          <Check
                            className="w-4 h-4 flex-shrink-0"
                            style={{ color: "var(--color-primary)" }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* No Projects State */}
                {!isLoading &&
                  filteredProjects.length === 0 &&
                  repositories.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <div
                        className="text-lg font-bold mb-2"
                        style={{ color: "var(--color-fg)" }}
                      >
                        No projects, yet!
                      </div>
                      <div
                        className="text-sm mb-4"
                        style={{ color: "var(--color-fg-secondary)" }}
                      >
                        {githubUser
                          ? "Connect GitHub repos to see your projects."
                          : "This team has no projects."}
                      </div>
                      <button
                        className="flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 hover:opacity-90"
                        style={{
                          backgroundColor: "var(--color-primary)",
                          color: "white",
                          border: "1px solid var(--color-primary)",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open("https://github.com/new", "_blank");
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Create Project
                        </span>
                      </button>
                    </div>
                  )}

                {/* No Search Results */}
                {!isLoading &&
                  filteredProjects.length === 0 &&
                  repositories.length > 0 &&
                  projectSearchQuery && (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <div
                        className="text-sm font-medium mb-2"
                        style={{ color: "var(--color-fg)" }}
                      >
                        No projects found
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--color-fg-secondary)" }}
                      >
                        Try adjusting your search term
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamPersonalProfile;