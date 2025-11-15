"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { submitFeedbackAPI } from "@/services/feedbackService";
import { toast } from "sonner";

interface FeedbackDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

export const FeedbackDropdown: React.FC<FeedbackDropdownProps> = ({
  isOpen,
  onClose,
  buttonRef,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Focus textarea when opened
      setTimeout(() => textareaRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedbackText.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitFeedbackAPI(feedbackText.trim());

      if (response.ok) {
        toast.success(
          "Feedback submitted successfully! Thank you for your input."
        );
        setFeedbackText("");
        onClose();
      } else {
        toast.error(
          response.message || response.error || "Failed to submit feedback"
        );
      }
    } catch (error: any) {
      console.error("Feedback submission error:", error);
      toast.error(
        error.message || "Failed to submit feedback. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 rounded-lg shadow-xl border overflow-hidden z-50"
      style={{
        backgroundColor: "var(--color-bg)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h3
          className="font-semibold text-base"
          style={{ color: "var(--color-fg)" }}
        >
          Send Feedback
        </h3>
        <button
          onClick={onClose}
          className="!p-1 !rounded-md !hover:opacity-70 !transition-opacity"
        //   style={{ color: "var(--color-fg-muted)" }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Feedback Form */}
      <form onSubmit={handleSubmit} className="p-4">
        <textarea
          ref={textareaRef}
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Share your thoughts, report bugs, or suggest features..."
          className="w-full h-32 px-3 py-2 rounded-lg border resize-none focus:outline-none focus:ring-2 transition-all"
          style={{
            backgroundColor: "var(--color-bg-subtle)",
            color: "var(--color-fg)",
            borderColor: "var(--color-border)",
          }}
          disabled={isSubmitting}
        />

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>
            {feedbackText.length}/500 characters
          </p>
          <button
            type="submit"
            disabled={isSubmitting || !feedbackText.trim()}
            className="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "white",
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer Info */}
      <div
        className="px-4 py-2 border-t text-xs"
        style={{
          backgroundColor: "var(--color-bg-subtle)",
          borderColor: "var(--color-border)",
          color: "var(--color-fg-muted)",
        }}
      >
        Your feedback helps us improve CodeHealth-AI
      </div>
    </div>
  );
};
