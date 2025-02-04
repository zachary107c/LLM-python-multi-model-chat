import { useNavigate, useSearchParams } from 'react-router';

import { AuthLayout } from '@/components/layouts/auth-layout';
import { LoginForm } from '@/features/auth/components/login-form';

export const LoginRoute = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  return (
    <AuthLayout>
      <LoginForm
        onSuccess={() => {
          navigate(
            `${redirectTo ? `${redirectTo}` : ''}`,
            {
              replace: true,
            },
          );
        }}
      />
    </AuthLayout>
  );
};