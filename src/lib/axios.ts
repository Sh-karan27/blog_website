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
  (error) => Promise.reject(error),
);

function logoutAndRedirect() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  const path = window.location.pathname;
  if (path !== "/login" && path !== "/register") {
    window.location.href = "/login";
  }
}

// The backend rotates the refresh token on every use, so multiple requests
// that 401 at the same time (e.g. a page firing several parallel calls right
// after the access token expires) must not each fire their own refresh —
// only the first would succeed and the rest would be rejected as "already
// used", wiping the tokens the first call just legitimately set. Sharing one
// in-flight promise means every concurrent 401 waits on the same refresh.
let refreshPromise: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const res = await axios.post(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL ||
            "http://localhost:8000/api/v1"
          }/users/refresh-token`,
          { refreshToken },
          { withCredentials: true },
        );

        const { accessToken, refreshToken: newRefreshToken } = res.data.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        return accessToken;
      } catch (err) {
        console.error("Refresh token failed:", err);
        logoutAndRedirect();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

// Response interceptor (optional – handle 401, refresh tokens, etc.)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newAccessToken = await refreshAccessToken();
      if (!newAccessToken) {
        return Promise.reject(error);
      }

      originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      return axiosInstance(originalRequest);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
