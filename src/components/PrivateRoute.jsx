import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';

export default function PrivateRoute() {
  const { currentUser, initialized, token, loading } = useSelector((state) => state.user);
  const isCheckingSession = !initialized || loading || (!!token && !currentUser);

  if (isCheckingSession) {
    return <LoadingScreen label='Vérification de la session...' />;
  }

  return currentUser ? <Outlet /> : <Navigate to='/sign-in' />;
}
