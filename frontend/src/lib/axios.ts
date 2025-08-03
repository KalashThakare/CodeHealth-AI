import { AxiosInstance } from './../../node_modules/axios/index.d';
import axios from "axios";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});