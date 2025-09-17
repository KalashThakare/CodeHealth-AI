"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTeamStore } from "@/store/teamStore";
import {
  ArrowLeft,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const CreateTeamPage = () => {
  const router = useRouter();
  const { createTeam, loading, error, clearError } = useTeamStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  const validateForm = () => {
    const errors: typeof validationErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Team name is required";
    } else if (formData.name.length < 3) {
      errors.name = "Team name must be at least 3 characters";
    } else if (formData.name.length > 50) {
      errors.name = "Team name must be less than 50 characters";
    }

    if (!formData.description.trim()) {
      errors.description = "Team description is required";
    } else if (formData.description.length < 10) {
      errors.description = "Description must be at least 10 characters";
    } else if (formData.description.length > 200) {
      errors.description = "Description must be less than 200 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    const team = await createTeam({
      name: formData.name.trim(),
      description: formData.description.trim(),
    });

    if (team) {
      router.push(`/dashboard/teams/${team.id}`);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/teams"
            className="inline-flex items-center space-x-2 mb-4 text-sm hover:opacity-80 transition-opacity"
            style={{ color: "var(--color-fg-secondary)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Teams</span>
          </Link>

          <div className="flex items-center space-x-3">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: "var(--color-card)" }}
            >
              <Users
                className="w-6 h-6"
                style={{ color: "var(--color-primary)" }}
              />
            </div>
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ color: "var(--color-fg)" }}
              >
                Create New Team
              </h1>
              <p
                className="mt-1"
                style={{ color: "var(--color-fg-secondary)" }}
              >
                Set up a new team to collaborate with others
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div
            className="mb-6 p-4 rounded-lg border flex items-center space-x-3"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "#ef4444",
              color: "#ef4444",
            }}
          >
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button
              onClick={clearError}
              className="ml-auto text-sm underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Form */}
        <div
          className="p-8 rounded-lg border"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-fg)" }}
              >
                Team Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter team name"
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
                  validationErrors.name ? "border-red-500" : ""
                }`}
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: validationErrors.name
                    ? "#ef4444"
                    : "var(--color-border)",
                  color: "var(--color-fg)",
                }}
                disabled={loading}
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.name}
                </p>
              )}
              <p
                className="mt-1 text-xs"
                style={{ color: "var(--color-fg-secondary)" }}
              >
                {formData.name.length}/50 characters
              </p>
            </div>

            {/* Team Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-fg)" }}
              >
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe what this team is for..."
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors resize-none ${
                  validationErrors.description ? "border-red-500" : ""
                }`}
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: validationErrors.description
                    ? "#ef4444"
                    : "var(--color-border)",
                  color: "var(--color-fg)",
                }}
                disabled={loading}
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.description}
                </p>
              )}
              <p
                className="mt-1 text-xs"
                style={{ color: "var(--color-fg-secondary)" }}
              >
                {formData.description.length}/200 characters
              </p>
            </div>

            {/* Info Box */}
            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="flex items-start space-x-3">
                <CheckCircle
                  className="w-5 h-5 mt-0.5"
                  style={{ color: "var(--color-primary)" }}
                />
                <div>
                  <h4
                    className="font-medium mb-1"
                    style={{ color: "var(--color-fg)" }}
                  >
                    What happens after creating a team?
                  </h4>
                  <ul
                    className="text-sm space-y-1"
                    style={{ color: "var(--color-fg-secondary)" }}
                  >
                    <li>• You'll be automatically set as the team owner</li>
                    <li>• You can invite members via email</li>
                    <li>• Start collaborating on projects immediately</li>
                    <li>• Manage roles and permissions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center space-x-4 pt-4">
              <button
                type="submit"
                disabled={
                  loading ||
                  !formData.name.trim() ||
                  !formData.description.trim()
                }
                className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>Create Team</span>
                  </>
                )}
              </button>

              <Link
                href="/dashboard/teams"
                className="px-6 py-3 rounded-lg border font-medium transition-colors"
                style={{
                  color: "var(--color-fg)",
                  borderColor: "var(--color-border)",
                  backgroundColor: "transparent",
                }}
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTeamPage;
