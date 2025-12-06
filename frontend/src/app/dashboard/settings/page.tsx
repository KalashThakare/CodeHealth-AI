"use client";

import React, { useState, useEffect } from "react";
import { useAccountSettingsStore } from "@/store/accountSettingsStore";

export default function SettingsPage() {
  const {
    accountSettings,
    loading,
    error,
    fetchAccountSettings,
    updateDisplayName,
    updateUsername,
    updateEmail,
    updatePhoneNumber,
    deleteAccount,
    clearError,
  } = useAccountSettingsStore();

  const [activeSection, setActiveSection] = useState("profile");
  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    email: "",
    phoneNumber: "",
  });
  const [isDirty, setIsDirty] = useState({
    displayName: false,
    username: false,
    email: false,
    phoneNumber: false,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const sections = [
    { id: "profile", label: "Profile Information" },
    { id: "security", label: "Contact Information" },
    { id: "danger", label: "Account Management" },
  ];

  useEffect(() => {
    fetchAccountSettings();
  }, [fetchAccountSettings]);

  useEffect(() => {
    if (accountSettings) {
      setFormData({
        displayName: accountSettings.displayName || "",
        username: accountSettings.username || "",
        email: accountSettings.email || "",
        phoneNumber: accountSettings.phoneNumber || "",
      });
    }
  }, [accountSettings]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty((prev) => ({
      ...prev,
      [field]: value !== (accountSettings?.[field] || ""),
    }));
  };

  const handleSave = async (field: keyof typeof formData) => {
    const value = formData[field].trim();
    if (!value || value === (accountSettings?.[field] || "")) return;

    try {
      switch (field) {
        case "displayName":
          await updateDisplayName(value);
          break;
        case "username":
          await updateUsername(value);
          break;
        case "email":
          await updateEmail(value);
          break;
        case "phoneNumber":
          await updatePhoneNumber(value);
          break;
      }
      setIsDirty((prev) => ({ ...prev, [field]: false }));
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
    }
  };

  const handleCancel = (field: keyof typeof formData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: accountSettings?.[field] || "",
    }));
    setIsDirty((prev) => ({ ...prev, [field]: false }));
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;

    try {
      await deleteAccount()
      window.location.href = "/login";
    } catch (err) {
      console.error("Failed to delete account:", err);
    }

    setShowDeleteConfirm(false);
    setDeleteConfirmText("");
  };

  const FormField = ({
    field,
    label,
    type = "text",
    placeholder,
    description,
    maxLength,
    validation,
  }: {
    field: keyof typeof formData;
    label: string;
    type?: string;
    placeholder: string;
    description: string;
    maxLength?: number;
    validation?: (value: string) => string | null;
  }) => {
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleValidation = (value: string) => {
      if (validation) {
        const error = validation(value);
        setValidationError(error);
        return !error;
      }
      return true;
    };

    const handleSaveWithValidation = async () => {
      const isValid = handleValidation(formData[field]);
      if (isValid) {
        await handleSave(field);
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">{label}</label>
          <div className="space-y-2">
            <input
              type={type}
              value={formData[field]}
              onChange={(e) => {
                handleInputChange(field, e.target.value);
                if (validationError) {
                  handleValidation(e.target.value);
                }
              }}
              onBlur={() => handleValidation(formData[field])}
              placeholder={placeholder}
              maxLength={maxLength}
              className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              style={{
                background: "var(--color-bg-secondary)",
                borderColor: validationError
                  ? "#ef4444"
                  : "var(--color-border)",
                color: "var(--color-fg)",
              }}
            />
            {validationError && (
              <p className="text-xs text-red-400">{validationError}</p>
            )}
            <p className="text-xs opacity-60">{description}</p>
          </div>
        </div>

        {isDirty[field] && !validationError && (
          <div className="flex gap-3">
            <button
              onClick={handleSaveWithValidation}
              disabled={loading}
              className="glass-btn glass-btn-primary px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => handleCancel(field)}
              className="glass-btn glass-btn-secondary px-4 py-2 rounded-lg font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  };

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? null : "Please enter a valid email address";
  };

  const validateUsername = (username: string): string | null => {
    if (!username.trim()) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters";
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    return usernameRegex.test(username)
      ? null
      : "Username can only contain letters, numbers, hyphens, and underscores";
  };

  const validatePhoneNumber = (phone: string): string | null => {
    if (!phone.trim()) return null; 
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone) ? null : "Please enter a valid phone number";
  };

  return (
    <div className="min-h-screen glass-bg">
      <div className="max-w-6xl mx-auto px-5 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight font-title">
            Account Settings
          </h1>
          <p className="text-sm mt-2 opacity-70">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <nav
              className="rounded-2xl p-3 sticky top-8"
              style={{
                background: "var(--color-bg-primary)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow)",
              }}
            >
              <div className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    style={{
                      background: "var(--color-bg-secondary)",
                      color:
                        activeSection === section.id
                          ? "var(--color-fg)"
                          : "var(--color-fg-secondary)",
                      border:
                        activeSection === section.id
                          ? "1px solid var(--color-border)"
                          : "1px solid transparent",
                    }}
                    className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-left transition-all`}
                  >
                    <span className="font-medium text-sm">{section.label}</span>
                  </button>
                ))}
              </div>
            </nav>
          </div>

          <div className="lg:col-span-3">
            <div
              className="rounded-2xl p-6"
              style={{
                background: "var(--color-bg-primary)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow)",
              }}
            >
              {activeSection === "profile" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold mb-6">
                      Profile Information
                    </h2>
                    <div className="space-y-8">
                      <FormField
                        field="displayName"
                        label="Display Name"
                        placeholder="Enter your display name"
                        description="This is how your name will appear to other users."
                        maxLength={50}
                      />

                      <div className="border-t border-[var(--color-border)] pt-8">
                        <FormField
                          field="username"
                          label="Username"
                          placeholder="Enter your username"
                          description="Your unique username for the platform. Can only contain letters, numbers, hyphens, and underscores."
                          maxLength={30}
                          validation={validateUsername}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "security" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold mb-6">
                      Contact Information
                    </h2>
                    <div className="space-y-8">
                      <FormField
                        field="email"
                        label="Email Address"
                        type="email"
                        placeholder="Enter your email address"
                        description="Your primary email address for notifications and account recovery."
                        validation={validateEmail}
                      />

                      <div className="border-t border-[var(--color-border)] pt-8">
                        <FormField
                          field="phoneNumber"
                          label="Phone Number"
                          type="tel"
                          placeholder="Enter your phone number"
                          description="Optional. Used for account security and notifications."
                          validation={validatePhoneNumber}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "danger" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold mb-6 text-red-400">
                      Danger Zone
                    </h2>

                    <div
                      className="rounded-xl p-6 border-1"
                      style={{
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg !text-red-400 mb-2">
                            Delete Account
                          </h3>
                          <p className="text-sm opacity-70 mb-4">
                            Permanently delete your account and all associated
                            data. This action cannot be undone.
                          </p>

                          {!showDeleteConfirm ? (
                            <button
                              onClick={() => setShowDeleteConfirm(true)}
                              className="px-4 py-2 rounded-lg font-medium text-sm text-white transition-all hover:scale-[1.02]"
                              style={{
                                background:
                                  "linear-gradient(135deg, #ef4444, #dc2626)",
                              }}
                            >
                              Delete Account
                            </button>
                          ) : (
                            <div className="space-y-4">
                              <div
                                className="p-4 rounded-lg"
                                style={{
                                  background: "var(--color-bg-secondary)",
                                }}
                              >
                                <p className="text-sm font-medium mb-2">
                                  Type{" "}
                                  <span className="font-bold text-red-400">
                                    DELETE
                                  </span>{" "}
                                  to confirm:
                                </p>
                                <input
                                  type="text"
                                  value={deleteConfirmText}
                                  onChange={(e) =>
                                    setDeleteConfirmText(e.target.value)
                                  }
                                  placeholder="Type DELETE to confirm"
                                  className="w-full px-3 py-2 rounded border text-sm"
                                  style={{
                                    background: "var(--color-card)",
                                    borderColor: "var(--color-border)",
                                    color: "var(--color-fg)",
                                  }}
                                />
                              </div>

                              <div className="flex gap-3">
                                <button
                                  onClick={handleDeleteAccount}
                                  disabled={
                                    deleteConfirmText !== "DELETE" || loading
                                  }
                                  className="px-4 py-2 rounded-lg font-medium text-sm text-white transition-all disabled:opacity-50"
                                  style={{
                                    background:
                                      deleteConfirmText === "DELETE"
                                        ? "linear-gradient(135deg, #ef4444, #dc2626)"
                                        : "rgba(239, 68, 68, 0.3)",
                                  }}
                                >
                                  {loading
                                    ? "Deleting..."
                                    : "Permanently Delete Account"}
                                </button>
                                <button
                                  onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeleteConfirmText("");
                                  }}
                                  className="glass-btn glass-btn-secondary px-4 py-2 rounded-lg font-medium text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
