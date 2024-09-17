import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Function to check if a CSRF token exists in the cookies
const hasToken = (): boolean => {
  const token = Cookies.get('token'); // Retrieve the csrf token from cookies
  return !!token; // Return true if the csrf token exists
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!hasToken()) {
    // If there is no CSRF token, redirect to the login page
    return <Navigate to="/login" />;
  }

  // Else, render the children (the protected content)
  return <>{children}</>;
};

export default ProtectedRoute;