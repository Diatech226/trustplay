import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

export default function PrivateRoute() {
  const { currentUser, initialized } = useSelector((state) => state.user);
  if (!initialized) return null;
  return currentUser ? <Outlet /> : <Navigate to='/sign-in' />;
}
