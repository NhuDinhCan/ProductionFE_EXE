import api from "./api";
import { getAccessToken, getRefreshToken } from "./tokenUtils";

export const loginApi = (data) => api.post("/auth/login", data);

export const registerApi = (data) => api.post("/users", data);

export const logoutApi = () =>
  api.post(
    "/auth/logout",
    { refreshToken: getRefreshToken() },
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }
  );

export const refreshTokenApi = (refreshToken) =>
  api.post("/auth/refresh", { refreshToken });
