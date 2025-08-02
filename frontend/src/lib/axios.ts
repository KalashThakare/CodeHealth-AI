import { AxiosInstance } from './../../node_modules/axios/index.d';
import axios from "axios";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: "https://localhost:8080/api",
  withCredentials: true,
});