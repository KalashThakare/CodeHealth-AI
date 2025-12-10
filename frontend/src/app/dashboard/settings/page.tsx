"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAccountSettingsStore } from "@/store/accountSettingsStore";
import { useAuthStore } from "@/store/authStore";

const FormField = ({
  field,
  label,
  type = "text",
  placeholder,
  description,
  maxLength,
  validation,
  value,
  isDirty,
  loading,
  onInputChange,
  onSave,
  onCancel,
}: {
  field: string;
  label: string;
  type?: string;
  placeholder: string;
  description: string;
  maxLength?: number;
  validation?: (value: string) => string | null;
  value: string;
  isDirty: boolean;
  loading: boolean;
  onInputChange: (value: string) => void;
  onSave: () => Promise<boolean>;
  onCancel: () => void;
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);

  const router = useRouter();

  const handleSaveWithValidation = async () => {
    if (validation) {
      const error = validation(value);
      setValidationError(error);
      if (error) return;
    }
    const success = await onSave();
    try {
      if (success) {
        if (router && typeof router.refresh === "function") {
          router.refresh();
        } else if (typeof window !== "undefined") {
          window.location.reload();
        }
      }
    } catch (err) {
      console.error("Failed to refresh after save:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">{label}</label>
        <div className="space-y-2">
          <input
            type={type}
            value={value}
            onChange={(e) => {
              onInputChange(e.target.value);
              if (validationError) {
                setValidationError(null);
              }
            }}
            placeholder={placeholder}
            maxLength={maxLength}
            className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            style={{
              background: "var(--color-bg-secondary)",
              borderColor: validationError ? "#ef4444" : "var(--color-border)",
              color: "var(--color-fg)",
            }}
          />
          {validationError && (
            <p className="text-xs text-red-400">{validationError}</p>
          )}
          <p className="text-xs opacity-60">{description}</p>
        </div>
      </div>

      {isDirty && (
        <div className="flex gap-3">
          <button
            onClick={handleSaveWithValidation}
            disabled={loading}
            className="glass-btn glass-btn-primary px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={onCancel}
            className="glass-btn glass-btn-secondary px-4 py-2 rounded-lg font-medium text-sm"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default function SettingsPage() {
  const {
    loading,
    error,
    updateName,
    addAlternateEmail,
    addPhoneNumber,
    manageGithubPermissions,
    deleteAccount,
    clearError,
  } = useAccountSettingsStore();

  const authUser = useAuthStore((state) => state.authUser);

  const [activeSection, setActiveSection] = useState("profile");
  const [formData, setFormData] = useState({
    displayName: "",
    alternateEmail: "",
    phoneNumber: "",
  });
  const [isDirty, setIsDirty] = useState({
    displayName: false,
    alternateEmail: false,
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
    if (authUser) {
      setFormData({
        displayName: authUser.name || "",
        alternateEmail: "",
        phoneNumber: "",
      });
    }
  }, [authUser]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleInputChange = useCallback(
    (field: keyof typeof formData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setIsDirty((prev) => ({
        ...prev,
        [field]: true,
      }));
    },
    []
  );

  const handleSave = useCallback(
    async (field: keyof typeof formData): Promise<boolean> => {
      const value = formData[field].trim();
      if (!value) return false;

      let success = false;
      try {
        switch (field) {
          case "displayName":
            success = await updateName(value);
            break;
          case "alternateEmail":
            success = await addAlternateEmail(value);
            break;
          case "phoneNumber":
            success = await addPhoneNumber(value);
            break;
        }
        if (success) {
          if (field === "displayName") {
            const currentAuthUser = useAuthStore.getState().authUser;
            if (currentAuthUser) {
              useAuthStore.setState({
                authUser: { ...currentAuthUser, name: value },
              });
            }
          }
          setIsDirty((prev) => ({ ...prev, [field]: false }));
          if (field !== "displayName") {
            setFormData((prev) => ({ ...prev, [field]: "" }));
          }
        }
        return success;
      } catch (err) {
        console.error(`Failed to update ${field}:`, err);
        return false;
      }
      return false;
    },
    [formData, updateName, addAlternateEmail, addPhoneNumber]
  );

  const handleCancel = useCallback(
    (field: keyof typeof formData) => {
      if (field === "displayName") {
        setFormData((prev) => ({
          ...prev,
          [field]: authUser?.name || "",
        }));
      } else {
        setFormData((prev) => ({ ...prev, [field]: "" }));
      }
      setIsDirty((prev) => ({ ...prev, [field]: false }));
    },
    [authUser]
  );

  const handleManageGithubPermissions = useCallback(async () => {
    const redirectUrl =
      (process.env.NEXT_PUBLIC_GITHUB_PERMISSION_URL as string) ||
      "/github/permissions";
    try {
      await manageGithubPermissions();
    } catch (err) {
      console.error("Failed to manage GitHub permissions:", err);
    } finally {
      if (typeof window !== "undefined") {
        window.location.href = redirectUrl;
      }
    }
  }, [manageGithubPermissions]);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;

    try {
      const success = await deleteAccount();
      if (success) {
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Failed to delete account:", err);
    }

    setShowDeleteConfirm(false);
    setDeleteConfirmText("");
  };

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return null; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? null : "Please enter a valid email address";
  };

  const validatePhoneNumber = (phone: string): string | null => {
    if (!phone.trim()) return null; // Optional field
    const phoneRegex = /^\+?[0-9]{7,15}$/;
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
                        value={formData.displayName}
                        isDirty={isDirty.displayName}
                        loading={loading}
                        onInputChange={(value) =>
                          handleInputChange("displayName", value)
                        }
                        onSave={() => handleSave("displayName")}
                        onCancel={() => handleCancel("displayName")}
                      />
                      <div className="pt-2">
                        <button
                          onClick={handleManageGithubPermissions}
                          disabled={loading}
                          className="glass-btn px-4 py-2 rounded-lg font-medium text-sm"
                          style={{
                            background:"transparent"
                          }}
                        >
                          Manage GitHub Permissions
                        </button>
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
                        field="alternateEmail"
                        label="Alternate Email Address"
                        type="email"
                        placeholder="Enter an alternate email address"
                        description="Add an alternate email for notifications and account recovery."
                        validation={validateEmail}
                        value={formData.alternateEmail}
                        isDirty={isDirty.alternateEmail}
                        loading={loading}
                        onInputChange={(value) =>
                          handleInputChange("alternateEmail", value)
                        }
                        onSave={() => handleSave("alternateEmail")}
                        onCancel={() => handleCancel("alternateEmail")}
                      />

                      <div className="border-t border-[var(--color-border)] pt-8">
                        <FormField
                          field="phoneNumber"
                          label="Phone Number"
                          type="tel"
                          placeholder="Enter your phone number"
                          description="Optional. Used for account security and notifications."
                          validation={validatePhoneNumber}
                          value={formData.phoneNumber}
                          isDirty={isDirty.phoneNumber}
                          loading={loading}
                          onInputChange={(value) =>
                            handleInputChange("phoneNumber", value)
                          }
                          onSave={() => handleSave("phoneNumber")}
                          onCancel={() => handleCancel("phoneNumber")}
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
