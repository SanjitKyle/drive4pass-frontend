import { Navigate } from 'react-router-dom';
import { AuthService } from '../services/auth.service';

const ProtectedRoute = ({ children, roles }) => {
  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const userRole = AuthService.getRole();

  if (roles && !roles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
