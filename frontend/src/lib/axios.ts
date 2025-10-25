import { AxiosInstance } from "./../../node_modules/axios/index.d";
import axios from "axios";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_AXIOS_API_URL}`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds default timeout
});

// Create a separate instance for AI insights with longer timeout
export const axiosAIInstance: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_AXIOS_API_URL}`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000, // 2 minutes for AI insights
});

// Add request interceptor for debugging
// axiosInstance.interceptors.request.use(
//   (config) => {
//     console.log(`Making request to: ${config.baseURL}${config.url}`);
//     return config;
//   },
//   (error) => {
//     console.error("Request error:", error);
//     return Promise.reject(error);
//   }
// );

// // Add response interceptor for error handling
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error(
//       "Response error:",
//       error.response?.status,
//       error.response?.data
//     );
//     return Promise.reject(error);
//   }
// );
