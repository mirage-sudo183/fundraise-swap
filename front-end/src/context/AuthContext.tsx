/**
 * Auth Context
 *
 * Provides user authentication state throughout the app.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as api from '../api/client';

interface AuthContextValue {
  user: api.User | null;
  workspace: api.Workspace | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (name: string) => Promise<void>;
  logout: () => Promise<void>;
  createWorkspace: (name: string) => Promise<void>;
  joinWorkspace: (inviteCode: string) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<api.User | null>(null);
  const [workspace, setWorkspace] = useState<api.Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = async () => {
    if (!api.isLoggedIn()) {
      setUser(null);
      setWorkspace(null);
      setIsLoading(false);
      return;
    }

    try {
      const { user, workspace } = await api.getMe();
      setUser(user);
      setWorkspace(workspace);
    } catch (err) {
      console.error('[Auth] Failed to refresh:', err);
      setUser(null);
      setWorkspace(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const login = async (name: string) => {
    const { user } = await api.login(name);
    setUser(user);
    await refreshAuth(); // Get workspace info
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setWorkspace(null);
  };

  const createWorkspace = async (name: string) => {
    const { workspace } = await api.createWorkspace(name);
    setWorkspace(workspace);
    await refreshAuth(); // Refresh user with workspace_id
  };

  const joinWorkspace = async (inviteCode: string) => {
    const { workspace } = await api.joinWorkspace(inviteCode);
    setWorkspace(workspace);
    await refreshAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        createWorkspace,
        joinWorkspace,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
