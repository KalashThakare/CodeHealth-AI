"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Plus,
  Check,
  Github,
  HomeIcon,
  Import,
  Download,
} from "lucide-react";
import { useGitHubStore } from "@/store/githubStore";
import { useAuthStore } from "@/store/authStore";
import "./profile.css";
import { useRouter } from "next/navigation";
import Home from "@/app/page";

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
  const projectsScrollRef = useRef<HTMLDivElement>(null);

  const { authUser } = useAuthStore();
  const { logout } = useAuthStore();

  const {
    repositories,
    githubUser,
    isLoading,
    fetchGitHubRepos,
    selectRepository,
    selectedRepo,
    githubAppRedirect,
  } = useGitHubStore();

  const router = useRouter();

  const userName = authUser?.name?.split(" ")?.[0] || "Your";
  const teams: Team[] = [
    {
      id: "1",
      name: `${userName}'s projects`,
      type: "Hobby",
      isActive: true,
    },
  ];

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(teamSearchQuery.toLowerCase())
  );

  const filteredProjects = repositories.filter((repo) =>
    repo.repoName.toLowerCase().includes(projectSearchQuery.toLowerCase())
  );

  const getAvatarLetter = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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

  useEffect(() => {
    if (repositories.length === 0) {
      fetchGitHubRepos();
    }
  }, []);

  useEffect(() => {
    const projectsScroll = projectsScrollRef.current;

    const handleWheel = (e: WheelEvent) => {
      const element = e.currentTarget as HTMLDivElement;
      const isScrollable = element.scrollHeight > element.clientHeight;

      if (isScrollable) {
        const isAtTop = element.scrollTop === 0;
        const isAtBottom =
          element.scrollTop + element.clientHeight >= element.scrollHeight - 1;

        if ((e.deltaY < 0 && !isAtTop) || (e.deltaY > 0 && !isAtBottom)) {
          e.stopPropagation();
        }
      }
    };

    if (projectsScroll) {
      projectsScroll.addEventListener("wheel", handleWheel, { passive: false });
      return () => {
        projectsScroll.removeEventListener("wheel", handleWheel);
      };
    }
  }, [filteredProjects.length]);

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 ">
            <div
              className="flex flex-col border-r md:border-r border-b md:border-b-0"
              style={{ borderColor: "var(--color-border)" }}
            >
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
                    placeholder="Find User..."
                    value={teamSearchQuery}
                    onChange={(e) => setTeamSearchQuery(e.target.value)}
                    className="input flex-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                <h4
                  className="text-xs font-semibold uppercase tracking-wider mb-4"
                  style={{ color: "var(--color-fg-secondary)" }}
                >
                  User
                </h4>

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

                <button
                  className="flex items-center justify-center space-x-3 px-3 py-2 w-full rounded-md transition-colors duration-200"
                  style={{
                    color: "var(--color-fg)",
                    backgroundColor: "transparent",
                    border: "1px solid var(--color-accent)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--color-bg-secondary)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  onClick={() => {
                    logout();
                    router.replace("/");
                  }}
                >
                  <span className="text-sm font-medium">
                    Use another account
                  </span>
                </button>
              </div>
            </div>

            <div
              className="hidden md:flex flex-col overflow-hidden"
              style={{ backgroundColor: "var(--color-bg)" }}
            >
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

              <div className="flex-1 p-4 overflow-hidden flex flex-col">
                {isLoading && (
                  <div className="flex items-center justify-center h-32">
                    <div
                      className="animate-spin rounded-full h-8 w-8 border-b-2"
                      style={{ borderColor: "var(--color-primary)" }}
                    ></div>
                  </div>
                )}

                {!isLoading && filteredProjects.length > 0 && (
                  <div
                    ref={projectsScrollRef}
                    className="space-y-2 overflow-y-auto max-h-[40vh] pr-2"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "var(--color-border) transparent",
                    }}
                    onWheel={(e) => {
                      e.stopPropagation();
                    }}
                  >
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
                          router.push("/gitProject");
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
                              className="text-xs truncate mt-0.5"
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

                {!isLoading &&
                  filteredProjects.length === 0 &&
                  repositories.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <div
                        className="text-lg font-bold mb-1"
                        style={{ color: "var(--color-fg)" }}
                      >
                        No projects, yet!
                      </div>
                      <div
                        className="text-sm mb-2"
                        style={{ color: "var(--color-fg-secondary)" }}
                      >
                        {githubUser
                          ? "Connect GitHub repos to see your projects."
                          : "This team has no projects."}
                      </div>
                      <button
                        className="flex items-center space-x-2 !px-3 !py-1.5 rounded-md transition-all duration-200 hover:opacity-90"
                        style={{
                          backgroundColor: "var(--color-bg)",
                          color: "var(--color-fg)",
                          border: "1px solid var(--color-accent)",
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
                      <button
                        className="flex items-center mt-2 space-x-2 !px-3 !py-1.5 rounded-md transition-all duration-200 hover:opacity-90"
                        style={{
                          backgroundColor: "var(--color-bg)",
                          color: "var(--color-fg)",
                          border: "1px solid var(--color-accent)",
                        }}
                        onClick={githubAppRedirect}
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          import Project
                        </span>
                      </button>
                    </div>
                  )}

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
