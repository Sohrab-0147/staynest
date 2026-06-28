import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Protects routes that require MANAGER role.
 * Must be nested inside <ProtectedRoute> so we only reach here
 * when the user is already authenticated.
 *
 * - While bootstrapping → spinner
 * - Authenticated but not MANAGER → redirect to /
 * - MANAGER → render child routes
 */
export default function AdminRoute() {
  const { isManager, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner size="page" label="Verifying access…" />;
  }

  if (!isManager) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
