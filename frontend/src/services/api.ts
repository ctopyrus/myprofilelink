/// <reference types="vite/client" />
import axios from "axios";

const rawApiUrl =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8080";

const apiBaseUrl = rawApiUrl.endsWith("/api")
  ? rawApiUrl
  : `${rawApiUrl}/api`;

console.log("🌐 API Base URL:", apiBaseUrl);

const API = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("mpl_token") ||
    localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("mpl_token");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;