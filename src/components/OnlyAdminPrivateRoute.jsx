import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

export default function OnlyAdminPrivateRoute() {
  const { currentUser, initialized } = useSelector((state) => state.user);
  const allowedRoles = ['ADMIN', 'MANAGER', 'EDITOR', 'VIEWER'];
  if (!initialized) return null;
  return currentUser && allowedRoles.includes(currentUser.role) ? (
    <Outlet />
  ) : (
    <Navigate to='/sign-in' />
  );
}
