import { AxiosInstance } from './../../node_modules/axios/index.d';
import axios from "axios";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_AXIOS_API_URL}`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});