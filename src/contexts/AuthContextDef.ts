import { createContext } from "react";
import { User } from "@/types/auth";

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
