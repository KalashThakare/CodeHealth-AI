import React from "react";
import { X } from "lucide-react";
import { submitFeedbackAPI } from "@/services/feedbackService";
import { toast } from "sonner";
import { NavbarState } from "../types";

interface FeedbackModalProps {
  state: NavbarState;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ state }) => {
  const submitFeedback = async () => {
    if (!state.feedbackText.trim()) return;

    state.setIsSubmittingFeedback(true);

    try {
      await submitFeedbackAPI(state.feedbackText.trim());
      toast.success(
        "Feedback submitted successfully! Thank you for your input."
      );
      state.setFeedbackText("");
      state.setIsFeedbackOpen(false);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit feedback. Please try again."
      );
    } finally {
      state.setIsSubmittingFeedback(false);
    }
  };

  if (!state.isFeedbackOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={() =>
          !state.isSubmittingFeedback && state.setIsFeedbackOpen(false)
        }
      />
      <div
        className="relative rounded-2xl shadow-2xl w-full max-w-md p-6"
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow)",
        }}
      >
        <div className="mb-4">
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--color-fg)" }}
          >
            Send Feedback
          </h3>
          <X
            onClick={() =>
              !state.isSubmittingFeedback && state.setIsFeedbackOpen(false)
            }
            className={`w-5 h-5 absolute top-4 right-4 rounded-lg transition-colors cursor-pointer ${
              state.isSubmittingFeedback ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{ color: "var(--color-fg-secondary)" }}
            onMouseEnter={(e) =>
              !state.isSubmittingFeedback &&
              (e.currentTarget.style.backgroundColor =
                "var(--color-bg-secondary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          />
        </div>

        <textarea
          value={state.feedbackText}
          onChange={(e) => state.setFeedbackText(e.target.value)}
          disabled={state.isSubmittingFeedback}
          placeholder="Share your thoughts, report bugs, or suggest improvements..."
          className="w-full h-32 px-4 py-3 rounded-xl resize-none focus:outline-none transition-all duration-200 border disabled:opacity-50"
          style={{
            background: "var(--color-input-bg)",
            borderColor: "var(--color-input-border)",
            color: "var(--color-fg)",
          }}
        />

        <div className="flex items-center justify-end space-x-3 mt-4">
          <button
            onClick={() => state.setIsFeedbackOpen(false)}
            disabled={state.isSubmittingFeedback}
            className="px-4 py-2 rounded-lg transition-colors border disabled:opacity-50"
            style={{
              color: "var(--color-fg)",
              borderColor: "var(--color-border)",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) =>
              !state.isSubmittingFeedback &&
              (e.currentTarget.style.backgroundColor =
                "var(--color-bg-secondary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            Cancel
          </button>
          <button
            onClick={submitFeedback}
            disabled={!state.feedbackText.trim() || state.isSubmittingFeedback}
            className="px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            style={{
              backgroundColor: "var(--color-btn-bg)",
              color: "var(--color-btn-fg)",
              border: "1px solid var(--color-btn-border)",
            }}
            onMouseEnter={(e) =>
              !state.feedbackText.trim() || state.isSubmittingFeedback
                ? null
                : (e.currentTarget.style.backgroundColor =
                    "var(--color-btn-bg-hover)")
            }
            onMouseLeave={(e) =>
              !state.feedbackText.trim() || state.isSubmittingFeedback
                ? null
                : (e.currentTarget.style.backgroundColor =
                    "var(--color-btn-bg)")
            }
          >
            {state.isSubmittingFeedback ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Sending...</span>
              </>
            ) : (
              <span>Send</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
