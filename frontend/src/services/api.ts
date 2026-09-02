import axios from "axios";

export const AUTH_EXPIRED_EVENT = "elite-dev:auth-expired";

const AUTH_EXPIRATION_CODES = new Set([
  "INVALID_AUTH_TOKEN",
  "AUTH_TOKEN_MISSING",
  "UNAUTHENTICATED",
]);

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("elite-dev-token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const code = error.response?.data?.code;
    const requestUrl = error.config?.url ?? "";
    const hasStoredToken = Boolean(
      localStorage.getItem("elite-dev-token"),
    );

    const isLoginRequest = requestUrl.includes("/auth/login");
    const isExpiredSession =
      status === 401 &&
      hasStoredToken &&
      !isLoginRequest &&
      typeof code === "string" &&
      AUTH_EXPIRATION_CODES.has(code);

    if (isExpiredSession) {
      window.dispatchEvent(
        new CustomEvent(AUTH_EXPIRED_EVENT),
      );
    }

    return Promise.reject(error);
  },
);