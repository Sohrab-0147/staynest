import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Protects any route that requires authentication.
 * - While AuthContext is bootstrapping → show full-page spinner
 * - If not authenticated → redirect to /login, preserving the intended URL
 * - If authenticated → render child routes via <Outlet />
 */
export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner size="page" label="Checking session…" />;
  }

  if (!isAuthenticated) {
    // Save the page they tried to visit so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
