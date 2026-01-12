import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Loader2, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';

interface AvailableUser {
  id: string;
  name: string;
  display_name: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<AvailableUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  // Load available users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { users: availableUsers } = await api.getAvailableUsers();
        setUsers(availableUsers);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setIsLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  // Redirect if already logged in
  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSelectUser = async (userName: string) => {
    setError('');
    setIsLoggingIn(true);

    try {
      await login(userName);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoadingUsers) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 flex flex-col justify-center max-w-md mx-auto">
      <div className="flex-1 flex flex-col justify-center space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-serif font-bold">Fundraise Swap</h1>
          <p className="text-muted-foreground">Select your account to continue</p>
        </div>

        <div className="space-y-3">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleSelectUser(user.name)}
              disabled={isLoggingIn}
              className="w-full bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon size={28} className="text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-lg font-semibold text-foreground">{user.display_name}</p>
                <p className="text-sm text-muted-foreground">@{user.name}</p>
              </div>
              {isLoggingIn && (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              )}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        {users.length === 0 && !error && (
          <p className="text-sm text-muted-foreground text-center">
            No users available. Please contact an administrator.
          </p>
        )}
      </div>
    </div>
  );
}
