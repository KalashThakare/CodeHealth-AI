import { axiosInstance } from "@/lib/axios";

export interface FeedbackRequest {
  message: string;
}

export interface FeedbackResponse {
  ok: boolean;
  message?: string;
  error?: string;
}

export const submitFeedbackAPI = async (
  message: string
): Promise<FeedbackResponse> => {
  try {
    const response = await axiosInstance.post("/feedback", { message });
    return response.data;
  } catch (error: any) {
    console.error("Feedback submission error:", error);

    // Handle axios error responses
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error("Failed to submit feedback");
    }
  }
};
