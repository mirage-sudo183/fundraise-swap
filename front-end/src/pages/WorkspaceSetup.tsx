import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Plus, Users, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Mode = 'select' | 'create' | 'join';

export default function WorkspaceSetup() {
  const navigate = useNavigate();
  const { isAuthenticated, workspace, createWorkspace, joinWorkspace, isLoading: authLoading } = useAuth();
  const [mode, setMode] = useState<Mode>('select');
  const [workspaceName, setWorkspaceName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not logged in
  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect if already in workspace
  if (workspace) {
    return <Navigate to="/" replace />;
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!workspaceName.trim()) {
      setError('Please enter a workspace name');
      return;
    }

    setIsLoading(true);
    try {
      await createWorkspace(workspaceName.trim());
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    setIsLoading(true);
    try {
      await joinWorkspace(inviteCode.trim());
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join workspace');
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'create') {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex flex-col max-w-md mx-auto">
        <button
          onClick={() => setMode('select')}
          className="text-muted-foreground text-sm mb-4 text-left"
        >
          &larr; Back
        </button>

        <div className="pt-4 pb-8">
          <h1 className="text-2xl font-serif font-bold mb-2">Create Workspace</h1>
          <p className="text-muted-foreground">
            Start a new workspace with your co-founder
          </p>
        </div>

        <form onSubmit={handleCreate} className="flex-1 flex flex-col">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Workspace Name
              </label>
              <input
                id="name"
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="e.g., Acme Ventures"
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:outline-none transition-colors"
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="mt-auto pb-8">
            <button
              type="submit"
              disabled={isLoading || !workspaceName.trim()}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Workspace
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex flex-col max-w-md mx-auto">
        <button
          onClick={() => setMode('select')}
          className="text-muted-foreground text-sm mb-4 text-left"
        >
          &larr; Back
        </button>

        <div className="pt-4 pb-8">
          <h1 className="text-2xl font-serif font-bold mb-2">Join Workspace</h1>
          <p className="text-muted-foreground">
            Enter the invite code from your co-founder
          </p>
        </div>

        <form onSubmit={handleJoin} className="flex-1 flex flex-col">
          <div className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium mb-2">
                Invite Code
              </label>
              <input
                id="code"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC123"
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:outline-none transition-colors text-center text-2xl tracking-widest font-mono"
                maxLength={6}
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="mt-auto pb-8">
            <button
              type="submit"
              disabled={isLoading || !inviteCode.trim()}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Join Workspace
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Selection mode
  return (
    <div className="min-h-screen bg-background text-foreground p-6 flex flex-col max-w-md mx-auto">
      <header className="py-6">
        <h1 className="text-2xl font-serif font-bold">Setup Workspace</h1>
      </header>

      <div className="flex-1 flex flex-col gap-4 justify-center -mt-10">
        <button
          onClick={() => setMode('create')}
          className="group relative bg-card hover:bg-secondary/50 border border-border rounded-2xl p-6 text-left transition-all shadow-sm hover:shadow-md"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-1">Create New Workspace</h3>
          <p className="text-sm text-muted-foreground">Start a fresh intuition-alignment space for you and your co-founder.</p>
          <ArrowRight className="absolute right-6 top-6 text-muted-foreground/50 group-hover:text-primary transition-colors" size={20} />
        </button>

        <div className="flex items-center gap-4 my-2">
          <div className="h-px bg-border flex-1" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Or</span>
          <div className="h-px bg-border flex-1" />
        </div>

        <button
          onClick={() => setMode('join')}
          className="group relative bg-card hover:bg-secondary/50 border border-border rounded-2xl p-6 text-left transition-all shadow-sm hover:shadow-md"
        >
          <div className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-1">Join Existing</h3>
          <p className="text-sm text-muted-foreground">Enter an invite code to join your co-founder's workspace.</p>
          <ArrowRight className="absolute right-6 top-6 text-muted-foreground/50 group-hover:text-foreground transition-colors" size={20} />
        </button>
      </div>
    </div>
  );
}
