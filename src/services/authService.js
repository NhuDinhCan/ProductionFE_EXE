import api from "./api";

export const loginApi = (data) => api.post("/auth/login", data);

export const registerApi = (data) => api.post("/users", data);

export const logoutApi = () =>
  api.post("/auth/logout", {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

export const refreshTokenApi = (refreshToken) =>
  api.post("/auth/refresh", { refreshToken });
