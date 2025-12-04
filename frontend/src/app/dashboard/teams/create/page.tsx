"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTeamStore } from "@/store/teamStore";
import { DashboardNavbar } from "../../_components/DashboardNavbar";
import { AuthGuard } from "@/services/AuthGuard";
import Link from "next/link";

const CreateTeamPage = () => {
  const router = useRouter();
  const { createTeam, loading, error, clearError } = useTeamStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    try {
      const newTeam = await createTeam({
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      if (newTeam) {
        router.push(`/dashboard/teams/${newTeam.id || newTeam._id}`);
      }
    } catch (error) {
      console.error("Failed to create team:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      clearError();
    }
  };

  return (
    <div className="min-h-screen glass-bg">
      <DashboardNavbar currentTeam={null} />

      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <Link
            href="/dashboard/teams"
            className="text-primary hover:text-primary/80 font-medium mb-4 inline-flex items-center"
          >
            ← Back to Teams
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create New Team</h1>
          <p className="text-text/70">
            Set up a new team to collaborate with others on projects
          </p>
        </div>

        {error && (
          <div className="glass-card bg-red-500/10 border-red-500/30 p-4 rounded-lg mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="glass-card p-8 rounded-2xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Team Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full glass-input px-4 py-3 rounded-lg"
                placeholder="Enter team name"
                required
                maxLength={50}
              />
              <p className="text-xs text-text/60 mt-1">
                {formData.name.length}/50 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full glass-input px-4 py-3 rounded-lg resize-none"
                placeholder="Describe what this team is about"
                maxLength={500}
              />
              <p className="text-xs text-text/60 mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6">
              <Link
                href="/dashboard/teams"
                className="glass-btn glass-btn-secondary px-6 py-3 rounded-lg font-medium transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="glass-btn glass-btn-primary px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? "Creating..." : "Create Team"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function CreateTeamPageWithAuth() {
  return (
    <AuthGuard>
      <CreateTeamPage />
    </AuthGuard>
  );
}