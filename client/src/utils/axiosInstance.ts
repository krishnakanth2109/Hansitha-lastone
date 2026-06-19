// src/utils/axiosInstance.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

// Automatically add the token to every request
api.interceptors.request.use(
  (config) => {
    // We use sessionStorage as requested
    const token = sessionStorage.getItem("token"); 
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;