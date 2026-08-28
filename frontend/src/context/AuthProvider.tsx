import { useState, type ReactNode } from "react";

import { api } from "../services/api";
import type { LoginResponse, User } from "../types/auth";
import { AuthContext } from "./AuthContext";

function loadStoredUser(): User | null {
  const stored = localStorage.getItem("elite-dev-user");

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as User;
  } catch {
    localStorage.removeItem("elite-dev-user");
    localStorage.removeItem("elite-dev-token");

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

    setUser(data.user);

    return data.user;
  }

  function logout() {
    localStorage.removeItem("elite-dev-token");
    localStorage.removeItem("elite-dev-user");

    setUser(null);
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
