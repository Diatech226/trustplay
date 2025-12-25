import { useSelector } from 'react-redux';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';

export default function OnlyAdminPrivateRoute() {
  const { currentUser, initialized, token, loading } = useSelector((state) => state.user);
  const location = useLocation();
  const allowedRoles = ['ADMIN', 'EDITOR', 'AUTHOR'];
  const isCheckingSession = !initialized || loading || (!!token && !currentUser);

  if (isCheckingSession) {
    return <LoadingScreen label='Vérification des droits...' />;
  }
  return currentUser && allowedRoles.includes(currentUser.role) ? (
    <Outlet />
  ) : (
    <Navigate to='/sign-in' state={{ from: location }} replace />
  );
}
