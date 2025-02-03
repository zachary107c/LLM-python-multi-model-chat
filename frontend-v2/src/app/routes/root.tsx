import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet, useLocation } from 'react-router-dom';
import HashLoader from 'react-spinners/HashLoader';
import { AppLayout } from '@/components/layouts/main-layout';

export const AppRoot = () => {
  const location = useLocation();

  return (
    <AppLayout>
      <Suspense
        fallback={
          <div className="flex justify-center items-center size-full">
            <HashLoader size={300} />
          </div>
        }
      >
        <ErrorBoundary key={location.pathname} fallback={<div>Erm chat</div>}>
          <Outlet />
        </ErrorBoundary>
      </Suspense>
    </AppLayout>
  );
};