"use client";
import { useTeamStore } from "@/store/teamStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { DashboardThemeToggle } from "@/components/ui/DashboardThemeToggle";

const CreateTeamPage = () => {
  const router = useRouter();
  const { authUser } = useAuthStore();
  const { createTeam, loading, error } = useTeamStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = "Team name is required";
    } else if (formData.name.trim().length < 3) {
      errors.name = "Team name must be at least 3 characters";
    } else if (formData.name.trim().length > 50) {
      errors.name = "Team name must be less than 50 characters";
    }

    if (!formData.description.trim()) {
      errors.description = "Team description is required";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    } else if (formData.description.trim().length > 200) {
      errors.description = "Description must be less than 200 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const team = await createTeam({
      name: formData.name.trim(),
      description: formData.description.trim(),
    });

    if (team) {
      router.push(`/dashboard/teams/${team.id || team._id}`);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  if (!authUser) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="min-h-screen glass-bg">
      {/* Header */}
      <div className="glass-nav sticky top-0 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard/teams"
            className="text-lg font-semibold text-primary hover:text-primary/80"
          >
            ← Back to Teams
          </Link>
          <DashboardThemeToggle />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Create New Team</h1>
          <p className="text-text/70">
            Start collaborating by creating your team
          </p>
        </div>

        {/* Form */}
        <div className="glass-card p-8 rounded-2xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Team Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter team name"
                className={`w-full bg-transparent border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                  formErrors.name
                    ? "border-red-400 focus:border-red-400"
                    : "border-white/10 focus:border-transparent"
                }`}
              />
              {formErrors.name && (
                <p className="text-red-400 text-sm mt-2">{formErrors.name}</p>
              )}
              <p className="text-text/50 text-xs mt-1">
                {formData.name.length}/50 characters
              </p>
            </div>

            {/* Team Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-2"
              >
                Team Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe what your team does..."
                rows={4}
                className={`w-full bg-transparent border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none ${
                  formErrors.description
                    ? "border-red-400 focus:border-red-400"
                    : "border-white/10 focus:border-transparent"
                }`}
              />
              {formErrors.description && (
                <p className="text-red-400 text-sm mt-2">
                  {formErrors.description}
                </p>
              )}
              <p className="text-text/50 text-xs mt-1">
                {formData.description.length}/200 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50/10 border border-red-400/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 glass-btn glass-btn-secondary px-6 py-3 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  loading ||
                  !formData.name.trim() ||
                  !formData.description.trim()
                }
                className={`flex-1 glass-btn glass-btn-primary px-6 py-3 rounded-lg font-medium transition-all ${
                  loading ||
                  !formData.name.trim() ||
                  !formData.description.trim()
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </div>
                ) : (
                  "Create Team"
                )}
              </button>
            </div>
          </form>

          {/* Team Creation Tips */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-lg font-semibold mb-4">
              Tips for Creating a Great Team
            </h3>
            <ul className="space-y-2 text-text/70 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  Choose a descriptive name that reflects your team's purpose
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  Write a clear description to help members understand the
                  team's goals
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span>
                  You'll be able to invite members and add projects after
                  creating the team
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTeamPage;
