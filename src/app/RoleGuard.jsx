import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './providers/useAuth';
import LoadingState from '../shared/components/LoadingState/LoadingState';

function RoleGuard({ allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <LoadingState message="Checking your session..." />
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  /*
   * Temporary password protection.
   *
   * Users who must change their temporary password
   * may only access the change-password page.
   */
  if (
    user.mustChangePassword === true &&
    location.pathname !== '/change-password'
  ) {
    return (
      <Navigate
        to="/change-password"
        replace
      />
    );
  }

  /*
   * Role protection.
   */
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}

export default RoleGuard;