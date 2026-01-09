import { ProtectedRoute } from './ProtectedRoute';

export const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole="ADMIN">{children}</ProtectedRoute>
);
