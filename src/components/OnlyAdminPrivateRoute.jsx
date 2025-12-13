import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

export default function OnlyAdminPrivateRoute() {
  const { currentUser, initialized } = useSelector((state) => state.user);
  if (!initialized) return null;
  return currentUser && currentUser.role === 'ADMIN' ? (
    <Outlet />
  ) : (
    <Navigate to='/sign-in' />
  );
}
