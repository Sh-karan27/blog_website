import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1",
  withCredentials: true, // Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (attach token if exists)
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (optional – handle 401, refresh tokens, etc.)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized, maybe refresh token logic here?");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
