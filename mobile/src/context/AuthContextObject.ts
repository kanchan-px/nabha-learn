import { createContext } from "react";
import type { AuthUser, LoginPayload } from "../api/auth.api";

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);