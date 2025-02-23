import * as React from "react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { Link } from "@/components/ui/link";
import { useUser } from "@/lib/auth";

type LayoutProps = {
  children: React.ReactNode;
  title?: string;
};

export const AuthLayout = ({ children, title }: LayoutProps) => {
  const user = useUser();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const navigate = useNavigate();

  useEffect(() => {
    if (user.data) {
      navigate(redirectTo ? redirectTo : "/", {
        replace: true,
      });
    }
  }, [user.data, navigate, redirectTo]);

  return (
    <>
      <div className="flex min-h-screen flex-col justify-center bg-background py-12 sm:px-6 lg:px-8 w-full">
        <div className="sm:mx-auto sm:w-full sm:max-w-md w-full mb-2">
          <div className="flex justify-center">
            <Link
              className="flex items-center text-foreground"
              to="/"
              replace
            ></Link>
          </div>

          {title && (
            <h2 className="mt-3 text-center text-3xl font-extrabold text-foreground">
              {title}
            </h2>
          )}
        </div>
        {children}
      </div>
    </>
  );
};
