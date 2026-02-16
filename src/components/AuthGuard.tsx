
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// We import the context value directly to gracefully handle cases
// where the provider hasn't mounted yet (e.g., during HMR)
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
