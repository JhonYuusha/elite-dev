import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { queryClient } from "../lib/query-client";
import {
  api,
  AUTH_EXPIRED_EVENT,
} from "../services/api";

import type {
  LoginResponse,
  User,
} from "../types/auth";

import { AuthContext } from "./AuthContext";

function clearStoredSession() {
  localStorage.removeItem("elite-dev-token");
  localStorage.removeItem("elite-dev-user");
}

function loadStoredUser(): User | null {
  const storedUser = localStorage.getItem("elite-dev-user");
  const storedToken = localStorage.getItem("elite-dev-token");

  if (!storedUser || !storedToken) {
    clearStoredSession();
    return null;
  }

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(
    () => loadStoredUser(),
  );

  const logout = useCallback(() => {
    clearStoredSession();
    queryClient.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    function handleExpiredSession() {
      logout();
    }

    window.addEventListener(
      AUTH_EXPIRED_EVENT,
      handleExpiredSession,
    );

    return () => {
      window.removeEventListener(
        AUTH_EXPIRED_EVENT,
        handleExpiredSession,
      );
    };
  }, [logout]);

  async function login(
    email: string,
    password: string,
  ) {
    const { data } = await api.post<LoginResponse>(
      "/auth/login",
      {
        email,
        password,
      },
    );

    localStorage.setItem(
      "elite-dev-token",
      data.token,
    );

    localStorage.setItem(
      "elite-dev-user",
      JSON.stringify(data.user),
    );

    queryClient.clear();
    setUser(data.user);

    return data.user;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}