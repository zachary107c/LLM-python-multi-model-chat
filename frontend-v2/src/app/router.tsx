import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { UserSettingsProvider } from "@/features/userSettings/providers/user-settings-provider";

import { ProtectedRoute } from "@/lib/auth";

import { AppRoot } from "@/app/routes/app/root";

export const createAppRouter = (_queryClient: QueryClient) =>
  createBrowserRouter([
    {
      path: "register",
      lazy: async () => {
        const { RegisterRoute } = await import("@/app/routes/auth/register");
        return { Component: RegisterRoute };
      },
    },
    {
      path: "login",
      lazy: async () => {
        const { LoginRoute } = await import("@/app/routes/auth/login");
        return { Component: LoginRoute };
      },
    },
    {
      path: "logged-out",
      lazy: async () => {
        const { LoggedOutRoute } = await import("@/app/routes/auth/logged-out");
        return { Component: LoggedOutRoute };
      },
    },
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <UserSettingsProvider>
            <AppRoot />
          </UserSettingsProvider>
        </ProtectedRoute>
      ),
      children: [
        {
          path: "",
          lazy: async () => {
            const { ChatRoute } = await import("@/app/routes/app/chat");
            return { Component: ChatRoute };
          },
        },
        {
          path: "chat",
          lazy: async () => {
            const { ChatRoute } = await import("@/app/routes/app/chat");
            return { Component: ChatRoute };
          },
        },
        {
          path: "profile",
          lazy: async () => {
            const { ProfileRoute } = await import("@/app/routes/app/profile");
            return { Component: ProfileRoute };
          },
        },
      ],
    },
    {
      path: "*",
      lazy: async () => {
        const { NotFoundRoute } = await import("@/app/routes/not-found");
        return { Component: NotFoundRoute };
      },
    },
  ]);

export const AppRouter = () => {
  const queryClient = useQueryClient();
  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);
  return <RouterProvider router={router} />;
};
