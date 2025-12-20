import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';

export default function OnlyAdminPrivateRoute() {
  const { currentUser, initialized, token, loading } = useSelector((state) => state.user);
  const allowedRoles = ['ADMIN', 'MANAGER', 'EDITOR', 'VIEWER'];
  const isCheckingSession = !initialized || loading || (!!token && !currentUser);

  if (isCheckingSession) {
    return <LoadingScreen label='Vérification des droits...' />;
  }
  return currentUser && allowedRoles.includes(currentUser.role) ? (
    <Outlet />
  ) : (
    <Navigate to='/sign-in' />
  );
}
