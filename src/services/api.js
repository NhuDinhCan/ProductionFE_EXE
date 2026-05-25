import axios from "axios";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  updateTokens,
} from "./tokenUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();
const SKIP_NGROK_WARNING = import.meta.env.VITE_NGROK_SKIP_WARNING === "true";

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is required");
}

const addDevHeaders = (headers) => {
  if (SKIP_NGROK_WARNING) {
    headers["ngrok-skip-browser-warning"] = "true";
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    addDevHeaders(config.headers);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            addDevHeaders(originalRequest.headers);
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        isRefreshing = false;
        clearSession();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const headers = { "Content-Type": "application/json" };
        addDevHeaders(headers);
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers, timeout: 15000 }
        );

        const { accessToken, refreshToken: rotatedRefreshToken } = res.data.result;
        updateTokens({ accessToken, refreshToken: rotatedRefreshToken });

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        addDevHeaders(originalRequest.headers);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearSession();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
