import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AccessDenied } from './AccessDenied';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="content">
        <div className="loader">Chargement de la session...</div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    const returnTo = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <AccessDenied
        title="Accès refusé"
        message="Vous devez être administrateur pour accéder à cette interface."
      />
    );
  }

  return children;
};
