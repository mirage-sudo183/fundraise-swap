import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { DeviceGate } from './components/DeviceGate';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import WorkspaceSetup from './pages/WorkspaceSetup';
import Settings from './pages/Settings';
import Inbox from './pages/Inbox';
import MatchDetail from './pages/MatchDetail';
import NotFound from './pages/NotFound';
import Debug from './pages/Debug';

function LoadingScreen() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-background text-foreground">
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, workspace } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but no workspace, redirect to workspace setup
  if (!workspace) {
    return <Navigate to="/workspace-setup" replace />;
  }

  return <>{children}</>;
}

function AppContent({ bypassDeviceGate }: { bypassDeviceGate: boolean }) {
  const [isMobile, setIsMobile] = useState(true);
  const { isLoading } = useAuth();

  useEffect(() => {
    const checkDevice = () => {
      const isDesktop = window.innerWidth >= 768;
      setIsMobile(!isDesktop);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Show loading state while auth initializes
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Force Device Gate on desktop (unless bypassed for dev/preview)
  if (!isMobile && !bypassDeviceGate) {
    return <DeviceGate />;
  }

  return (
    <div className="h-full">
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/workspace-setup" element={<WorkspaceSetup />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <Inbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inbox/:id"
          element={
            <ProtectedRoute>
              <MatchDetail />
            </ProtectedRoute>
          }
        />
        <Route path="/debug" element={<Debug />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export function CoFounderSwipeApp({ bypassDeviceGate = false }: { bypassDeviceGate?: boolean }) {
  return (
    <HashRouter>
      <AuthProvider>
        <div className="h-full">
          <AppContent bypassDeviceGate={bypassDeviceGate} />
        </div>
      </AuthProvider>
    </HashRouter>
  );
}

export default CoFounderSwipeApp;
