import { createContext } from "react";

import type { User } from "../types/auth";

export type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
};

export const AuthContext =
  createContext<AuthContextValue | undefined>(undefined);