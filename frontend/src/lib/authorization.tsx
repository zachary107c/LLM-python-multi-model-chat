import * as React from 'react';
import { useUser } from './auth';

export const useAuthorization = () => {
  const user = useUser();

  if (!user.data) {
    throw Error('User does not exist!');
  }

  const isAuthenticated = !!user.data;
  return { isAuthenticated };
};

type AuthorizationProps = {
  forbiddenFallback?: React.ReactNode;
  children: React.ReactNode;
  policyCheck?: boolean;
};

export const Authorization = ({
  policyCheck,
  forbiddenFallback = null,
  children,
}: AuthorizationProps) => {
  const { isAuthenticated } = useAuthorization();
  const canAccess = isAuthenticated && (typeof policyCheck === 'undefined' || policyCheck);
  return <>{canAccess ? children : forbiddenFallback}</>;
};