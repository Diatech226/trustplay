import { useSelector } from 'react-redux';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';

export default function PrivateRoute() {
  const { currentUser, initialized, token, loading } = useSelector((state) => state.user);
  const location = useLocation();
  const isCheckingSession = !initialized || loading || (!!token && !currentUser);

  if (isCheckingSession) {
    return <LoadingScreen label='Vérification de la session...' />;
  }

  if (currentUser) {
    return <Outlet />;
  }

  const returnTo = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
  return (
    <Navigate
      to={`/sign-in${returnTo ? `?returnTo=${returnTo}` : ''}`}
      state={{ from: location }}
      replace
    />
  );
}
