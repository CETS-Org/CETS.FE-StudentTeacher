import { Navigate, useLocation } from 'react-router-dom';
import { isTokenValid, getUserRole } from '@/lib/utils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

/**
 * ProtectedRoute component that handles authentication and role-based access control
 * 
 * @param children - The component to render if access is granted
 * @param allowedRoles - Array of role names that can access this route (e.g., ['Student', 'Teacher'])
 * @param requireAuth - If true, requires authentication. If false, redirects authenticated users away
 */
export default function ProtectedRoute({ 
  children, 
  allowedRoles = [],
  requireAuth = true 
}: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = isTokenValid();
  const userRole = getUserRole();

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirect to login with return URL
    return (
      <Navigate 
        to="/login" 
        state={{ returnUrl: location.pathname, message: "Please log in to access this page." }} 
        replace 
      />
    );
  }

  // If route requires specific roles
  if (requireAuth && allowedRoles.length > 0) {
    // Check if user has one of the allowed roles
    const hasAllowedRole = userRole && allowedRoles.some(
      role => role.toLowerCase() === userRole.toLowerCase()
    );

    if (!hasAllowedRole) {
      // Redirect based on user's role or to home if no role
      if (userRole?.toLowerCase() === 'student') {
        return <Navigate to="/student/my-classes" replace />;
      } else if (userRole?.toLowerCase() === 'teacher') {
        return <Navigate to="/courses" replace />;
      } else {
        // Unknown role or no role, redirect to courses page
        return <Navigate to="/courses" replace />;
      }
    }
  }

  // If route should not be accessible to authenticated users (e.g., login page)
  if (!requireAuth && isAuthenticated) {
    // Redirect authenticated users to their default page
    if (userRole?.toLowerCase() === 'student') {
      return <Navigate to="/student/my-classes" replace />;
    } else if (userRole?.toLowerCase() === 'teacher') {
      return <Navigate to="/courses" replace />;
    } else {
      return <Navigate to="/courses" replace />;
    }
  }

  return <>{children}</>;
}

