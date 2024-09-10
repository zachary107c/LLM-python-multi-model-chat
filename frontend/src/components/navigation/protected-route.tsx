import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Function to check if a CSRF token exists in the cookies
const hasCSRFToken = (): boolean => {
  const csrfToken = Cookies.get('access_token'); // Retrieve the csrf token from cookies
  console.log(csrfToken);
  return !!csrfToken; // Return true if the csrf token exists
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!hasCSRFToken()) {
    // If there is no CSRF token, redirect to the login page
    return <Navigate to="/login" />;
  }

  // Else, render the children (the protected content)
  return <>{children}</>;
};

export default ProtectedRoute;