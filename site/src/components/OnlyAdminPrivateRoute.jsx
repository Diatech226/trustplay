import { useSelector } from 'react-redux';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';

export default function OnlyAdminPrivateRoute() {
  const { currentUser, initialized, token, loading } = useSelector((state) => state.user);
  const location = useLocation();
  const isCheckingSession = !initialized || loading || (!!token && !currentUser);
  const isAdmin = currentUser?.role === 'ADMIN';

  if (isCheckingSession) {
    return <LoadingScreen label='Vérification des droits...' />;
  }
  if (!currentUser) {
    return <Navigate to='/sign-in' state={{ from: location }} replace />;
  }

  if (isAdmin) {
    return <Outlet />;
  }

  return (
    <div className='flex min-h-[50vh] items-center justify-center px-4 text-center text-slate-500'>
      <p>Accès refusé. Vous devez être administrateur pour consulter cette page.</p>
    </div>
  );
}
