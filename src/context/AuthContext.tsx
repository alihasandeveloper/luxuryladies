"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthUser } from "@/types/auth";
import { toast } from "sonner";

interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<{ success: boolean; message?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "ll_auth_user";
const TOKEN_STORAGE_KEY = "ll_auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from localStorage and verify with backend
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (storedUser && storedToken) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setToken(storedToken);

        // Background revalidation
        fetch(`/api/auth/me?user_id=${parsed.id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data?.success && data.user) {
              setUser(data.user);
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
            }
          })
          .catch(() => {});
      }
    } catch (e) {
      console.error("Error reading stored user:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.message || "Invalid username or password.";
        return { success: false, message: errorMsg };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);

      return { success: true, message: data.message };
    } catch (err: any) {
      console.error("Login error:", err);
      const msg = "Unable to connect to authentication server.";
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        const errorMsg = result.message || "Registration failed.";
        return { success: false, message: errorMsg };
      }

      setUser(result.user);
      setToken(result.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user));
      localStorage.setItem(TOKEN_STORAGE_KEY, result.token);

      return { success: true, message: result.message };
    } catch (err: any) {
      console.error("Registration error:", err);
      const msg = "Unable to complete registration. Please try again.";
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setIsLoading(false);
      toast.success("You have been signed out.");
    }
  };

  // Update Profile
  const updateProfile = async (formData: any) => {
    if (!user) {
      return { success: false, message: "Not authenticated" };
    }

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, user_id: user.id }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        const errorMsg = result.message || "Failed to update profile.";
        toast.error(errorMsg);
        return { success: false, message: errorMsg };
      }

      setUser(result.user);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user));
      toast.success(result.message || "Profile updated successfully.");
      return { success: true, message: result.message };
    } catch (err: any) {
      console.error("Update profile error:", err);
      const msg = "Failed to update profile.";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Refresh User
  const refreshUser = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/auth/me?user_id=${user.id}`);
      const data = await res.json();
      if (data?.success && data.user) {
        setUser(data.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      }
    } catch (e) {
      console.error("Failed to refresh user:", e);
    }
  }, [user?.id]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
